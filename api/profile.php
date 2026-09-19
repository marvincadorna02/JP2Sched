<?php
// api/profile.php
//   GET /api/profile.php -> current student's profile
//   PUT /api/profile.php -> update profile fields
//        body: { "full_name", "school_id", "course", "year_level", "program_type" }

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/current_user.php";

$pdo = getDbConnection();
$userId = getCurrentUserId($pdo);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $pdo->prepare(
        "SELECT full_name, school_id, course, year_level, program_type
         FROM users WHERE id = ?"
    );
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    echo json_encode($profile ?: []);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $body = json_decode(file_get_contents("php://input"), true) ?? [];

    // Only update fields that were actually sent, so a partial payload
    // (e.g. from an ERC scan that only found some fields) doesn't wipe others.
    $fields = [];
    $values = [];
    foreach (["full_name", "school_id", "course", "year_level", "program_type"] as $field) {
        if (array_key_exists($field, $body)) {
            $fields[] = "$field = ?";
            $values[] = $body[$field] === "" ? null : $body[$field];
        }
    }

    if (empty($fields)) {
        http_response_code(422);
        echo json_encode(["error" => "No fields to update"]);
        exit;
    }

    $values[] = $userId;
    $pdo->prepare("UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?")->execute($values);

    echo json_encode(["success" => true]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);