import { supabase } from "../lib/supabase.js";

const TABLE = "product_reviews";

export function productReviewFromRow(row) {
  return {
    _id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    product: row.products
      ? {
          _id: row.products.id,
          name: row.products.name,
          imageUrl: row.products.image_url,
        }
      : null,
  };
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export const productReviewsApi = {
  async list() {
    const data = check(
      await supabase
        .from(TABLE)
        .select("*, products(id, name, image_url)")
        .order("created_at", { ascending: false })
    );
    return data.map(productReviewFromRow);
  },

  async listByProduct(productId) {
    const data = check(
      await supabase
        .from(TABLE)
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
    );
    return data.map(productReviewFromRow);
  },

  async create({ productId, customerName, rating, comment }) {
    const normalizedName = String(customerName ?? "").trim() || "Cliente Seu manto";
    const normalizedRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const data = check(
      await supabase
        .from(TABLE)
        .insert({
          product_id: productId,
          customer_name: normalizedName,
          rating: normalizedRating,
          comment: String(comment).trim(),
        })
        .select()
        .single()
    );
    return productReviewFromRow(data);
  },

  async remove(id) {
    check(await supabase.from(TABLE).delete().eq("id", id));
  },

  table: TABLE,
};
