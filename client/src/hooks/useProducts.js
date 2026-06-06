import { useCallback, useEffect, useRef, useState } from "react";
import { productsApi, productFromRow } from "../api/products.js";
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
 * Fonte unica de verdade dos produtos (compartilhada entre Loja e Admin).
 *
 * SINCRONIZACAO Admin <-> Loja:
 *  - Busca inicial via productsApi.list().
 *  - Assina a tabela products no Supabase Realtime.
 *  - Aplica INSERT/UPDATE/DELETE diretamente no estado local.
 *  - Remove o canal no cleanup para evitar memory leaks.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const data = await productsApi.list();
      if (mounted.current) {
        setProducts(data);
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
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: productsApi.table },
        (payload) => {
          const product = productFromRow(payload.new);
          if (mounted.current) setProducts((current) => upsertById(current, product));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: productsApi.table },
        (payload) => {
          const product = productFromRow(payload.new);
          if (mounted.current) setProducts((current) => upsertById(current, product));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: productsApi.table },
        (payload) => {
          const deletedId = payload.old?.id;
          if (mounted.current && deletedId) {
            setProducts((current) => current.filter((product) => product._id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" && mounted.current) {
          setError("Falha ao conectar ao Supabase Realtime de produtos.");
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

  const createProduct = useCallback(
    async (data) => {
      const created = await productsApi.create(data);
      await refetch();
      return created;
    },
    [refetch]
  );

  const updateProduct = useCallback(
    async (id, data) => {
      const updated = await productsApi.update(id, data);
      await refetch();
      return updated;
    },
    [refetch]
  );

  const removeProduct = useCallback(
    async (id) => {
      await productsApi.remove(id);
      await refetch();
    },
    [refetch]
  );

  return {
    products,
    loading,
    error,
    refetch,
    createProduct,
    updateProduct,
    removeProduct,
  };
}
