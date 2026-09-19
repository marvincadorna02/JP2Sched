<?php
// api/subject_detail.php?id=5
//   PUT    -> edit that subject   body: { "name", "code", "room", "day", "start", "end" }
//   DELETE -> delete that subject

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/current_user.php";

$pdo = getDbConnection();
$userId = getCurrentUserId($pdo);

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid ?id="]);
    exit;
}

// Make sure this subject actually belongs to the current user before touching it.
$check = $pdo->prepare("SELECT id FROM subjects WHERE id = ? AND user_id = ?");
$check->execute([$id, $userId]);
if (!$check->fetch()) {
    http_response_code(404);
    echo json_encode(["error" => "Subject not found"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $body = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare(
        "UPDATE subjects SET name = ?, code = ?, room = ?, day = ?, start_time = ?, end_time = ?
         WHERE id = ?"
    );
    $stmt->execute([
        $body["name"],
        $body["code"] ?? null,
        $body["room"] ?? null,
        $body["day"],
        $body["start"],
        $body["end"],
        $id,
    ]);

    echo json_encode(["success" => true]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $pdo->prepare("DELETE FROM subjects WHERE id = ?")->execute([$id]);
    echo json_encode(["success" => true]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
