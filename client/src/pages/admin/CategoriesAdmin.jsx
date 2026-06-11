import { useMemo, useState } from "react";
import {
  FolderOpen,
  Layers3,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useProductCategories } from "../../hooks/useProductCategories.js";

const EMPTY_FORM = {
  name: "",
  description: "",
  sortOrder: "",
};

export default function CategoriesAdmin() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    removeCategory,
  } = useProductCategories();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;

    return categories.filter((category) =>
      [category.name, category.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [categories, query]);

  function startEdit(category) {
    setEditingId(category._id);
    setForm({
      name: category.name ?? "",
      description: category.description ?? "",
      sortOrder: category.sortOrder ?? "",
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const name = form.name.trim();

    if (!name) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name,
        description: form.description,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editingId) await updateCategory(editingId, payload);
      else await createCategory(payload);

      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (
      !confirm(
        `Excluir a categoria "${category.name}"? Produtos que já usam esse nome continuam cadastrados.`
      )
    ) {
      return;
    }

    try {
      await removeCategory(category._id);
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
              Organização do catálogo
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-950">
              Categorias
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Crie categorias para selecionar ao cadastrar ou editar produtos.
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm">
            <Layers3 className="mb-2 h-5 w-5 text-yellow-700" />
            <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
              Total
            </p>
            <p className="mt-1 text-xl font-black text-neutral-950">{categories.length}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[410px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-card"
        >
          <div className="border-b border-neutral-100 bg-neutral-50/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-yellow-700">
                  {editingId ? "Modo edição" : "Cadastro"}
                </p>
                <h2 className="mt-1 text-xl font-black text-neutral-950">
                  {editingId ? "Editar categoria" : "Nova categoria"}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950 shadow-sm">
                {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <FormField icon={FolderOpen} label="Nome" required>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ex: Camisetas"
                className="input-field"
              />
            </FormField>

            <FormField label="Descrição">
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                rows={3}
                placeholder="Ex: Produtos de vestuário principal da loja"
                className="input-field resize-none"
              />
            </FormField>

            <FormField label="Ordem de exibição">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm({ ...form, sortOrder: event.target.value })
                }
                placeholder="10"
                className="input-field"
              />
            </FormField>

            {formError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {formError}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar categoria"}
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
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar categoria..."
                className="input-field pl-9"
              />
            </label>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="skeleton h-40 rounded-3xl" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white py-14 text-center">
              <FolderOpen className="mb-3 h-10 w-10 text-neutral-300" />
              <p className="font-semibold text-neutral-700">Nenhuma categoria encontrada.</p>
              <p className="mt-1 text-sm text-neutral-400">
                Use o formulário ao lado para adicionar.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCategories.map((category) => (
                <article
                  key={category._id}
                  className="rounded-[1.5rem] border border-neutral-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-neutral-950">
                        {category.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                        {category.description || "Sem descrição cadastrada."}
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-black text-yellow-700">
                      Ordem {category.sortOrder}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="btn-primary flex-1 gap-2 py-2.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
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
