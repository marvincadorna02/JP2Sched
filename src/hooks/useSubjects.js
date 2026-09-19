import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/api.js";
import { DEFAULT_TERM } from "../utils/terms.js";

// Rows saved before semesters existed fall back to the current term.
const withTerm = (s) => ({ ...s, term: s.term || DEFAULT_TERM });

export default function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/subjects.php")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSubjects(Array.isArray(data) ? data.map(withTerm) : []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your schedule. Is the backend running?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // editing = the subject being edited (keeps its own term), otherwise creates in `term`
  const save = useCallback(async (form, editing, term) => {
    if (editing) {
      const body = { ...form, term: editing.term };
      const res = await apiFetch(`/api/subject_detail.php?id=${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      setSubjects((subs) => subs.map((s) => (s.id === editing.id ? { ...body, id: editing.id } : s)));
    } else {
      const body = { ...form, term };
      const res = await apiFetch("/api/subjects.php", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return;
      setSubjects((subs) => [...subs, { ...body, id: data.id }]);
    }
  }, []);

  const remove = useCallback(async (id) => {
    const res = await apiFetch(`/api/subject_detail.php?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setSubjects((subs) => subs.filter((s) => s.id !== id));
  }, []);

  const removeMany = useCallback(async (ids) => {
    const done = [];
    for (const id of ids) {
      const res = await apiFetch(`/api/subject_detail.php?id=${id}`, { method: "DELETE" });
      if (res.ok) done.push(id);
    }
    setSubjects((subs) => subs.filter((s) => !done.includes(s.id)));
  }, []);

  // ScanERCModal already saved `rows` through /api/subjects_bulk.php.
  // Stopgap: tag them with the selected semester (until subjects_bulk.php saves `term` itself).
  const importRows = useCallback(async (rows, term) => {
    setSubjects((subs) => [...subs, ...rows.map((r) => ({ ...r, term }))]);
    await Promise.all(
      rows
        .filter((r) => r.id && r.term !== term)
        .map((r) =>
          apiFetch(`/api/subject_detail.php?id=${r.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...r, term }),
          }).catch(() => {})
        )
    );
  }, []);

  return { subjects, loading, error, save, remove, removeMany, importRows };
}