import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!accessToken || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return json({ error: "Configuração do servidor incompleta." }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado." }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return json({ error: "Sessão inválida." }, 401);
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return json({ error: "orderId é obrigatório." }, 400);
    }

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return json({ error: "Pedido não encontrado." }, 404);
    }

    if (order.user_id !== authData.user.id) {
      return json({ error: "Pedido não pertence a este usuário." }, 403);
    }

    if (order.status === "Pago") {
      return json({ error: "Este pedido já foi pago." }, 400);
    }

    const items = (order.items ?? []).map((item: Record<string, unknown>) => ({
      id: String(item.productId ?? item.name),
      title: String(item.name).slice(0, 256),
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.price) || 0,
      currency_id: "BRL",
    }));

    const customer = order.customer ?? {};
    const supabaseFunctionsUrl = `${supabaseUrl}/functions/v1/mercado-pago-webhook`;

    const preferenceBody = {
      items,
      payer: {
        name: customer.name ?? undefined,
        email: customer.email ?? authData.user.email ?? undefined,
        phone: customer.phone
          ? { number: String(customer.phone).replace(/\D/g, "").slice(-11) }
          : undefined,
      },
      external_reference: order.id,
      back_urls: {
        success: `${siteUrl}/checkout/sucesso?order_id=${order.id}`,
        failure: `${siteUrl}/checkout/erro?order_id=${order.id}`,
        pending: `${siteUrl}/checkout/pendente?order_id=${order.id}`,
      },
      auto_return: "approved",
      notification_url: supabaseFunctionsUrl,
      statement_descriptor: "SEU MANTO",
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    const preference = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("Mercado Pago preference error:", preference);
      return json({ error: preference.message ?? "Falha ao criar pagamento." }, 502);
    }

    await adminClient
      .from("orders")
      .update({
        mp_preference_id: preference.id,
        payment_status: "pending",
      })
      .eq("id", order.id);

    return json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (err) {
    console.error(err);
    return json({ error: "Erro interno ao iniciar pagamento." }, 500);
  }
});
