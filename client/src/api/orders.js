import { supabase } from "../lib/supabase.js";

const TABLE = "orders";

export const ORDER_STATUSES = ["Pendente", "Pago", "Enviado", "Entregue", "Cancelado"];

// customer e items ja sao JSON (jsonb no Postgres), so renomeamos id/datas.
export function orderFromRow(row) {
  return {
    _id: row.id,
    customer: row.customer ?? {},
    items: row.items ?? [],
    total: Number(row.total),
    status: row.status,
    userId: row.user_id,
    mpPreferenceId: row.mp_preference_id,
    mpPaymentId: row.mp_payment_id,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export const ordersApi = {
  async list() {
    const data = check(
      await supabase.from(TABLE).select("*").order("created_at", { ascending: false })
    );
    return data.map(orderFromRow);
  },

  async listMine() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    const userId = authData.user?.id;
    if (!userId) return [];

    const data = check(
      await supabase
        .from(TABLE)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    );
    return data.map(orderFromRow);
  },

  async getMineById(id) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    const userId = authData.user?.id;
    if (!userId) throw new Error("Usuário não autenticado.");

    const data = check(
      await supabase.from(TABLE).select("*").eq("id", id).eq("user_id", userId).single()
    );
    return orderFromRow(data);
  },

  // Status sao fixos no front; nao precisa ir ao banco.
  async statuses() {
    return ORDER_STATUSES;
  },

  async create({ customer, items }) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    const userId = authData.user?.id;
    if (!userId) throw new Error("Entre na sua conta para finalizar o pedido.");

    const normalizedItems = (items ?? []).map((i) => ({
      productId: i.productId,
      name: i.name,
      size: i.size ?? null,
      color: i.color ?? null,
      price: Number(i.price),
      quantity: Number(i.quantity) || 1,
    }));
    const total = Number(
      normalizedItems.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)
    );

    const data = check(
      await supabase
        .from(TABLE)
        .insert({
          customer: {
            name: customer?.name ?? "",
            email: customer?.email ?? "",
            phone: customer?.phone ?? "",
            address: customer?.address ?? "",
          },
          items: normalizedItems,
          total,
          status: "Pendente",
          user_id: userId,
        })
        .select()
        .single()
    );
    return orderFromRow(data);
  },

  async updateStatus(id, status) {
    if (!ORDER_STATUSES.includes(status)) throw new Error("Status invalido");
    const data = check(
      await supabase.from(TABLE).update({ status }).eq("id", id).select().single()
    );
    return orderFromRow(data);
  },

  async remove(id) {
    check(await supabase.from(TABLE).delete().eq("id", id));
    return true;
  },

  table: TABLE,
};
