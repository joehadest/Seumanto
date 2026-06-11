import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils.js";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521369909029-afed882baee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506629905607-d9fb1e0673fc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
];

const TEXT_VARIANT = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 22 },
  },
};

function ActionButton({ children, href = "#colecao" }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-4 text-base font-black text-neutral-950 shadow-2xl shadow-yellow-500/20 transition-colors hover:bg-yellow-300"
    >
      {children}
      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
    </motion.a>
  );
}

export function AnimatedMarqueeHero({
  tagline,
  title,
  description,
  ctaText,
  images = [],
  productCountLabel,
  className,
}) {
  const safeImages = images.filter(Boolean).length >= 4 ? images.filter(Boolean) : DEFAULT_IMAGES;
  const duplicatedImages = [...safeImages, ...safeImages];

  return (
    <section
      className={cn(
        "relative left-1/2 mb-0 min-h-[680px] w-screen -translate-x-1/2 overflow-hidden bg-neutral-950 px-5 text-white md:min-h-[740px] 2xl:min-h-[820px]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.22),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-300/10 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.16),rgba(10,10,10,0.5)_58%,rgba(10,10,10,0.92))]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-2 pb-72 pt-20 text-center md:pt-24 2xl:max-w-6xl 2xl:pt-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={TEXT_VARIANT}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-200 backdrop-blur-md"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
          className="mt-7 text-6xl font-black leading-[0.82] tracking-tighter text-white md:text-8xl 2xl:text-9xl"
        >
          {typeof title === "string" ? (
            title.split(" ").map((word) => (
              <motion.span key={word} variants={TEXT_VARIANT} className="inline-block">
                {word}&nbsp;
              </motion.span>
            ))
          ) : (
            title
          )}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={TEXT_VARIANT}
          transition={{ delay: 0.45 }}
          className="mt-7 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={TEXT_VARIANT}
          transition={{ delay: 0.58 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <ActionButton>{ctaText}</ActionButton>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/carrinho"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-8 py-4 text-base font-black text-white backdrop-blur-md transition-colors hover:border-yellow-300/60 hover:bg-white/15"
            >
              <ShoppingBag className="h-5 w-5" />
              Ver carrinho
            </Link>
          </motion.div>
        </motion.div>

        {productCountLabel ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.82 }}
            className="mt-8 text-sm font-bold text-white/55"
          >
            {productCountLabel}
          </motion.p>
        ) : (
          <div className="mt-8 h-5" aria-hidden="true" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[310px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] md:h-[360px] 2xl:h-[430px]">
        <motion.div
          className="flex w-max gap-5 px-5"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ ease: "linear", duration: 46, repeat: Infinity }}
        >
          {duplicatedImages.map((src, index) => (
            <motion.div
              key={`${src}-${index}`}
              initial={{ opacity: 0, y: 28, rotate: index % 2 === 0 ? -4 : 4 }}
              animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -3 : 4 }}
              transition={{ duration: 0.65, delay: Math.min(index * 0.04, 0.7) }}
              className="relative h-56 w-40 shrink-0 overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/35 md:h-72 md:w-52 2xl:h-80 2xl:w-56"
            >
              <img
                src={src}
                alt={`Produto em destaque ${index + 1}`}
                className="h-full w-full object-cover"
                loading={index < 6 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
