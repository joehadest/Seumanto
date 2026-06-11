import { useEffect, useState } from "react";
import { ArrowRight, Shirt, Sparkles, Star, Tag, Zap } from "lucide-react";
import { formatBRL } from "../../utils/format.js";

const FALLBACK_ICONS = [Sparkles, Star, Shirt, Zap, Tag];

export const FEATURED_PRODUCT_EXAMPLES = [
  {
    _id: "sample-1",
    name: "Manto Essential Preto",
    category: "Camisetas",
    description: "Peça minimalista para qualquer combinação.",
    price: 99.9,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "sample-2",
    name: "Boné Classic",
    category: "Bonés",
    description: "Acessório fácil para fechar o visual.",
    price: 69.9,
    imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "sample-3",
    name: "Oversized Urban",
    category: "Camisetas",
    description: "Modelagem solta, presença forte e conforto.",
    price: 129.9,
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "sample-4",
    name: "Short Street",
    category: "Shorts",
    description: "Conforto para compor looks leves.",
    price: 119.9,
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "sample-5",
    name: "Ecobag Seu Manto",
    category: "Acessórios",
    description: "Acessório prático para o dia a dia.",
    price: 49.9,
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=80",
  },
];

export default function InteractiveSelector({
  items = FEATURED_PRODUCT_EXAMPLES,
  eyebrow = "Vitrine da semana",
  title = "Produtos em destaque",
  description = "Escolhas que chamam atenção no catálogo e deixam a compra mais fácil.",
  onSelect,
}) {
  const safeItems = items.length ? items.slice(0, 6) : FEATURED_PRODUCT_EXAMPLES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState([]);
  const activeItem = safeItems[activeIndex] ?? safeItems[0];

  useEffect(() => {
    setActiveIndex(0);
    setAnimatedOptions([]);
    const timers = safeItems.map((_, index) =>
      window.setTimeout(() => {
        setAnimatedOptions((current) =>
          current.includes(index) ? current : [...current, index]
        );
      }, 120 * index)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [safeItems.length]);

  return (
    <section className="relative left-1/2 mb-10 w-screen -translate-x-1/2 overflow-hidden bg-neutral-950 px-4 pb-8 pt-0 text-white md:px-8 md:pb-10">
      <div className="relative mx-auto grid max-w-6xl gap-6 pt-0 lg:grid-cols-[0.8fr_1.2fr] lg:items-end 2xl:max-w-screen-2xl min-[1800px]:max-w-[1760px]">
        <div className="px-1 py-3 md:px-3">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight md:text-5xl">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
            {description}
          </p>

          {activeItem && onSelect && (
            <button
              type="button"
              onClick={() => onSelect?.(activeItem)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Ver destaque
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex h-[420px] min-w-0 gap-2 overflow-hidden rounded-[1.5rem] bg-black/25 p-2 ring-1 ring-white/10 max-sm:h-auto max-sm:flex-col">
          {safeItems.map((item, index) => {
            const isActive = activeIndex === index;
            const Icon = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
            const coverImage = item.imageUrls?.[0] ?? item.imageUrl;
            const category = item.categories?.[0] ?? item.category;

            return (
              <button
                key={item._id ?? item.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative min-h-[92px] overflow-hidden rounded-[1.15rem] border text-left transition-all duration-700 ease-out max-sm:h-28 ${
                  isActive
                    ? "flex-[7] border-white/80 shadow-2xl"
                    : "flex-1 border-white/10 hover:border-yellow-300/60"
                }`}
                style={{
                  opacity: animatedOptions.includes(index) ? 1 : 0,
                  transform: animatedOptions.includes(index)
                    ? "translateX(0)"
                    : "translateX(-34px)",
                }}
                aria-label={`Ver ${item.name}`}
              >
                <img
                  src={coverImage || "/logo.png"}
                  alt={item.name}
                  className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
                    isActive ? "scale-100" : "scale-110 grayscale-[25%]"
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/55 text-yellow-300 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`min-w-0 transition-all duration-500 ${
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "translate-x-5 opacity-0 max-sm:translate-x-0 max-sm:opacity-100"
                    }`}
                  >
                    <span className="block truncate text-lg font-black leading-tight">
                      {item.name}
                    </span>
                    {category && (
                      <span className="mt-0.5 block truncate text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                        {category}
                      </span>
                    )}
                    <span className="mt-0.5 block truncate text-sm text-white/70">
                      {item.description}
                    </span>
                    {item.price !== undefined && (
                      <span className="mt-1 block text-sm font-black text-yellow-300">
                        {formatBRL(item.price)}
                      </span>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
