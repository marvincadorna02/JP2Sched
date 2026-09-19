<?php
// config/current_user.php
//
// Real session-based auth. getCurrentUserId() and getActiveTermId() keep the
// exact same signatures as before, so every existing endpoint that already
// calls getCurrentUserId($pdo) keeps working unchanged — only this file and
// the new register.php / login.php needed to be added.

function getBearerToken(): ?string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization']
        ?? $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if (!str_starts_with($auth, 'Bearer ')) {
        return null;
    }
    return substr($auth, 7);
}

function createSession(PDO $pdo, int $userId, int $daysValid = 30): string
{
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime("+{$daysValid} days"));

    $stmt = $pdo->prepare(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
    );
    $stmt->execute([$userId, $token, $expiresAt]);

    return $token;
}

function getCurrentUserId(PDO $pdo): int
{
    $token = getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(["error" => "Not authenticated"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()"
    );
    $stmt->execute([$token]);
    $session = $stmt->fetch();

    if (!$session) {
        http_response_code(401);
        echo json_encode(["error" => "Session expired or invalid, please log in again"]);
        exit;
    }

    return (int) $session["user_id"];
}

function getActiveTermId(PDO $pdo, int $userId): int
{
    $stmt = $pdo->prepare("SELECT id FROM terms WHERE user_id = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$userId]);
    $term = $stmt->fetch();

    if ($term) {
        return (int) $term["id"];
    }

    // No active term yet — create one automatically so testing isn't blocked on setup.
    $stmt = $pdo->prepare("INSERT INTO terms (user_id, label, is_active) VALUES (?, 'Current Term', 1)");
    $stmt->execute([$userId]);
    return (int) $pdo->lastInsertId();
}