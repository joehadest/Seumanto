import { supabase } from "../lib/supabase.js";

const TABLE = "store_settings";

const DEFAULT_CONTACT_INFO = {
  email: "",
  phone: "",
};

export function settingsFromRow(row) {
  return {
    _id: row.id,
    storeName: row.store_name,
    maintenanceMode: Boolean(row.maintenance_mode),
    contactInfo: { ...DEFAULT_CONTACT_INFO, ...(row.contact_info ?? {}) },
    featuredProductIds: row.contact_info?.featuredProductIds ?? [],
    shippingRules: row.shipping_rules ?? {
      freeShippingMinAmount: 0,
      flatRate: 0,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(data) {
  const row = {};
  if (data.storeName !== undefined) row.store_name = String(data.storeName).trim();
  if (data.maintenanceMode !== undefined) row.maintenance_mode = Boolean(data.maintenanceMode);
  if (data.contactInfo !== undefined || data.featuredProductIds !== undefined) {
    row.contact_info = {
      ...(data.contactInfo ?? {}),
      ...(data.featuredProductIds !== undefined
        ? { featuredProductIds: data.featuredProductIds }
        : {}),
    };
  }
  if (data.shippingRules !== undefined) row.shipping_rules = data.shippingRules;
  return row;
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export const settingsApi = {
  async get() {
    const data = check(
      await supabase
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
    );
    return data ? settingsFromRow(data) : null;
  },

  async update(id, payload) {
    const data = check(
      await supabase
        .from(TABLE)
        .update(toRow(payload))
        .eq("id", id)
        .select()
        .single()
    );
    return settingsFromRow(data);
  },

  async create(payload) {
    const data = check(
      await supabase
        .from(TABLE)
        .insert(toRow(payload))
        .select()
        .single()
    );
    return settingsFromRow(data);
  },

  table: TABLE,
};
