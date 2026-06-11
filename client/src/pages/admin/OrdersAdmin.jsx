import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useOrders } from "../../hooks/useOrders.js";
import { formatBRL, formatDate } from "../../utils/format.js";

const STATUS_CONFIG = {
  Pendente: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock3 },
  Pago: { dot: "bg-lime-400", badge: "bg-lime-50 text-lime-700 border-lime-200", icon: Banknote },
  Enviado: { dot: "bg-sky-400", badge: "bg-sky-50 text-sky-700 border-sky-200", icon: Truck },
  Entregue: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: PackageCheck },
  Cancelado: { dot: "bg-neutral-400", badge: "bg-neutral-100 text-neutral-500 border-neutral-200", icon: AlertTriangle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pendente;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.badge}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

export default function OrdersAdmin() {
  const { orders, statuses, loading, error, changeStatus, deleteOrder } = useOrders();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "Cancelado");
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "Pendente").length,
      sent: orders.filter((order) => order.status === "Enviado").length,
      revenue: activeOrders.reduce((acc, order) => acc + Number(order.total || 0), 0),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "Todos" || order.status === statusFilter;
      const searchable = [
        order._id,
        order.customer?.name,
        order.customer?.email,
        order.customer?.phone,
        order.customer?.address,
        ...(order.items ?? []).map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [orders, query, statusFilter]);

  async function handleDelete(order) {
    const confirmed = window.confirm(
      `Excluir o pedido #${order._id.slice(0, 8)}? Essa acao nao pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingId(order._id);
    setActionError("");
    try {
      await deleteOrder(order._id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 overflow-hidden rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">
              Painel operacional
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-950">Pedidos</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Gerencie status, contatos, itens e pedidos recebidos em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Realtime ativo
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={ShoppingBag} label="Pedidos" value={metrics.total} />
          <MetricCard icon={Clock3} label="Pendentes" value={metrics.pending} />
          <MetricCard icon={Truck} label="Em envio" value={metrics.sent} />
          <MetricCard icon={Banknote} label="Receita ativa" value={formatBRL(metrics.revenue)} />
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por cliente, e-mail, telefone, produto ou código..."
              className="input-field pl-9"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input-field"
          >
            <option value="Todos">Todos os status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mt-0.5 text-sm text-neutral-400">
            {filteredOrders.length} de {orders.length} pedido{orders.length !== 1 ? "s" : ""} exibido
            {filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {(error || actionError) && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error || actionError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Nenhum pedido ainda</p>
          <p className="mt-1 text-sm text-neutral-400">
            Pedidos chegam aqui assim que um cliente finaliza a compra.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-14 text-center">
          <Search className="mx-auto mb-3 h-9 w-9 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Nenhum pedido encontrado</p>
          <p className="mt-1 text-sm text-neutral-400">Tente limpar a busca ou trocar o filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, i) => (
            <div
              key={order._id}
              className="overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-sm transition-all duration-300 animate-fade-up hover:-translate-y-0.5 hover:shadow-card-hover"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-black text-yellow-300">
                      {getInitials(order.customer?.name, order.customer?.email)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-neutral-950">{order.customer?.name || "Cliente"}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-500 ring-1 ring-neutral-100">
                          #{order._id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                        {order.customer?.email && (
                          <ContactLine icon={Mail} text={order.customer.email} />
                        )}
                        {order.customer?.phone && (
                          <ContactLine icon={Phone} text={order.customer.phone} />
                        )}
                        {order.customer?.address && (
                          <ContactLine icon={MapPin} text={order.customer.address} />
                        )}
                      </div>
                      <p className="mt-2 text-xs font-medium text-neutral-400">
                        Criado em {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusBadge status={order.status} />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order._id, e.target.value)}
                        className="input-field w-40 py-1.5 text-xs"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        disabled={deletingId === order._id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === order._id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_220px]">
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-neutral-400">
                    Itens do pedido
                  </p>
                  <div className="divide-y divide-neutral-200/70">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-neutral-800">
                            <span className="text-neutral-400">{item.quantity}×</span> {item.name}
                          </p>
                          {(item.category || item.size || item.color) && (
                            <p className="mt-0.5 text-xs text-neutral-400">
                              {[item.category, item.size && `Tam. ${item.size}`, item.color]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-neutral-900">
                          {formatBRL(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-yellow-700">Total</p>
                    <p className="mt-1 text-2xl font-black tabular-nums text-neutral-950">
                      {formatBRL(order.total)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} no pedido
                    </p>
                  </div>
                  <div className="mt-5 rounded-xl bg-white/70 p-3 text-xs font-semibold text-neutral-500">
                    Atualizado em {formatDate(order.updatedAt || order.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm">
      <Icon className="mb-3 h-5 w-5 text-yellow-700" />
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-black text-neutral-950">{value}</p>
    </div>
  );
}

function ContactLine({ icon: Icon, text }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-yellow-700" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function getInitials(name, email) {
  const source = name?.trim() || email || "SM";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
