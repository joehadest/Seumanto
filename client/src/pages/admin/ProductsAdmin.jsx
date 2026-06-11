import { useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Image,
  Package,
  Palette,
  Pencil,
  Plus,
  Ruler,
  Save,
  Search,
  Shirt,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useProducts } from "../../hooks/useProducts.js";
import { useProductCategories } from "../../hooks/useProductCategories.js";
import { formatBRL } from "../../utils/format.js";

const ALL_SIZES = ["P", "M", "G", "GG"];
const EMPTY_FORM = {
  name: "",
  categories: ["Camisetas"],
  description: "",
  price: "",
  stock: "",
  imageUrls: [""],
  sizes: [],
  colors: "",
};

const COLOR_MAP = {
  preto: "#111827",
  branco: "#f8fafc",
  cinza: "#9ca3af",
  amarelo: "#facc15",
  azul: "#3b82f6",
  vermelho: "#ef4444",
  verde: "#22c55e",
  rosa: "#ec4899",
  roxo: "#a855f7",
  bege: "#d6b98c",
  marrom: "#92400e",
};

function colorToHex(color) {
  return COLOR_MAP[String(color).toLowerCase().trim()] ?? "#facc15";
}

function cleanImageUrls(value) {
  const urls = Array.isArray(value) ? value : [value];
  return [...new Set(urls.map((url) => String(url ?? "").trim()).filter(Boolean))];
}

export default function ProductsAdmin() {
  const { products, loading, error, createProduct, updateProduct, removeProduct } =
    useProducts();
  const { categories, error: categoriesError } = useProductCategories();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("todos");

  const metrics = useMemo(() => {
    const totalStock = products.reduce((acc, product) => acc + Number(product.stock || 0), 0);
    const inventoryValue = products.reduce(
      (acc, product) => acc + Number(product.stock || 0) * Number(product.price || 0),
      0
    );
    return {
      total: products.length,
      totalStock,
      categories: new Set(
        products.flatMap((product) => product.categories?.length ? product.categories : [product.category || "Camisetas"])
      ).size,
      lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
      outOfStock: products.filter((product) => product.stock === 0).length,
      inventoryValue,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const searchable = [
        product.name,
        ...(product.categories?.length ? product.categories : [product.category]),
        product.description,
        ...(product.sizes ?? []),
        ...(product.colors ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesStock =
        stockFilter === "todos" ||
        (stockFilter === "disponivel" && product.stock > 5) ||
        (stockFilter === "baixo" && product.stock > 0 && product.stock <= 5) ||
        (stockFilter === "esgotado" && product.stock === 0);

      return matchesQuery && matchesStock;
    });
  }, [products, query, stockFilter]);

  const categoryOptions = useMemo(() => {
    const names = new Set([
      ...categories.map((category) => category.name),
      ...products.flatMap((product) =>
        product.categories?.length ? product.categories : [product.category || "Camisetas"]
      ),
      "Camisetas",
    ]);

    return [...names]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [categories, products]);

  const formColors = useMemo(
    () => form.colors.split(",").map((color) => color.trim()).filter(Boolean),
    [form.colors]
  );
  const formImageUrls = useMemo(() => cleanImageUrls(form.imageUrls), [form.imageUrls]);
  const previewImageUrl = formImageUrls[0] ?? "";

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name ?? "",
      categories: product.categories?.length
        ? product.categories
        : [product.category ?? "Camisetas"],
      description: product.description ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      imageUrls: (product.imageUrls?.length ? product.imageUrls : [product.imageUrl])
        .filter(Boolean),
      sizes: product.sizes ?? [],
      colors: (product.colors ?? []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function toggleSize(size) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  }

  function toggleCategory(category) {
    setForm((prev) => {
      const current = prev.categories ?? [];
      const selected = current.includes(category);
      const next = selected
        ? current.filter((item) => item !== category)
        : [...current, category];

      return {
        ...prev,
        categories: next.length ? next : ["Camisetas"],
      };
    });
  }

  function updateImageUrl(index, value) {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, currentIndex) =>
        currentIndex === index ? value : url
      ),
    }));
  }

  function addImageUrl() {
    setForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  }

  function removeImageUrl(index) {
    setForm((prev) => {
      const next = prev.imageUrls.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...prev,
        imageUrls: next.length ? next : [""],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Informe o nome do produto.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      name: form.name,
      categories: form.categories,
      description: form.description,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      imageUrls: formImageUrls,
      sizes: form.sizes,
      colors: form.colors,
    };
    try {
      if (editingId) await updateProduct(editingId, payload);
      else await createProduct(payload);
      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
    try {
      await removeProduct(id);
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">
              Catálogo Seu Manto
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-950">Produtos</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Cadastre, organize e acompanhe todos os tipos de produtos da loja.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard icon={Shirt} label="Produtos" value={metrics.total} />
          <MetricCard icon={Tag} label="Categorias" value={metrics.categories} />
          <MetricCard icon={Package} label="Peças em estoque" value={metrics.totalStock} />
          <MetricCard icon={AlertTriangle} label="Estoque baixo" value={metrics.lowStock} />
          <MetricCard icon={X} label="Esgotados" value={metrics.outOfStock} />
          <MetricCard icon={DollarSign} label="Valor em estoque" value={formatBRL(metrics.inventoryValue)} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[410px_1fr] 2xl:grid-cols-[440px_1fr] min-[1800px]:grid-cols-[470px_1fr]">
        <form onSubmit={handleSubmit} className="h-fit overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-card">
          <div className="border-b border-neutral-100 bg-neutral-50/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-yellow-700">
                  {editingId ? "Modo edição" : "Cadastro"}
                </p>
                <h2 className="mt-1 text-xl font-black text-neutral-950">
                  {editingId ? "Editar produto" : "Novo produto"}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950 shadow-sm">
                {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-5 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
              <div className="aspect-[16/10] bg-white">
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Prévia do produto"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-neutral-300">
                    <Image className="h-10 w-10" />
                    <p className="mt-2 text-sm font-semibold">Prévia da imagem</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-neutral-900">
                    {form.name || "Nome do produto"}
                  </p>
                  <p className="text-sm font-semibold text-yellow-700">
                    {formatBRL(Number(form.price) || 0)}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-500 ring-1 ring-neutral-100">
                  {Number(form.stock) || 0} un.
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <FormField icon={Shirt} label="Nome" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Camiseta Básica Preta"
                  className="input-field"
                />
              </FormField>

              <FormField icon={Tag} label="Categorias">
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`rounded-full px-3 py-2 text-xs font-black transition-all ${
                        form.categories.includes(category)
                          ? "bg-yellow-400 text-neutral-950 shadow-sm ring-2 ring-yellow-100"
                          : "border border-neutral-200 bg-white text-neutral-600 hover:border-yellow-300 hover:bg-yellow-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  Selecione todas as categorias que ajudam o cliente a encontrar o produto.
                </p>
                {categoriesError && (
                  <p className="mt-1 text-xs text-amber-600">
                    Cadastre categorias na aba Categorias após aplicar a migration.
                  </p>
                )}
              </FormField>

              <FormField icon={Image} label="Imagens do produto">
                <div className="space-y-2">
                  {form.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-100">
                        {url.trim() ? (
                          <img
                            key={`${url}-${index}`}
                            src={url}
                            alt={`Prévia ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Image className="h-5 w-5 text-neutral-300" />
                        )}
                      </div>
                      <input
                        value={url}
                        onChange={(event) => updateImageUrl(index, event.target.value)}
                        placeholder={
                          index === 0
                            ? "URL da imagem principal"
                            : `URL da imagem ${index + 1}`
                        }
                        className="input-field"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 transition-colors hover:bg-red-50"
                        title="Remover imagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  A primeira imagem será usada como capa do produto.
                </p>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl border border-yellow-100 bg-yellow-50 px-3 py-2 text-xs font-black text-yellow-700 transition-colors hover:bg-yellow-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar imagem
                </button>
              </FormField>

              <FormField label="Descrição">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Detalhes do produto..."
                  className="input-field resize-none"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField icon={DollarSign} label="Preço (R$)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="79,90"
                    className="input-field"
                  />
                </FormField>
                <FormField icon={Package} label="Estoque">
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </FormField>
              </div>

              <FormField icon={Ruler} label="Tamanhos">
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`flex h-10 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-black transition-all duration-150 ${
                        form.sizes.includes(s)
                          ? "bg-yellow-400 text-neutral-950 shadow-sm ring-2 ring-yellow-200"
                          : "border border-neutral-200 bg-white text-neutral-600 hover:border-yellow-300 hover:bg-yellow-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField icon={Palette} label="Cores (separadas por vírgula)">
                <input
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Preto, Branco, Azul Marinho"
                  className="input-field"
                />
                {formColors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formColors.map((color) => (
                      <span key={color} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-600 ring-1 ring-neutral-100">
                        <span
                          className="h-3 w-3 rounded-full ring-1 ring-neutral-200"
                          style={{ backgroundColor: colorToHex(color) }}
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                )}
              </FormField>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar produto"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-ghost gap-2">
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="min-w-0">
          <div className="mb-4 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome, categoria, descrição, cor ou tamanho..."
                  className="input-field pl-9"
                />
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="input-field"
              >
                <option value="todos">Todos os estoques</option>
                <option value="disponivel">Disponível</option>
                <option value="baixo">Estoque baixo</option>
                <option value="esgotado">Esgotado</option>
              </select>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black text-neutral-950">
              Produtos cadastrados{" "}
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-500">
                {filteredProducts.length}
              </span>
            </h2>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 min-[1800px]:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-64 rounded-3xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyProducts />
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-white py-14 text-center">
              <Search className="mx-auto mb-3 h-9 w-9 text-neutral-300" />
              <p className="font-semibold text-neutral-700">Nenhum produto encontrado</p>
              <p className="mt-1 text-sm text-neutral-400">Tente limpar a busca ou alterar o filtro.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 min-[1800px]:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductAdminCard
                  key={product._id}
                  product={product}
                  onEdit={() => startEdit(product)}
                  onDelete={() => handleDelete(product._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProductAdminCard({ product, onEdit, onDelete }) {
  const stockState =
    product.stock === 0 ? "esgotado" : product.stock <= 5 ? "baixo" : "disponivel";
  const imageCount = product.imageUrls?.length ?? (product.imageUrl ? 1 : 0);
  const categories = product.categories?.length ? product.categories : [product.category || "Camisetas"];

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-neutral-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-yellow-50">
            <Shirt className="h-12 w-12 text-yellow-200" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StockBadge stock={product.stock} state={stockState} />
        </div>
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-neutral-700 shadow-sm">
            {imageCount} imagens
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-sm transition-colors hover:bg-yellow-50"
            title="Editar produto"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50"
            title="Excluir produto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap gap-1">
              {categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="inline-flex rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-yellow-700"
                >
                  {category}
                </span>
              ))}
              {categories.length > 3 && (
                <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-black text-neutral-500">
                  +{categories.length - 3}
                </span>
              )}
            </div>
            <h3 className="truncate font-black text-neutral-950">{product.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-400">
              {product.description || "Sem descrição cadastrada."}
            </p>
          </div>
          <p className="shrink-0 text-lg font-black tabular-nums text-neutral-950">
            {formatBRL(product.price)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(product.sizes ?? []).map((size) => (
            <span key={size} className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600">
              {size}
            </span>
          ))}
          {(product.colors ?? []).slice(0, 4).map((color) => (
            <span key={color} className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-1 text-xs font-bold text-neutral-600">
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-neutral-200"
                style={{ backgroundColor: colorToHex(color) }}
              />
              {color}
            </span>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onEdit} className="btn-primary flex-1 gap-2 py-2.5 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}

function StockBadge({ stock, state }) {
  const classes = {
    disponivel: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    baixo: "bg-amber-50 text-amber-700 ring-amber-100",
    esgotado: "bg-red-50 text-red-600 ring-red-100",
  };

  const label = state === "esgotado" ? "Esgotado" : state === "baixo" ? `Baixo · ${stock}` : `${stock} em estoque`;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ring-1 ${classes[state]}`}>
      {label}
    </span>
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

function EmptyProducts() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white py-14 text-center">
      <Shirt className="mb-3 h-10 w-10 text-neutral-300" />
      <p className="font-semibold text-neutral-700">Nenhum produto cadastrado.</p>
      <p className="mt-1 text-sm text-neutral-400">Use o formulário ao lado para adicionar.</p>
    </div>
  );
}

function FormField({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-neutral-700">
        {Icon && <Icon className="h-3.5 w-3.5 text-yellow-700" />}
        <span>
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </span>
      </label>
      {children}
    </div>
  );
}
