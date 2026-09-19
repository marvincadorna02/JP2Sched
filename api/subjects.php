<?php
// api/subjects.php
//   GET  /api/subjects.php            -> list this term's subjects
//   POST /api/subjects.php            -> create one subject
//        body: { "name", "code", "room", "day", "start", "end" }

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/current_user.php";

$pdo = getDbConnection();
$userId = getCurrentUserId($pdo);
$termId = getActiveTermId($pdo, $userId);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $pdo->prepare(
        "SELECT id, name, code, room, day,
                TIME_FORMAT(start_time, '%H:%i') AS start,
                TIME_FORMAT(end_time, '%H:%i') AS end,
                source
         FROM subjects
         WHERE user_id = ? AND term_id = ?
         ORDER BY FIELD(day,'Mon','Tue','Wed','Thu','Fri','Sat'), start_time"
    );
    $stmt->execute([$userId, $termId]);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);

    if (empty($body["name"]) || empty($body["day"]) || empty($body["start"]) || empty($body["end"])) {
        http_response_code(422);
        echo json_encode(["error" => "name, day, start, and end are required"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO subjects (user_id, term_id, name, code, room, day, start_time, end_time, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual')"
    );
    $stmt->execute([
        $userId,
        $termId,
        $body["name"],
        $body["code"] ?? null,
        $body["room"] ?? null,
        $body["day"],
        $body["start"],
        $body["end"],
    ]);

    echo json_encode(["id" => (int) $pdo->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
