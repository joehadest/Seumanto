import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { formatBRL } from "../../utils/format.js";

const IconBag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

function QuantityStepper({ value, onChange }) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:bg-yellow-50 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span className="flex h-8 w-8 items-center justify-center border-x border-neutral-200 text-sm font-semibold tabular-nums text-neutral-900">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:bg-yellow-50 hover:text-neutral-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default function Cart() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-20 text-center animate-fade-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
          <IconBag />
        </div>
        <h2 className="text-lg font-semibold text-neutral-800">Seu carrinho está vazio</h2>
        <p className="mt-1 text-sm text-neutral-400">Adicione produtos para continuar</p>
        <Link to="/" className="btn-primary mt-6">
          Ver coleção
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Carrinho{" "}
          <span className="text-lg font-normal text-neutral-400">
            ({items.length} {items.length === 1 ? "item" : "itens"})
          </span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={item.key}
              className="card flex items-center gap-4 p-3 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Thumbnail */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {[
                    ...(item.categories?.length ? item.categories : [item.category]).filter(Boolean),
                    item.size && `Tam. ${item.size}`,
                    item.color,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-700">
                  {formatBRL(item.price)}
                </p>
              </div>

              {/* Quantity + subtotal */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(q) => updateQuantity(item.key, q)}
                />
                <p className="text-xs font-semibold tabular-nums text-neutral-500">
                  {formatBRL(item.price * item.quantity)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.key)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Remover item"
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="flex flex-col gap-3">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-neutral-900">Resumo do pedido</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between gap-2 text-sm">
                  <span className="max-w-[160px] truncate text-neutral-600">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-700">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="text-lg font-bold tabular-nums text-neutral-900">
                {formatBRL(total)}
              </span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="btn-accent mt-4 w-full gap-2"
            >
              Finalizar compra
              <IconArrowRight />
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-700"
          >
            <IconArrowLeft />
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
