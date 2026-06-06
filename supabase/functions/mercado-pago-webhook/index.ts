import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function mapPaymentToOrder(paymentStatus: string) {
  switch (paymentStatus) {
    case "approved":
      return { orderStatus: "Pago", paymentStatus: "approved" };
    case "rejected":
      return { orderStatus: "Cancelado", paymentStatus: "rejected" };
    case "cancelled":
      return { orderStatus: "Cancelado", paymentStatus: "cancelled" };
    case "in_process":
    case "pending":
    default:
      return { orderStatus: "Pendente", paymentStatus: paymentStatus || "pending" };
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!accessToken || !supabaseUrl || !serviceRoleKey) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json().catch(() => ({}));

    const topic = body.type ?? new URL(req.url).searchParams.get("topic");
    const resourceId = body.data?.id ?? new URL(req.url).searchParams.get("id");

    if (topic !== "payment" || !resourceId) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${resourceId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      console.error("Payment fetch error:", payment);
      return new Response("Payment not found", { status: 404 });
    }

    const orderId = payment.external_reference;
    if (!orderId) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mapped = mapPaymentToOrder(payment.status);

    const { error } = await adminClient
      .from("orders")
      .update({
        status: mapped.orderStatus,
        payment_status: mapped.paymentStatus,
        mp_payment_id: String(payment.id),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Order update error:", error);
      return new Response("Update failed", { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal error", { status: 500 });
  }
});
