# JP2Sched Backend Setup

## 1. Database
Import `jp2sched-database.sql` (from the earlier message) into MySQL — via
phpMyAdmin or:
```
mysql -u root -p < jp2sched-database.sql
```

## 2. Place this folder
Drop `jp2sched-backend/` into your XAMPP `htdocs/` folder so it's reachable at
`http://localhost/jp2sched-backend/`.

## 3. Configure
- `config/database.php` — check the `$user` / `$pass` match your MySQL setup
  (XAMPP default is usually `root` with an empty password).
- Copy `.env.example` to `.env` and paste in a real key from
  https://console.anthropic.com/settings/keys

## 4. Test the endpoints directly (before wiring the frontend)

**Add a subject:**
```
curl -X POST http://localhost/jp2sched-backend/api/subjects.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Data Structures","code":"CS 211","room":"IT-204","day":"Mon","start":"08:00","end":"09:30"}'
```

**List subjects:**
```
curl http://localhost/jp2sched-backend/api/subjects.php
```

**Scan an ERC:**
```
curl -X POST http://localhost/jp2sched-backend/api/erc_scan.php \
  -F "erc=@/path/to/your/erc-photo.jpg"
```
This should return `{"scan_id": ..., "subjects": [...]}`. Check the `erc_scans`
table afterward — `raw_ai_response` has the full model output if anything looks off.

**Confirm the scan into the real schedule:**
```
curl -X POST http://localhost/jp2sched-backend/api/subjects_bulk.php \
  -H "Content-Type: application/json" \
  -d '{"subjects":[{"name":"Data Structures","code":"CS 211","room":"IT-204","day":"Mon","start":"08:00","end":"09:30"}]}'
```

## 5. Point the frontend at it
In `jp2sched-frontend/vite.config.js`, the `/api` proxy already targets
`http://localhost/jp2sched-backend`. In each component, swap the mock data /
`setTimeout` calls for real `fetch("/api/...")` calls to these endpoints.

## Notes
- Auth is stubbed (`config/current_user.php` always returns a demo user) so
  you can test subjects + ERC scanning immediately. Build real login against
  the `sessions` table when you're ready, then swap that file's contents.
- `subjects.php` GET/POST have no `?id=`; edit/delete a specific subject
  through `subject_detail.php?id=5`.
