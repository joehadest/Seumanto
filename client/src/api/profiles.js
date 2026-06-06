import { supabase } from "../lib/supabase.js";

const TABLE = "profiles";

export function profileFromRow(row) {
  return {
    id: row.id,
    name: row.name ?? "",
    phone: row.phone ?? "",
    address: row.address ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

function profileToRow(profile) {
  return {
    name: String(profile.name ?? "").trim(),
    phone: String(profile.phone ?? "").trim(),
    address: {
      cep: String(profile.address?.cep ?? "").trim(),
      street: String(profile.address?.street ?? "").trim(),
      number: String(profile.address?.number ?? "").trim(),
      neighborhood: String(profile.address?.neighborhood ?? "").trim(),
      city: String(profile.address?.city ?? "").trim(),
      state: String(profile.address?.state ?? "").trim(),
      complement: String(profile.address?.complement ?? "").trim(),
      preferences: {
        nickname: String(profile.address?.preferences?.nickname ?? "").trim(),
        favoriteSize: String(profile.address?.preferences?.favoriteSize ?? "").trim(),
        favoriteColor: String(profile.address?.preferences?.favoriteColor ?? "").trim(),
        style: String(profile.address?.preferences?.style ?? "").trim(),
        newsletter: Boolean(profile.address?.preferences?.newsletter),
        whatsappUpdates: Boolean(profile.address?.preferences?.whatsappUpdates),
      },
    },
  };
}

export const profilesApi = {
  async getCurrent() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    const userId = authData.user?.id;
    if (!userId) return null;

    const data = check(await supabase.from(TABLE).select("*").eq("id", userId).maybeSingle());
    if (!data) return null;
    return profileFromRow(data);
  },

  async upsertCurrent(profile) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    const userId = authData.user?.id;
    if (!userId) throw new Error("Usuario nao autenticado.");

    const data = check(
      await supabase
        .from(TABLE)
        .upsert({ id: userId, ...profileToRow(profile) }, { onConflict: "id" })
        .select()
        .single()
    );

    return profileFromRow(data);
  },

  table: TABLE,
};
