import { useState } from "react";
import { CreditCard, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { createMercadoPagoCheckout } from "../../api/payments.js";
import { useCustomerOrders } from "../../hooks/useCustomerOrders.js";
import { formatBRL, formatDate } from "../../utils/format.js";

const STEPS = [
  { key: "Pendente", label: "Pedido Recebido" },
  { key: "Pago", label: "Pagamento Aprovado" },
  { key: "Enviado", label: "Despachado" },
  { key: "Entregue", label: "Entregue" },
];

function statusIndex(status) {
  if (status === "Cancelado") return -1;
  return Math.max(0, STEPS.findIndex((step) => step.key === status));
}

function OrderTimeline({ status }) {
  const activeIndex = statusIndex(status);
  const cancelled = status === "Cancelado";

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
        Pedido cancelado
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {STEPS.map((step, index) => {
        const active = index <= activeIndex;
        return (
          <div key={step.key} className="flex items-center gap-2 sm:block">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
                active ? "bg-yellow-400 text-neutral-950" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {index + 1}
            </div>
            <p className={`mt-0 text-sm font-semibold sm:mt-2 ${active ? "text-neutral-900" : "text-neutral-400"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PayOrderButton({ orderId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const { checkoutUrl } = await createMercadoPagoCheckout(orderId);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="btn-accent gap-2"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Abrindo Mercado Pago..." : "Pagar com Mercado Pago"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function MeusPedidos() {
  const { orders, loading, error } = useCustomerOrders();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-950">Meus Pedidos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Acompanhe o status das suas compras em tempo real.
          </p>
        </div>
        <Link to="/" className="btn-ghost">
          Continuar comprando
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <PackageCheck className="mb-3 h-10 w-10 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Você ainda não fez pedidos</p>
          <p className="mt-1 text-sm text-neutral-400">Quando finalizar uma compra, ela aparecerá aqui.</p>
          <Link to="/" className="btn-primary mt-5">
            Ver camisetas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="card p-5">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-neutral-400">
                    Pedido #{order._id.slice(0, 8)}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-neutral-950">
                    {formatBRL(order.total)}
                  </h2>
                  <p className="mt-0.5 text-sm text-neutral-400">{formatDate(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                  {order.status}
                </span>
              </div>

              <OrderTimeline status={order.status} />

              {order.status === "Pendente" && (
                <PayOrderButton orderId={order._id} />
              )}

              <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Itens</p>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex justify-between gap-3 text-sm">
                      <span className="text-neutral-600">
                        {item.quantity}x {item.name}
                        {(item.size || item.color) && (
                          <span className="text-neutral-400">
                            {" "}({[item.size, item.color].filter(Boolean).join(", ")})
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {formatBRL(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
