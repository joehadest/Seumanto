import { useCallback, useEffect, useRef, useState } from "react";
import { orderFromRow, ordersApi } from "../api/orders.js";
import { supabase } from "../lib/supabase.js";

function sortByNewest(items) {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function upsertById(items, item) {
  const exists = items.some((current) => current._id === item._id);
  if (!exists) return sortByNewest([item, ...items]);
  return sortByNewest(items.map((current) => (current._id === item._id ? item : current)));
}

export function useCustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!mounted.current) return;

      setUser(data.user ?? null);
      if (!data.user) {
        setOrders([]);
        return;
      }

      const customerOrders = await ordersApi.listMine();
      if (mounted.current) setOrders(customerOrders);
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let channel = null;

    async function init() {
      await refetch();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId || !mounted.current) return;

      channel = supabase
        .channel(`customer-orders-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: ordersApi.table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!mounted.current) return;
            if (payload.eventType === "DELETE") {
              setOrders((current) => current.filter((order) => order._id !== payload.old?.id));
              return;
            }
            setOrders((current) => upsertById(current, orderFromRow(payload.new)));
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" && mounted.current) {
            setError("Falha ao conectar ao Realtime dos seus pedidos.");
          }
        });
    }

    init();

    return () => {
      mounted.current = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { orders, user, loading, error, refetch };
}
