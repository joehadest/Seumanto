import { useCallback, useEffect, useRef, useState } from "react";
import { settingsApi, settingsFromRow } from "../api/settings.js";
import { supabase } from "../lib/supabase.js";

export function useStoreSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      if (mounted.current) {
        setSettings(data);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refetch();

    const channel = supabase
      .channel("store-settings-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: settingsApi.table },
        (payload) => {
          if (mounted.current) setSettings(settingsFromRow(payload.new));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: settingsApi.table },
        (payload) => {
          if (mounted.current) setSettings(settingsFromRow(payload.new));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: settingsApi.table },
        () => {
          if (mounted.current) setSettings(null);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" && mounted.current) {
          setError("Falha ao conectar ao Supabase Realtime de configuracoes.");
        }
      });

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const saveSettings = useCallback(
    async (payload) => {
      const saved = settings?._id
        ? await settingsApi.update(settings._id, payload)
        : await settingsApi.create(payload);
      if (mounted.current) setSettings(saved);
      return saved;
    },
    [settings?._id]
  );

  return { settings, loading, error, refetch, saveSettings };
}
