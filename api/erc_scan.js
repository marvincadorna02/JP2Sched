// api/erc_scan.js
//
// Vercel Node serverless function (the only server-side code left).
//   POST application/json  { image: <base64 string>, mimeType: <string> }
//   Returns:               { subjects: [ {name, code, room, day, start, end}, ... ], student: {...} }
//
// It stores nothing — no database, no auth, no file uploads. The browser keeps
// the whole schedule in localStorage; this endpoint only forwards the photo to
// Gemini and returns the parsed rows for the review screen. The API key stays
// server-side (Vercel env var), never shipped to the browser.

const PROMPT = `This image is a student's ERC (enrollment/registration card) or class schedule.
The photo may be sideways or rotated — read it in whatever orientation makes
the text upright and legible before extracting anything.

The schedule is usually a table with columns like: subject code, subject
title, units, and a schedule column showing time, day(s), and room — e.g.
"600PM-800PM T D31" means 6:00-8:00 PM, Tuesday, Room D31. A single subject
row can list more than one meeting (different day/time/room pairs, sometimes
on separate lines within the same row for lecture vs lab).

Read ONE ROW AT A TIME, left to right, and keep every meeting's day, time,
and room grouped with the correct subject on that same row — do not let a
room or time from one row drift onto a neighboring subject. If a subject
meets on multiple days at the same time and room (e.g. "MTW" or "ThF"),
create one JSON object per day but keep them all attached to that subject's
name and code. Double-check before answering: for every subject, the room
and time you output must be the ones printed on that subject's own row, not
a nearby row's.

Extract every class meeting as JSON. A subject that meets on multiple days
(e.g. Mon and Wed) should appear as a separate object per day.

Also read the student header info printed above the subject table (usually
near the top of the card): the student's full name, their school/student ID
number (often in parentheses next to the name), their course/program title
(e.g. "Bachelor of Science in Information Technology"), their year level if
shown (e.g. "3rd Year", sometimes abbreviated like "Yr Level 3"), and whether
they're enrolled as a Regular or Special/Irregular student (this may be
printed directly, e.g. "OC" commonly means Regular/On Campus and "OFF"/
"IRREG" means Special/Irregular — infer your best guess if it's abbreviated,
otherwise leave it blank).

Respond with ONLY a JSON object, no markdown fences, no explanation, in this exact shape:
{
  "student": {
    "full_name": "Dela Cruz, Juan P.",
    "school_id": "20230834",
    "course": "Bachelor of Science in Information Technology",
    "year_level": "3rd Year",
    "program_type": "Regular"
  },
  "subjects": [
    { "name": "Data Structures", "code": "CS 211", "room": "IT-204", "day": "Mon", "start": "08:00", "end": "09:30" }
  ]
}

Rules:
- "day" must be one of: Mon, Tue, Wed, Thu, Fri, Sat
- "start" and "end" must be 24-hour "HH:MM"
- "program_type" must be exactly "Regular", "Special", or "" if you can't tell
- If a field isn't visible on the card, use an empty string for it
- If you can't read the image at all, respond with { "student": {}, "subjects": [] }`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "GEMINI_API_KEY is not set. Add it in your Vercel project → Settings → Environment Variables (free key at https://aistudio.google.com/apikey).",
    });
    return;
  }

  // Vercel parses JSON bodies automatically, but guard for a raw string too.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const image = body?.image;
  const mimeType = body?.mimeType || "image/jpeg";
  if (!image) {
    res.status(422).json({ error: "No image provided" });
    return;
  }

  // gemini-3.1-flash-lite was what the old PHP used; keep it overridable so a
  // wrong/retired model name can be fixed with an env var, no code change.
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  const payload = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: image } },
          { text: PROMPT },
        ],
      },
    ],
    // Forces Gemini to return raw JSON (no ```json fences to strip).
    generationConfig: { responseMimeType: "application/json" },
  };

  let httpStatus;
  let raw;
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload),
      }
    );
    httpStatus = r.status;
    raw = await r.text();
  } catch (err) {
    res.status(502).json({ error: "AI request failed", detail: String(err) });
    return;
  }

  if (httpStatus !== 200) {
    res.status(502).json({ error: "AI request failed", detail: raw });
    return;
  }

  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    result = {};
  }
  let rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

  // The model sometimes wraps JSON in ```json fences despite instructions.
  rawText = rawText.replace(/^```json/m, "").replace(/```$/m, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {};
  }
  const subjects = Array.isArray(parsed?.subjects) ? parsed.subjects : [];
  const student =
    parsed?.student && typeof parsed.student === "object" ? parsed.student : {};

  // Temporary ids so the frontend review table can key/edit rows.
  subjects.forEach((s, i) => {
    s.id = i + 1;
  });

  res.status(200).json({ subjects, student });
}
