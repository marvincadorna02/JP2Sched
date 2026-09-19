<?php
// api/subjects_bulk.php
//   POST body: { "subjects": [ { "name","code","room","day","start","end" }, ... ] }
// Used by the frontend's "Save N subjects" button after ERC review.

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/current_user.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$pdo = getDbConnection();
$userId = getCurrentUserId($pdo);
$termId = getActiveTermId($pdo, $userId);

$body = json_decode(file_get_contents("php://input"), true);
$subjects = $body["subjects"] ?? [];

if (empty($subjects)) {
    http_response_code(422);
    echo json_encode(["error" => "subjects[] is empty"]);
    exit;
}

$stmt = $pdo->prepare(
    "INSERT INTO subjects (user_id, term_id, name, code, room, day, start_time, end_time, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'erc_scan')"
);

$insertedIds = [];
$pdo->beginTransaction();
try {
    foreach ($subjects as $s) {
        $stmt->execute([
            $userId,
            $termId,
            $s["name"],
            $s["code"] ?? null,
            $s["room"] ?? null,
            $s["day"],
            $s["start"],
            $s["end"],
        ]);
        $insertedIds[] = (int) $pdo->lastInsertId();
    }
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Bulk insert failed: " . $e->getMessage()]);
    exit;
}

echo json_encode(["inserted" => count($insertedIds), "ids" => $insertedIds]);
