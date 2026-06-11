import { useCallback, useEffect, useRef, useState } from "react";
import {
  productCategoriesApi,
  productCategoryFromRow,
} from "../api/productCategories.js";
import { supabase } from "../lib/supabase.js";

function sortCategories(items) {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

function upsertById(items, item) {
  const exists = items.some((current) => current._id === item._id);
  if (!exists) return sortCategories([...items, item]);
  return sortCategories(
    items.map((current) => (current._id === item._id ? item : current))
  );
}

export function useProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const data = await productCategoriesApi.list();
      if (mounted.current) {
        setCategories(data);
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
      .channel("product-categories-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: productCategoriesApi.table },
        (payload) => {
          const category = productCategoryFromRow(payload.new);
          if (mounted.current) setCategories((current) => upsertById(current, category));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: productCategoriesApi.table },
        (payload) => {
          const category = productCategoryFromRow(payload.new);
          if (mounted.current) setCategories((current) => upsertById(current, category));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: productCategoriesApi.table },
        (payload) => {
          const deletedId = payload.old?.id;
          if (mounted.current && deletedId) {
            setCategories((current) =>
              current.filter((category) => category._id !== deletedId)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" && mounted.current) {
          setError("Falha ao conectar ao Supabase Realtime de categorias.");
        }
      });

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const createCategory = useCallback(
    async (payload) => {
      const created = await productCategoriesApi.create(payload);
      await refetch();
      return created;
    },
    [refetch]
  );

  const updateCategory = useCallback(
    async (id, payload) => {
      const updated = await productCategoriesApi.update(id, payload);
      await refetch();
      return updated;
    },
    [refetch]
  );

  const removeCategory = useCallback(
    async (id) => {
      await productCategoriesApi.remove(id);
      await refetch();
    },
    [refetch]
  );

  return {
    categories,
    loading,
    error,
    refetch,
    createCategory,
    updateCategory,
    removeCategory,
  };
}
