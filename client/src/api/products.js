import { supabase } from "../lib/supabase.js";

const TABLE = "products";

// Mapeia a linha do Postgres (snake_case + id) para o formato usado no front
// (_id + camelCase). Mantem hooks/telas inalterados.
export function productFromRow(row) {
  const imageUrls = normalizeImageUrls(row.image_urls, row.image_url);

  return {
    _id: row.id,
    name: row.name,
    category: row.category || "Camisetas",
    description: row.description,
    price: Number(row.price),
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    stock: row.stock,
    imageUrl: imageUrls[0] ?? "",
    imageUrls,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ALLOWED_SIZES = ["P", "M", "G", "GG"];

function toRow(data) {
  const row = {};
  if (data.name !== undefined) row.name = String(data.name).trim();
  if (data.category !== undefined) row.category = String(data.category).trim() || "Camisetas";
  if (data.description !== undefined) row.description = String(data.description).trim();
  if (data.price !== undefined) row.price = Number(data.price) || 0;
  if (data.stock !== undefined) row.stock = Number(data.stock) || 0;
  if (data.imageUrls !== undefined || data.imageUrl !== undefined) {
    const imageUrls = normalizeImageUrls(data.imageUrls, data.imageUrl);
    row.image_urls = imageUrls;
    row.image_url = imageUrls[0] ?? "";
  }
  if (data.sizes !== undefined) row.sizes = toArray(data.sizes).filter((s) => ALLOWED_SIZES.includes(s));
  if (data.colors !== undefined) row.colors = toArray(data.colors);
  return row;
}

function normalizeImageUrls(value, fallback = "") {
  const urls = toArray(value);
  if (urls.length > 0) return [...new Set(urls)].filter(Boolean);

  const fallbackUrl = String(fallback ?? "").trim();
  if (fallbackUrl) urls.unshift(fallbackUrl);
  return [...new Set(urls)].filter(Boolean);
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
