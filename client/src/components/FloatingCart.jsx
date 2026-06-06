import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatBRL } from "../utils/format.js";

const IconBag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export default function FloatingCart() {
  const { count, total } = useCart();
  const { pathname } = useLocation();

  if (pathname === "/carrinho" || pathname === "/checkout") return null;

  return (
    <Link
      to="/carrinho"
      aria-label={`Abrir carrinho com ${count} ${count === 1 ? "item" : "itens"}`}
      className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full border border-yellow-300 bg-yellow-400 px-4 py-3 font-semibold text-neutral-900 shadow-[0_18px_50px_-18px_rgba(23,23,23,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-[0_22px_55px_-18px_rgba(23,23,23,0.65)] active:scale-[0.98] sm:bottom-8 sm:right-8"
    >
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-inner-sm">
        <IconBag />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      </span>

      <span className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm">Carrinho</span>
        <span className="text-xs font-bold text-neutral-700">
          {count > 0 ? formatBRL(total) : "Vazio"}
        </span>
      </span>
    </Link>
  );
}
