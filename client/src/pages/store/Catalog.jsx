import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check, Heart, Loader2, MessageCircle, ShoppingCart, Star, Tag, X } from "lucide-react";
import { productReviewsApi } from "../../api/productReviews.js";
import { useProducts } from "../../hooks/useProducts.js";
import { useProductCategories } from "../../hooks/useProductCategories.js";
import { useCart } from "../../context/CartContext.jsx";
import { formatBRL } from "../../utils/format.js";
import InteractiveSelector from "../../components/ui/interactive-selector.jsx";

const StoreHero = lazy(() => import("../../components/StoreHero.jsx"));

function HeroFallback() {
  return (
    <div className="mb-10 flex min-h-[78vh] flex-col items-center justify-center rounded-[2rem] border border-yellow-100/70 bg-white/70 px-6 text-center shadow-card backdrop-blur-[2px]">
      <img src="/logo.png" alt="Seu manto" className="h-28 w-auto drop-shadow-xl md:h-36" />
      <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-tighter text-neutral-950 md:text-7xl">
        Vista o seu
        <br />
        <span className="text-yellow-500">manto.</span>
      </h1>
    </div>
  );
}

const ALL_SIZES = ["P", "M", "G", "GG"];
const PRODUCT_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6";
const PRODUCT_LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 260,
  damping: 32,
  mass: 0.55,
};

const COLOR_MAP = {
  preto: "#0f0f0f",
  branco: "#f5f5f5",
  "off-white": "#f5f0e8",
  cinza: "#9ca3af",
  "cinza claro": "#d1d5db",
  "azul marinho": "#1e3a5f",
  azul: "#3b82f6",
  vermelho: "#ef4444",
  verde: "#22c55e",
  amarelo: "#eab308",
  rosa: "#ec4899",
  roxo: "#a855f7",
  laranja: "#f97316",
  bege: "#d4b896",
  marrom: "#92400e",
};

function getSwatchColor(name) {
  return COLOR_MAP[name?.toLowerCase().trim()] ?? null;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
      <div className="skeleton aspect-[4/5]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-2/3 rounded-lg" />
        <div className="skeleton h-5 w-1/3 rounded-lg" />
        <div className="flex gap-1.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-7 w-10 rounded-lg" />
          ))}
        </div>
        <div className="skeleton mt-2 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function Catalog({ settings }) {
  const { products, loading, error } = useProducts();
  const { categories: productCategories } = useProductCategories();
  const { addItem } = useCart();

  const [sizeFilter, setSizeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryFilter) {
      list = list.filter((p) =>
        (p.categories?.length ? p.categories : [p.category || "Camisetas"]).includes(
          categoryFilter
        )
      );
    }
    if (sizeFilter) list = list.filter((p) => p.sizes?.includes(sizeFilter));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, categoryFilter, sizeFilter, maxPrice, sort]);

  const categories = useMemo(() => {
    const names = new Set([
      ...productCategories.map((category) => category.name),
      ...products.flatMap((product) =>
        product.categories?.length ? product.categories : [product.category || "Camisetas"]
      ),
    ]);

    return [...names]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [productCategories, products]);

  const featuredProducts = useMemo(() => {
    const ids = settings?.featuredProductIds ?? [];
    if (!ids.length) return [];

    const byId = new Map(products.map((product) => [product._id, product]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, [products, settings?.featuredProductIds]);

  const heroImages = useMemo(() => {
    const urls = products.flatMap((product) =>
      product.imageUrls?.length ? product.imageUrls : [product.imageUrl]
    );

    return [...new Set(urls.filter(Boolean))].slice(0, 12);
  }, [products]);

  const hasFilters = categoryFilter || sizeFilter || maxPrice;

  return (
    <div className="animate-fade-in">
      <Suspense fallback={<HeroFallback />}>
        <StoreHero productCount={products.length} loading={loading} images={heroImages} />
      </Suspense>

      <InteractiveSelector
        items={featuredProducts}
        onSelect={featuredProducts.length ? setSelectedProduct : undefined}
      />

      {/* Filters */}
      <div id="colecao" className="mb-8 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-white shadow-2xl shadow-black/20 backdrop-blur-xl transition-shadow duration-300 hover:shadow-card-hover">
        <div className="flex flex-wrap items-end gap-5">
          <div className="min-w-full">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Categoria
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryFilter("")}
                className={`rounded-full px-4 py-2 text-sm font-black transition-all duration-150 ${
                  !categoryFilter
                    ? "bg-yellow-400 text-neutral-950 shadow-sm"
                    : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
                }`}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(categoryFilter === category ? "" : category)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-black transition-all duration-150 ${
                    categoryFilter === category
                      ? "bg-yellow-400 text-neutral-950 shadow-sm"
                      : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Size pills */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Tamanho
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSizeFilter("")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                  !sizeFilter
                    ? "bg-yellow-400 text-neutral-900 shadow-sm"
                    : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
                }`}
              >
                Todos
              </button>
              {ALL_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSizeFilter(sizeFilter === s ? "" : s)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                    sizeFilter === s
                      ? "bg-yellow-400 text-neutral-900 shadow-sm"
                      : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Preço máximo
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                R$
              </span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sem limite"
                className="input-field w-36 pl-8"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Ordenar
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field w-44"
            >
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setCategoryFilter("");
                setSizeFilter("");
                setMaxPrice("");
              }}
              className="ml-auto flex items-center gap-1 text-sm font-medium text-yellow-300 transition-colors hover:text-yellow-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 animate-slide-down">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-red-500">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="text-sm text-red-700">
            <p className="font-semibold">Falha ao carregar produtos</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className={PRODUCT_GRID_CLASS}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          key="empty-products"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.06] py-16 text-center text-white backdrop-blur"
        >
          <span className="mb-3 text-5xl">👕</span>
          <p className="font-semibold text-white">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-white/45">Tente ajustar os filtros acima</p>
        </motion.div>
      ) : (
        <LayoutGroup>
          <motion.div
            layout
            className={PRODUCT_GRID_CLASS}
            transition={{ layout: PRODUCT_LAYOUT_TRANSITION }}
          >
            <AnimatePresence initial>
              {filtered.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDetails={() => setSelectedProduct(product)}
                  animDelay={Math.min(i * 18, 110)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addItem}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onDetails, animDelay = 0 }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const images = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
    ? [product.imageUrl]
    : [];
  const rating = 4.8;
  const reviewCount = Math.max(12, product.stock + 18);
  const categories = product.categories?.length ? product.categories : [product.category || "Camisetas"];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(4px)" }}
      transition={{
        opacity: { duration: 0.2, delay: animDelay / 1000, ease: "easeOut" },
        y: { type: "spring", stiffness: 280, damping: 28, delay: animDelay / 1000 },
        scale: { duration: 0.2, delay: animDelay / 1000, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.16, delay: animDelay / 1000 },
        layout: PRODUCT_LAYOUT_TRANSITION,
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white text-neutral-900 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {images.length > 0 ? (
          <motion.img
            src={images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-yellow-50/70 text-neutral-300">
            <img src="/logo.png" alt="" className="h-24 w-auto opacity-35 grayscale" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-900 shadow-sm">
            <Tag className="h-3 w-3" />
            {categories[0]}
          </div>
          {categories.length > 1 && (
            <div className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-700 shadow-sm">
              +{categories.length - 1} categoria{categories.length > 2 ? "s" : ""}
            </div>
          )}
          {lowStock && (
            <div className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              Últimas {product.stock}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted((value) => !value);
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-neutral-950/65 shadow-sm backdrop-blur transition-all duration-200 hover:bg-neutral-900 ${
            isWishlisted ? "text-yellow-300" : "text-white/75"
          }`}
          aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-yellow-400" : ""}`} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-neutral-300 bg-white/90 px-4 py-1.5 text-sm font-semibold text-neutral-500 shadow-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="space-y-3">
          <div>
            <h3 className="line-clamp-1 font-semibold leading-snug text-neutral-900">
              {product.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-semibold text-neutral-800">{rating}</span>
              </div>
              <span className="text-xs text-neutral-400">({reviewCount} avaliações)</span>
              <span className="ml-auto text-xs font-medium text-yellow-700">Frete a combinar</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-950">{formatBRL(product.price)}</span>
          </div>
        </div>

        {product.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-400">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-300">{product.stock} em estoque</p>
        </div>

        <button
          type="button"
          onClick={onDetails}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-neutral-900 transition-all duration-200 hover:bg-yellow-500 active:scale-[0.97]"
        >
          Ver detalhes
        </button>
      </div>
    </motion.article>
  );
}

function ProductDetailsModal({ product, onClose, onAdd }) {
  const images = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
    ? [product.imageUrl]
    : [];
  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [color, setColor] = useState(product.colors?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const outOfStock = product.stock <= 0;
  const hasSizes = product.sizes?.length > 0;
  const hasColors = product.colors?.length > 0;
  const categories = product.categories?.length ? product.categories : [product.category || "Produto"];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("product-modal-open");
    let active = true;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewError("");
      try {
        const data = await productReviewsApi.listByProduct(product._id);
        if (active) setReviews(data);
      } catch (err) {
        if (active) setReviewError(err.message);
      } finally {
        if (active) setReviewsLoading(false);
      }
    }

    loadReviews();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      active = false;
      document.body.style.overflow = "";
      document.body.classList.remove("product-modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, product._id]);

  useEffect(() => {
    setSelectedImage(images[0] ?? "");
  }, [product._id]);

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 4.8;

  function handleAdd() {
    if (outOfStock || isAdding || added) return;
    if (hasSizes && !size) return;

    setIsAdding(true);
    setTimeout(() => {
      onAdd(product, { size, color, quantity });
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }, 450);
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    const comment = reviewForm.comment.trim();
    if (!comment) return;

    setReviewError("");
    try {
      const created = await productReviewsApi.create({
        productId: product._id,
        customerName: reviewForm.name.trim() || "Cliente Seu manto",
        rating: reviewForm.rating,
        comment,
      });
      setReviews((current) => [created, ...current]);
      setReviewForm({ name: "", rating: 5, comment: "" });
    } catch (err) {
      setReviewError(err.message);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl shadow-black/70 2xl:max-w-6xl min-[1800px]:max-w-7xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-white/60 shadow-sm transition-colors hover:bg-yellow-400 hover:text-neutral-950"
          aria-label="Fechar detalhes do produto"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[92vh] overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="bg-neutral-950 p-4 md:p-6">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-white/[0.06]">
                    <img src="/logo.png" alt="" className="h-32 w-auto opacity-40 grayscale" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {images.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`overflow-hidden rounded-xl border bg-neutral-900 transition ${
                        selectedImage === imageUrl
                          ? "border-yellow-400 ring-2 ring-yellow-400/20"
                          : "border-white/10 hover:border-yellow-300/60"
                      }`}
                      aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                    >
                      <img
                        src={imageUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 md:p-7">
              <div className="mb-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-yellow-700"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {category}
                  </span>
                ))}
              </div>

              <h2 className="text-2xl font-bold leading-tight text-neutral-950 md:text-3xl">
                {product.name}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <RatingStars rating={averageRating} />
                  <span className="ml-1 text-sm font-semibold text-neutral-800">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-yellow-700 hover:underline"
                  onClick={() => document.getElementById("produto-avaliacoes")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {reviews.length || "Sem"} avaliaç{reviews.length === 1 ? "ão" : "ões"}
                </button>
              </div>

              <div className="mt-5">
                <p className="text-3xl font-black tracking-tight text-neutral-950">
                  {formatBRL(product.price)}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Pagamento 100% seguro. Separe seu produto antes que acabe.
                </p>
              </div>

              {product.description && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm font-semibold text-neutral-900">Descrição</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{product.description}</p>
                </div>
              )}

              <div className="mt-6 space-y-5">
                {hasColors && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-neutral-900">
                      Cor: <span className="font-normal text-neutral-500">{color}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => {
                        const hex = getSwatchColor(c);
                        const isSelected = color === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            title={c}
                            className={`h-9 w-9 rounded-full transition-all ${
                              isSelected
                                ? "ring-2 ring-yellow-400 ring-offset-2"
                                : "ring-1 ring-neutral-200 hover:ring-yellow-300"
                            }`}
                            style={{ backgroundColor: hex ?? "#facc15" }}
                            aria-label={`Selecionar cor ${c}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {hasSizes && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-neutral-900">
                      Tamanho: <span className="font-normal text-neutral-500">{size}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          className={`flex h-10 min-w-12 items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${
                            size === s
                              ? "bg-yellow-400 text-neutral-950"
                              : "border border-white/10 bg-white/[0.06] text-white/70 hover:border-yellow-300/60 hover:bg-white/[0.1]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-semibold text-neutral-900">Quantidade</p>
                  <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="flex h-10 w-10 items-center justify-center text-white/55 hover:bg-white/[0.08] hover:text-white"
                    >
                      -
                    </button>
                    <span className="flex h-10 min-w-12 items-center justify-center border-x border-white/10 text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}
                      className="flex h-10 w-10 items-center justify-center text-white/55 hover:bg-white/[0.08] hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-sm">
                <p className="text-sm font-semibold text-neutral-900">
                  {outOfStock ? "Produto esgotado" : `${product.stock} unidades disponíveis`}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Envio e pagamento combinados na finalização do pedido.
                </p>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAdd}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
                  isAdding
                    ? "bg-yellow-300 text-neutral-900"
                    : added
                    ? "bg-white text-neutral-950"
                    : outOfStock
                    ? "cursor-not-allowed bg-white/[0.08] text-white/35"
                    : "bg-yellow-400 text-neutral-950 hover:bg-yellow-500"
                }`}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Adicionado ao carrinho
                  </>
                ) : outOfStock ? (
                  "Esgotado"
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar ao carrinho
                  </>
                )}
              </button>
            </div>
          </div>

          <div id="produto-avaliacoes" className="border-t border-white/10 bg-neutral-900 p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h3 className="text-xl font-bold text-neutral-950">Avaliações do produto</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Conte para outros clientes o que achou desse manto.
                </p>

                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <input
                    value={reviewForm.name}
                    onChange={(event) => setReviewForm((form) => ({ ...form, name: event.target.value }))}
                    placeholder="Seu nome (opcional)"
                    className="input-field"
                  />

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Sua nota
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm((form) => ({ ...form, rating: star }))}
                          className="rounded p-0.5"
                          aria-label={`Avaliar com ${star} estrela${star !== 1 ? "s" : ""}`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewForm.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))}
                    placeholder="Escreva sua avaliação..."
                    rows={4}
                    className="input-field resize-none"
                    required
                  />

                  <button type="submit" className="btn-primary w-full gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Enviar avaliação
                  </button>

                  {reviewError && (
                    <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {reviewError}
                    </p>
                  )}
                </form>
              </div>

              <div className="space-y-3">
                {reviewsLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-center text-sm text-white/45">
                    Carregando avaliações...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.05] p-6 text-center text-sm text-white/50">
                    Ainda não há avaliações. Seja o primeiro cliente a avaliar.
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-neutral-900">{review.customerName}</p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-neutral-300"
          }`}
        />
      ))}
    </div>
  );
}
