<?php
// config/cors.php — include this at the top of every api/*.php file.
// Needed because the React dev server (localhost:5173) and the PHP
// server (localhost/jp2sched-backend) run on different ports.

header("Access-Control-Allow-Origin: *"); // tighten this to your real frontend URL in production
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Browsers send a preflight OPTIONS request before PUT/DELETE/POST-with-JSON —
// just acknowledge it and stop, no real work happens on this request.
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}
