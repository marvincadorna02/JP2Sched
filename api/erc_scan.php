<?php
// api/erc_scan.php
//   POST multipart/form-data, field name "erc" = the image file
//   Returns: { "subjects": [ {name, code, room, day, start, end}, ... ] }
//
// This does NOT save anything to the `subjects` table — it only logs
// the scan and returns the parsed rows. The frontend shows them on the
// review screen, the student edits/removes what's wrong, then confirms
// via POST /api/subjects_bulk.php.

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/current_user.php";
require_once __DIR__ . "/../config/env.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

loadEnv();
$apiKey = getenv("GEMINI_API_KEY");
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(["error" => "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and put it in .env"]);
    exit;
}

if (empty($_FILES["erc"])) {
    http_response_code(422);
    echo json_encode(["error" => "No file uploaded under field name 'erc'"]);
    exit;
}

$file = $_FILES["erc"];
$allowedTypes = ["image/jpeg", "image/png", "image/webp"];
if (!in_array($file["type"], $allowedTypes)) {
    http_response_code(422);
    echo json_encode(["error" => "Only JPEG, PNG, or WEBP images are supported"]);
    exit;
}

$pdo = getDbConnection();
$userId = getCurrentUserId($pdo);

// Save a copy so the scan can be inspected or reprocessed later.
$uploadDir = __DIR__ . "/../uploads/erc/";
$filename = uniqid("erc_") . "_" . basename($file["name"]);
move_uploaded_file($file["tmp_name"], $uploadDir . $filename);

$imageData = base64_encode(file_get_contents($uploadDir . $filename));

// Log the scan as "processing" before calling the API, so a crash mid-request
// still leaves a record you can find.
$logStmt = $pdo->prepare(
    "INSERT INTO erc_scans (user_id, image_path, status) VALUES (?, ?, 'processing')"
);
$logStmt->execute([$userId, "uploads/erc/" . $filename]);
$scanId = (int) $pdo->lastInsertId();

// --- Call Gemini's vision API --------------------------------------------
$prompt = <<<PROMPT
This image is a student's ERC (enrollment/registration card) or class schedule.
The photo may be sideways or rotated — read it in whatever orientation makes
the text upright and legible before extracting anything.

The schedule is usually a table with columns like: subject code, subject
title, units, and a schedule column showing time, day(s), and room — e.g.
"600PM-800PM T D31" means 6:00-8:00 PM, Tuesday, Room D31. A single subject
row can list more than one meeting (different day/time/room pairs, sometimes
on separate lines within the same row for lecture vs lab).

Read ONE ROW AT A TIME, left to right, and keep every meeting's day, time,
and room grouped with the correct subject on that same row — do not let a
room or time from one row drift onto a neighboring subject. If a subject
meets on multiple days at the same time and room (e.g. "MTW" or "ThF"),
create one JSON object per day but keep them all attached to that subject's
name and code. Double-check before answering: for every subject, the room
and time you output must be the ones printed on that subject's own row, not
a nearby row's.

Extract every class meeting as JSON. A subject that meets on multiple days
(e.g. Mon and Wed) should appear as a separate object per day.

Also read the student header info printed above the subject table (usually
near the top of the card): the student's full name, their school/student ID
number (often in parentheses next to the name), their course/program title
(e.g. "Bachelor of Science in Information Technology"), their year level if
shown (e.g. "3rd Year", sometimes abbreviated like "Yr Level 3"), and whether
they're enrolled as a Regular or Special/Irregular student (this may be
printed directly, e.g. "OC" commonly means Regular/On Campus and "OFF"/
"IRREG" means Special/Irregular — infer your best guess if it's abbreviated,
otherwise leave it blank).

Respond with ONLY a JSON object, no markdown fences, no explanation, in this exact shape:
{
  "student": {
    "full_name": "Dela Cruz, Juan P.",
    "school_id": "20230834",
    "course": "Bachelor of Science in Information Technology",
    "year_level": "3rd Year",
    "program_type": "Regular"
  },
  "subjects": [
    { "name": "Data Structures", "code": "CS 211", "room": "IT-204", "day": "Mon", "start": "08:00", "end": "09:30" }
  ]
}

Rules:
- "day" must be one of: Mon, Tue, Wed, Thu, Fri, Sat
- "start" and "end" must be 24-hour "HH:MM"
- "program_type" must be exactly "Regular", "Special", or "" if you can't tell
- If a field isn't visible on the card, use an empty string for it
- If you can't read the image at all, respond with { "student": {}, "subjects": [] }
PROMPT;

// gemini-2.5-flash has been retired. gemini-3.1-flash-lite is the current
// stable Gemini 3 model that's still on the free tier.
$model = "gemini-3.1-flash-lite";

$payload = [
    "contents" => [[
        "parts" => [
            [
                "inline_data" => [
                    "mime_type" => $file["type"],
                    "data" => $imageData,
                ],
            ],
            ["text" => $prompt],
        ],
    ]],
    // Forces Gemini to return raw JSON (no ```json fences to strip).
    "generationConfig" => [
        "responseMimeType" => "application/json",
    ],
];

$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-goog-api-key: $apiKey",
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 60,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode !== 200) {
    $pdo->prepare("UPDATE erc_scans SET status = 'failed' WHERE id = ?")->execute([$scanId]);
    http_response_code(502);
    echo json_encode(["error" => "AI request failed", "detail" => $curlError ?: $response]);
    exit;
}

$result = json_decode($response, true);
$rawText = $result["candidates"][0]["content"]["parts"][0]["text"] ?? "[]";

// The model sometimes wraps JSON in ```json fences despite instructions — strip them defensively.
$rawText = trim(preg_replace('/^```json|```$/m', "", $rawText));

$parsed = json_decode($rawText, true);
$subjects = is_array($parsed["subjects"] ?? null) ? $parsed["subjects"] : [];
$student = is_array($parsed["student"] ?? null) ? $parsed["student"] : [];

// Give each row a temporary client-side id so the frontend review table can key/edit them.
foreach ($subjects as $i => &$s) {
    $s["id"] = $i + 1;
}
unset($s);

// Auto-fill the student's profile from the scan, but only fields that are
// still empty — never overwrite something the student already set/confirmed.
$profileFields = ["full_name", "school_id", "course", "year_level", "program_type"];
$setClauses = [];
$setValues = [];
foreach ($profileFields as $field) {
    $value = trim((string) ($student[$field] ?? ""));
    if ($value === "") continue;
    $setClauses[] = "$field = IF($field IS NULL OR $field = '', ?, $field)";
    $setValues[] = $value;
}
if (!empty($setClauses)) {
    $setValues[] = $userId;
    $pdo->prepare("UPDATE users SET " . implode(", ", $setClauses) . " WHERE id = ?")->execute($setValues);
}

$pdo->prepare(
    "UPDATE erc_scans SET status = 'completed', subjects_found = ?, raw_ai_response = ? WHERE id = ?"
)->execute([count($subjects), $response, $scanId]);

echo json_encode(["scan_id" => $scanId, "subjects" => $subjects, "student" => $student]);