import { useCallback, useEffect, useRef, useState } from "react";
import { ordersApi, orderFromRow } from "../api/orders.js";
import { supabase } from "../lib/supabase.js";

function sortByNewest(items) {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function upsertById(items, item) {
  const exists = items.some((current) => current._id === item._id);
  if (!exists) return sortByNewest([item, ...items]);
  return sortByNewest(
    items.map((current) => (current._id === item._id ? item : current))
  );
}

/**
 * Pedidos no Admin, sincronizados com os checkouts feitos na Loja.
 * Busca inicial via ordersApi e assina INSERT/UPDATE/DELETE via Supabase Realtime.
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const data = await ordersApi.list();
      if (mounted.current) {
        setOrders(data);
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
    ordersApi.statuses().then((s) => mounted.current && setStatuses(s)).catch(() => {});

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: ordersApi.table },
        (payload) => {
          const order = orderFromRow(payload.new);
          if (mounted.current) setOrders((current) => upsertById(current, order));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: ordersApi.table },
        (payload) => {
          const order = orderFromRow(payload.new);
          if (mounted.current) setOrders((current) => upsertById(current, order));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: ordersApi.table },
        (payload) => {
          const deletedId = payload.old?.id;
          if (mounted.current && deletedId) {
            setOrders((current) => current.filter((order) => order._id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" && mounted.current) {
          setError("Falha ao conectar ao Supabase Realtime de pedidos.");
        }
      });

    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetch]);

  const changeStatus = useCallback(
    async (id, status) => {
      await ordersApi.updateStatus(id, status);
      await refetch();
    },
    [refetch]
  );

  const deleteOrder = useCallback(
    async (id) => {
      await ordersApi.remove(id);
      await refetch();
    },
    [refetch]
  );

  return { orders, statuses, loading, error, refetch, changeStatus, deleteOrder };
}
