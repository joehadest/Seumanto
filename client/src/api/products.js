import { supabase } from "../lib/supabase.js";

const TABLE = "products";

// Mapeia a linha do Postgres (snake_case + id) para o formato usado no front
// (_id + camelCase). Mantem hooks/telas inalterados.
export function productFromRow(row) {
  return {
    _id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    stock: row.stock,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ALLOWED_SIZES = ["P", "M", "G", "GG"];

function toRow(data) {
  const row = {};
  if (data.name !== undefined) row.name = String(data.name).trim();
  if (data.description !== undefined) row.description = String(data.description).trim();
  if (data.price !== undefined) row.price = Number(data.price) || 0;
  if (data.stock !== undefined) row.stock = Number(data.stock) || 0;
  if (data.imageUrl !== undefined) row.image_url = String(data.imageUrl).trim();
  if (data.sizes !== undefined) row.sizes = toArray(data.sizes).filter((s) => ALLOWED_SIZES.includes(s));
  if (data.colors !== undefined) row.colors = toArray(data.colors);
  return row;
}

function toArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export const productsApi = {
  async list() {
    const data = check(
      await supabase.from(TABLE).select("*").order("created_at", { ascending: false })
    );
    return data.map(productFromRow);
  },

  async getById(id) {
    const data = check(await supabase.from(TABLE).select("*").eq("id", id).single());
    return productFromRow(data);
  },

  async create(payload) {
    const data = check(
      await supabase.from(TABLE).insert(toRow(payload)).select().single()
    );
    return productFromRow(data);
  },

  async update(id, payload) {
    const data = check(
      await supabase.from(TABLE).update(toRow(payload)).eq("id", id).select().single()
    );
    return productFromRow(data);
  },

  async remove(id) {
    check(await supabase.from(TABLE).delete().eq("id", id));
  },

  table: TABLE,
};
