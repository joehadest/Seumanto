import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatBRL } from "../utils/format.js";
import { cn } from "../lib/utils.js";

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

function storeLinkClass({ isActive }) {
  return cn(
    "rounded-full px-4 py-2 text-sm font-bold transition-all duration-200",
    isActive
      ? "bg-yellow-400 text-neutral-950 shadow-sm"
      : "text-white/75 hover:bg-white/10 hover:text-white"
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { count, total } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [badgeAnim, setBadgeAnim] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 24);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (count > prevCount) {
      setBadgeAnim(true);
      const t = setTimeout(() => setBadgeAnim(false), 500);
      return () => clearTimeout(t);
    }
    setPrevCount(count);
  }, [count, prevCount]);

  return (
    <header
      className={cn(
        "storefront-navbar z-50 overflow-hidden text-white transition-all duration-300",
        isHome ? "fixed inset-x-0 top-0" : "relative",
        transparent
          ? "border-b border-white/10 bg-neutral-950/35 backdrop-blur-md"
          : "border-b border-white/10 bg-neutral-950/90 shadow-[0_14px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 2xl:max-w-screen-2xl 2xl:px-8 min-[1800px]:max-w-[1760px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Abrir menu"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/15 md:hidden"
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
            className="group flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-1 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-md"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src="/logo-dark.svg"
              alt="Seu manto"
              className="h-11 w-auto transition-transform duration-200 group-hover:scale-[1.03] sm:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 backdrop-blur-sm md:flex">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={storeLinkClass}
                end={link.end}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/minha-conta"
            className={({ isActive }) =>
              cn(
                "hidden items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 sm:inline-flex",
                isActive
                  ? "border-yellow-300 bg-yellow-400 text-neutral-950 shadow-sm"
                  : "border-white/15 bg-white/10 text-white hover:bg-white/15"
              )
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
        <div className="border-t border-white/10 bg-neutral-950/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-2 2xl:max-w-screen-2xl min-[1800px]:max-w-[1760px]">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={storeLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/minha-conta"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
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
