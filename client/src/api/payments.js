import { supabase } from "../lib/supabase.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function createMercadoPagoCheckout(orderId) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session?.access_token) {
    throw new Error("Entre na sua conta para pagar o pedido.");
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase não configurado no front-end.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/create-mp-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
    body: JSON.stringify({ orderId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível iniciar o pagamento.");
  }

  const useSandbox = import.meta.env.VITE_MP_SANDBOX === "true";
  const checkoutUrl = useSandbox
    ? payload.sandboxInitPoint ?? payload.initPoint
    : payload.initPoint ?? payload.sandboxInitPoint;

  if (!checkoutUrl) {
    throw new Error("Mercado Pago não retornou URL de pagamento.");
  }

  return { ...payload, checkoutUrl };
}
