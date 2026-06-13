import { motion } from "framer-motion";
import { ArrowUp, Mail, Phone, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const marqueeItems = [
  "Produtos essenciais",
  "Seu manto",
  "Conforto todos os dias",
  "Modelagem minimalista",
];

function MarqueeRow() {
  return (
    <div className="flex items-center gap-8 px-4">
      {marqueeItems.map((item) => (
        <span key={item} className="flex items-center gap-8">
          <span>{item}</span>
          <span className="text-yellow-500">✦</span>
        </span>
      ))}
    </div>
  );
}

function FooterPill({ children, className = "", to, href, ...props }) {
  const Component = to ? Link : "a";

  return (
    <motion.span
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Component
        to={to}
        href={href}
        className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 shadow-sm backdrop-blur transition-colors hover:border-yellow-300/50 hover:bg-white/15 hover:text-white ${className}`}
        {...props}
      >
      {children}
      </Component>
    </motion.span>
  );
}

export default function StoreFooter({ settings }) {
  const footerEmailText =
    settings?.contactInfo?.email?.trim() ||
    settings?.contactInfo?.footerEmailText?.trim() ||
    "contato@seumanto.com";
  const footerServiceText =
    settings?.contactInfo?.phone?.trim() ||
    settings?.contactInfo?.footerServiceText?.trim() ||
    "Atendimento online";

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="storefront-footer relative mt-16 overflow-hidden border-t border-white/10 bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/15 blur-3xl animate-footer-breathe" />

      <div className="relative -mx-4 overflow-visible py-4">
        <div className="overflow-hidden border-y border-yellow-300/20 bg-yellow-300/10 py-3 -rotate-1 scale-105 shadow-sm">
        <div className="flex w-max animate-footer-marquee whitespace-nowrap text-xs font-black uppercase tracking-[0.35em] text-white/55">
          <MarqueeRow />
          <MarqueeRow />
          <MarqueeRow />
          <MarqueeRow />
        </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[18vw] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)]">
        SEU MANTO
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center 2xl:max-w-screen-2xl 2xl:px-8 min-[1800px]:max-w-[1760px]">
        <motion.img
          src="/logo-dark.svg"
          alt="Seu manto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="h-28 w-auto drop-shadow-[0_18px_50px_rgba(250,204,21,0.12)]"
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 max-w-3xl text-4xl font-black tracking-tighter text-white md:text-6xl"
        >
          Seu próximo manto começa aqui.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 md:text-base"
        >
          Produtos com identidade limpa, conforto e presença para o dia a dia.
        </motion.p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <FooterPill to="/">
            Loja
          </FooterPill>
          <FooterPill href="/#colecao">Coleção</FooterPill>
          <FooterPill to="/carrinho" className="gap-2 border-yellow-300 bg-yellow-400 text-neutral-950 hover:bg-yellow-300 hover:text-neutral-950">
            <ShoppingBag className="h-4 w-4" />
            Carrinho
          </FooterPill>
          <FooterPill to="/checkout">
            Checkout
          </FooterPill>
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-3 text-left text-sm text-white/60 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
            <Mail className="mb-2 h-4 w-4 text-yellow-600" />
            {footerEmailText}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
            <Phone className="mb-2 h-4 w-4 text-yellow-600" />
            {footerServiceText}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/35 md:flex-row 2xl:max-w-screen-2xl 2xl:px-8 min-[1800px]:max-w-[1760px]">
        <span>© 2026 Seu manto. Todos os direitos reservados.</span>
        <button
          type="button"
          onClick={scrollToTop}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/55 shadow-sm transition-colors hover:border-yellow-300/50 hover:bg-white/15 hover:text-white"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
