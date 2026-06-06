import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { ordersApi } from "../../api/orders.js";
import { createMercadoPagoCheckout } from "../../api/payments.js";
import { profilesApi } from "../../api/profiles.js";
import { supabase } from "../../lib/supabase.js";
import { formatBRL } from "../../utils/format.js";

const EMPTY = { name: "", email: "", phone: "", address: "" };

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [customer, setCustomer] = useState(EMPTY);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      try {
        const profile = await profilesApi.getCurrent();
        if (!active) return;
        const address = profile?.address ?? {};
        const addressText = [
          address.street,
          address.number,
          address.neighborhood,
          address.city && address.state ? `${address.city} - ${address.state}` : address.city,
        ]
          .filter(Boolean)
          .join(", ");

        setCustomer({
          name: profile?.name || data.session.user.user_metadata?.name || "",
          email: data.session.user.email ?? "",
          phone: profile?.phone ?? "",
          cep: address.cep ?? "",
          address: addressText,
        });
      } catch {
        if (active) setCustomer((current) => ({ ...current, email: data.session.user.email ?? "" }));
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    loadCustomer();
    return () => {
      active = false;
    };
  }, [location.pathname, navigate]);

  function handleChange(e) {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.create({
        customer,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          size: i.size,
          color: i.color,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      const { checkoutUrl } = await createMercadoPagoCheckout(order._id);
      clear();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center animate-fade-in">
        <p className="font-medium text-neutral-700">Seu carrinho está vazio.</p>
        <button onClick={() => navigate("/")} className="btn-primary mt-4">
          Ver coleção
        </button>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-card">
        <div className="skeleton mx-auto mb-4 h-12 w-12 rounded-full" />
        <p className="text-sm font-medium text-neutral-500">Preparando checkout seguro...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">
        Finalizar compra
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6">
          <h2 className="mb-5 font-semibold text-neutral-900">Dados de entrega</h2>
          <div className="space-y-4">
            <Field
              label="Nome completo"
              name="name"
              value={customer.name}
              onChange={handleChange}
              required
              placeholder="João Silva"
            />
            <Field
              label="E-mail"
              name="email"
              type="email"
              value={customer.email}
              onChange={handleChange}
              required
              placeholder="joao@email.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Telefone"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
              <Field
                label="CEP"
                name="cep"
                value={customer.cep ?? ""}
                onChange={handleChange}
                placeholder="00000-000"
              />
            </div>
            <Field
              label="Endereço de entrega"
              name="address"
              value={customer.address}
              onChange={handleChange}
              required
              placeholder="Rua, número, bairro, cidade — UF"
            />
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-red-500">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-accent mt-5 w-full gap-2"
          >
            {submitting ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin-slow">
                  <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
                Processando...
              </>
            ) : (
              `Pagar com Mercado Pago · ${formatBRL(total)}`
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="h-fit card p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">Seu pedido</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">{item.name}</p>
                  <p className="text-xs text-neutral-400">
                    {[item.size && `Tam. ${item.size}`, item.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-neutral-800">
                    {formatBRL(item.price * item.quantity)}
                  </p>
                  <p className="text-xs text-neutral-400">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="font-bold text-neutral-900">Total</span>
            <span className="text-lg font-bold tabular-nums text-neutral-900">
              {formatBRL(total)}
            </span>
          </div>
          <p className="mt-4 rounded-xl bg-yellow-50 px-3 py-2 text-xs text-neutral-600">
            Pagamento seguro via Mercado Pago. Pix e cartão disponíveis no checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</span>
      <input
        {...props}
        className="input-field"
      />
    </label>
  );
}
