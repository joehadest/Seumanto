import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { ordersApi } from "../../api/orders.js";
import { formatBRL } from "../../utils/format.js";

const VARIANTS = {
  sucesso: {
    icon: CheckCircle2,
    title: "Pagamento aprovado!",
    description: "Recebemos a confirmação do Mercado Pago. Seu pedido já está em processamento.",
    tone: "emerald",
  },
  pendente: {
    icon: Clock3,
    title: "Pagamento em análise",
    description: "Seu pagamento ainda está sendo processado. Assim que for confirmado, atualizamos o pedido automaticamente.",
    tone: "yellow",
  },
  erro: {
    icon: AlertTriangle,
    title: "Pagamento não concluído",
    description: "O pagamento foi cancelado ou recusado. Você pode tentar novamente em Meus pedidos ou finalizar uma nova compra.",
    tone: "red",
  },
};

export default function PaymentResult({ variant = "sucesso" }) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const config = VARIANTS[variant] ?? VARIANTS.sucesso;
  const Icon = config.icon;

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    ordersApi
      .getMineById(orderId)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <div className="card p-8 text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${toneClasses[config.tone]}`}
        >
          <Icon className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black text-neutral-950">{config.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{config.description}</p>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando pedido...
          </div>
        ) : order ? (
          <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-left text-sm">
            <p className="font-mono text-xs text-neutral-400">Pedido #{order._id.slice(0, 8)}</p>
            <p className="mt-1 font-black text-neutral-950">{formatBRL(order.total)}</p>
            <p className="mt-1 text-neutral-500">Status: {order.status}</p>
          </div>
        ) : orderId ? null : (
          <p className="mt-6 text-sm text-neutral-400">Pedido não identificado na URL.</p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/meus-pedidos" className="btn-accent">
            Ver meus pedidos
          </Link>
          <Link to="/" className="btn-primary">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
