import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatBRL } from "../utils/format.js";

const IconBag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
    <path d="M19 21a7 7 0 0 0-14 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navigationLinks = [
  { to: "/", label: "Loja", end: true },
  { to: "/#colecao", label: "Coleção" },
  { to: "/meus-pedidos", label: "Meus pedidos" },
];

export default function Navbar() {
  const { count, total } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [badgeAnim, setBadgeAnim] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > prevCount) {
      setBadgeAnim(true);
      const t = setTimeout(() => setBadgeAnim(false), 500);
      return () => clearTimeout(t);
    }
    setPrevCount(count);
  }, [count, prevCount]);

  const storeLink = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
      isActive
        ? "bg-neutral-950 text-white shadow-sm"
        : "text-neutral-500 hover:bg-white hover:text-neutral-950 hover:shadow-sm"
    }`;

  return (
    <header
      className={`relative z-50 overflow-hidden transition-all duration-300 ${
        scrolled
          ? "border-b border-yellow-100 bg-white/90 shadow-[0_14px_45px_rgba(23,23,23,0.06)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/95"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-40 w-40 rounded-full bg-yellow-200/30 blur-3xl" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Abrir menu"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-yellow-100 bg-white text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-yellow-50 md:hidden"
          >
            <svg
              className="pointer-events-none"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12L20 12"
                className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
              />
              <path
                d="M4 12H20"
                className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
              />
              <path
                d="M4 12H20"
                className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
              />
            </svg>
          </button>

          <Link
            to="/"
            className="group flex items-center gap-3 rounded-full border border-neutral-100 bg-white/80 px-2 py-1 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src="/logo.png"
              alt="Seu manto"
              className="h-10 w-auto transition-transform duration-200 group-hover:scale-[1.03] sm:h-12"
            />
            <span
              className="hidden pr-3 text-[22px] font-normal leading-none tracking-[-0.08em] text-neutral-950 lg:inline"
              style={{ fontFamily: '"Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif' }}
            >
              <span className="text-yellow-400">S</span>eu manto
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-neutral-100 bg-neutral-50/90 p-1 shadow-inner md:flex">
            {navigationLinks.map((link) => (
              <NavLink key={link.label} to={link.to} className={storeLink} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/minha-conta"
            className={({ isActive }) =>
              `hidden items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 sm:inline-flex ${
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                  : "border-neutral-100 bg-white text-neutral-700 shadow-sm hover:border-yellow-200 hover:bg-yellow-50 hover:text-neutral-950"
              }`
            }
          >
            <IconUser />
            Conta
          </NavLink>

          <NavLink
            to="/carrinho"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 px-2.5 py-1.5 text-sm font-black text-neutral-950 shadow-[0_10px_28px_rgba(250,204,21,0.35)] ring-1 ring-yellow-300/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(250,204,21,0.45)] active:scale-[0.98] sm:px-4 sm:py-2"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 shadow-inner-sm">
              <IconBag />
              {count > 0 && (
                <span
                  key={count}
                  className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-yellow-300 ${
                    badgeAnim ? "animate-bounce-in" : ""
                  }`}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            <span className="hidden leading-tight sm:flex sm:flex-col">
              <span>Carrinho</span>
              <span className="text-xs font-black text-neutral-700">
                {count > 0 ? formatBRL(total) : "Vazio"}
              </span>
            </span>
          </NavLink>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-yellow-100 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(23,23,23,0.08)] backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-2 rounded-3xl border border-neutral-100 bg-neutral-50 p-2">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={storeLink}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/minha-conta"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-full bg-white px-4 py-2.5 text-sm font-bold text-neutral-800 shadow-sm"
            >
              <span>Minha conta</span>
              <IconUser />
            </NavLink>
            <NavLink
              to="/carrinho"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center justify-between rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 px-4 py-3 text-sm font-black text-neutral-950 shadow-[0_10px_24px_rgba(250,204,21,0.3)]"
            >
              <span>Carrinho</span>
              <span>{count > 0 ? `${count} item${count !== 1 ? "s" : ""}` : "Vazio"}</span>
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
