<?php
// config/database.php — single PDO connection reused by every endpoint

function getDbConnection(): PDO
{
    $host = "127.0.0.1";
    $dbname = "jp2sched";
    $user = "root";       // change to match your XAMPP/MySQL setup
    $pass = "";           // change to match your XAMPP/MySQL setup

    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $user,
            $pass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
        exit;
    }
}
