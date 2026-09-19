<?php
// api/auth/login.php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/current_user.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$email = trim(strtolower($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Email and password are required.']);
    exit;
}

$pdo = getDbConnection();

$stmt = $pdo->prepare(
    'SELECT id, full_name, email, password_hash FROM users WHERE email = ?'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Incorrect email or password.']);
    exit;
}

$token = createSession($pdo, (int) $user['id']);

echo json_encode([
    'token' => $token,
    'user' => [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
    ],
]);