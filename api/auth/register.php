<?php
// api/auth/register.php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/current_user.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$fullName = trim($data['full_name'] ?? '');
$email = trim(strtolower($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($fullName === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Full name, email, and password are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['message' => 'Password must be at least 8 characters.']);
    exit;
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['message' => 'An account with that email already exists.']);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)'
);
$stmt->execute([$fullName, $email, $hash]);
$userId = (int) $pdo->lastInsertId();

$token = createSession($pdo, $userId);

http_response_code(201);
echo json_encode([
    'token' => $token,
    'user' => [
        'id' => $userId,
        'full_name' => $fullName,
        'email' => $email,
    ],
]);