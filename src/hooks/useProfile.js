import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/api.js";

export default function useProfile() {
  const [profile, setProfile] = useState(null);

  const reload = useCallback(
    () =>
      apiFetch("/api/profile.php")
        .then((res) => res.json())
        .then((data) => setProfile(data || null))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(async (form) => {
    const res = await apiFetch("/api/profile.php", {
      method: "PUT",
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    setProfile((p) => ({ ...p, ...form }));
  }, []);

  return { profile, save, reload };
}