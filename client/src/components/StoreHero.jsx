import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function StoreHero({ productCount = 0, loading = false }) {
  const countLabel = loading
    ? "Carregando coleção..."
    : `${productCount} peça${productCount !== 1 ? "s" : ""} disponível${productCount !== 1 ? "is" : ""}`;

  return (
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-neutral-100 bg-white shadow-card">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:py-20">
        <motion.img
          src="/logo.png"
          alt="Seu manto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 h-28 w-auto md:h-36"
        />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-6 text-5xl font-black leading-[0.9] tracking-tighter text-neutral-950 md:text-7xl"
        >
          <span className="block">Vista o seu</span>
          <span className="block text-yellow-500">manto.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600"
        >
          Produtos essenciais, conforto e visual minimalista para
          acompanhar o seu dia a dia com a cara da{" "}
          <span className="font-semibold text-neutral-900">Seu manto</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <motion.a
            href="#colecao"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-lg font-semibold text-neutral-900 shadow-xl transition-colors hover:bg-yellow-500"
          >
            Ver coleção
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </motion.a>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/carrinho"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-8 py-4 text-lg font-semibold text-neutral-800 transition-colors hover:border-yellow-400"
            >
              <ShoppingBag className="h-5 w-5" />
              Ver carrinho
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 text-sm font-medium text-neutral-500"
        >
          {countLabel}
        </motion.p>
      </div>
    </section>
  );
}
