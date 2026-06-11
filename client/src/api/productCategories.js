import { supabase } from "../lib/supabase.js";

const TABLE = "product_categories";

export function productCategoryFromRow(row) {
  return {
    _id: row.id,
    name: row.name,
    description: row.description ?? "",
    sortOrder: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(data) {
  const row = {};
  if (data.name !== undefined) row.name = String(data.name).trim();
  if (data.description !== undefined) row.description = String(data.description).trim();
  if (data.sortOrder !== undefined) row.sort_order = Number(data.sortOrder) || 0;
  return row;
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export const productCategoriesApi = {
  async list() {
    const data = check(
      await supabase
        .from(TABLE)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
    );
    return data.map(productCategoryFromRow);
  },

  async create(payload) {
    const data = check(
      await supabase.from(TABLE).insert(toRow(payload)).select().single()
    );
    return productCategoryFromRow(data);
  },

  async update(id, payload) {
    const data = check(
      await supabase.from(TABLE).update(toRow(payload)).eq("id", id).select().single()
    );
    return productCategoryFromRow(data);
  },

  async remove(id) {
    check(await supabase.from(TABLE).delete().eq("id", id));
  },

  table: TABLE,
};
