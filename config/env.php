<?php
// config/env.php — minimal .env reader so we don't need composer for one variable

function loadEnv(): void
{
    $path = __DIR__ . "/../.env";
    if (!file_exists($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), "#") || !str_contains($line, "=")) {
            continue;
        }
        [$key, $value] = explode("=", $line, 2);
        putenv(trim($key) . "=" . trim($value));
    }
}
