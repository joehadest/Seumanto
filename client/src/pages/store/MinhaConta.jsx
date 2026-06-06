import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  LogOut,
  MapPin,
  PackageCheck,
  Palette,
  Ruler,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { profilesApi } from "../../api/profiles.js";
import { supabase } from "../../lib/supabase.js";

const EMPTY_FORM = {
  name: "",
  phone: "",
  address: {
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
    preferences: {
      nickname: "",
      favoriteSize: "",
      favoriteColor: "",
      style: "",
      newsletter: true,
      whatsappUpdates: true,
    },
  },
};

const sections = [
  { id: "perfil", label: "Perfil", icon: UserRound },
  { id: "entrega", label: "Entrega", icon: MapPin },
  { id: "preferencias", label: "Preferências", icon: Heart },
];

function getInitials(name, email) {
  const source = name?.trim() || email || "SM";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function MinhaConta() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [email, setEmail] = useState("");
  const [activeSection, setActiveSection] = useState("perfil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        const profile = await profilesApi.getCurrent();
        if (!active) return;
        setEmail(data.user?.email ?? "");
        if (profile) {
          setForm({
            name: profile.name,
            phone: profile.phone,
            address: {
              ...EMPTY_FORM.address,
              ...(profile.address ?? {}),
              preferences: {
                ...EMPTY_FORM.address.preferences,
                ...(profile.address?.preferences ?? {}),
              },
            },
          });
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    if (name.startsWith("address.")) {
      const key = name.replace("address.", "");
      setForm((current) => ({
        ...current,
        address: { ...current.address, [key]: value },
      }));
      return;
    }
    if (name.startsWith("preferences.")) {
      const key = name.replace("preferences.", "");
      setForm((current) => ({
        ...current,
        address: {
          ...current.address,
          preferences: {
            ...current.address.preferences,
            [key]: type === "checkbox" ? checked : value,
          },
        },
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await profilesApi.upsertCurrent(form);
      setMessage("Sua conta foi atualizada com sucesso.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLeaving(true);
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  if (loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  const preferences = form.address.preferences;
  const addressPreview = [
    form.address.street,
    form.address.number,
    form.address.neighborhood,
    form.address.city && form.address.state ? `${form.address.city} - ${form.address.state}` : form.address.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div className="mb-6 overflow-hidden rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-white p-6 shadow-card">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-950 text-2xl font-black text-yellow-300 shadow-lg shadow-neutral-950/15">
              {getInitials(preferences.nickname || form.name, email)}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">Área do cliente</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-950">
                {preferences.nickname || form.name || "Minha Conta"}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">{email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/meus-pedidos" className="btn-accent gap-2">
              <PackageCheck className="h-4 w-4" />
              Meus pedidos
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={leaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {leaving ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={ShieldCheck} label="Conta segura" value="Login protegido" />
          <SummaryCard icon={MapPin} label="Entrega" value={addressPreview || "Adicionar endereço"} />
          <SummaryCard icon={Palette} label="Estilo" value={preferences.style || "Personalizar"} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border border-neutral-100 bg-white p-3 shadow-card">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all last:mb-0 ${
                  active
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:bg-yellow-50 hover:text-neutral-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </aside>

        <form onSubmit={handleSubmit} className="card p-6">
          {activeSection === "perfil" && (
            <section>
              <SectionHeader
                icon={UserRound}
                title="Dados pessoais"
                description="Escolha como quer ser chamado e mantenha seus contatos atualizados."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo" name="name" value={form.name} onChange={handleChange} />
                <Field label="Como quer ser chamado" name="preferences.nickname" value={preferences.nickname} onChange={handleChange} />
                <Field label="Telefone" name="phone" value={form.phone} onChange={handleChange} />
                <Field label="E-mail" value={email} disabled />
              </div>
            </section>
          )}

          {activeSection === "entrega" && (
            <section>
              <SectionHeader
                icon={MapPin}
                title="Endereço de entrega"
                description="Organize seus dados para o checkout já vir preenchido nas próximas compras."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CEP" name="address.cep" value={form.address.cep} onChange={handleChange} />
                <Field label="Rua" name="address.street" value={form.address.street} onChange={handleChange} />
                <Field label="Número" name="address.number" value={form.address.number} onChange={handleChange} />
                <Field label="Bairro" name="address.neighborhood" value={form.address.neighborhood} onChange={handleChange} />
                <Field label="Cidade" name="address.city" value={form.address.city} onChange={handleChange} />
                <Field label="UF" name="address.state" value={form.address.state} onChange={handleChange} maxLength={2} />
                <div className="sm:col-span-2">
                  <Field
                    label="Complemento ou referência"
                    name="address.complement"
                    value={form.address.complement}
                    onChange={handleChange}
                    placeholder="Apto, bloco, ponto de referência..."
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === "preferencias" && (
            <section>
              <SectionHeader
                icon={Heart}
                title="Preferências da loja"
                description="Personalize sua experiência para facilitar próximas escolhas."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Tamanho favorito"
                  name="preferences.favoriteSize"
                  value={preferences.favoriteSize}
                  onChange={handleChange}
                  options={["", "PP", "P", "M", "G", "GG", "XG"]}
                />
                <Field
                  label="Cor favorita"
                  name="preferences.favoriteColor"
                  value={preferences.favoriteColor}
                  onChange={handleChange}
                  placeholder="Preto, branco, amarelo..."
                />
                <SelectField
                  label="Estilo preferido"
                  name="preferences.style"
                  value={preferences.style}
                  onChange={handleChange}
                  options={["", "Casual", "Oversized", "Streetwear", "Minimalista", "Esportivo"]}
                />
                <PreferenceCard icon={Ruler} title="Guia rápido" text="O tamanho favorito fica salvo para você consultar nos próximos pedidos." />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ToggleField
                  icon={Bell}
                  label="Receber novidades por e-mail"
                  name="preferences.newsletter"
                  checked={preferences.newsletter}
                  onChange={handleChange}
                />
                <ToggleField
                  icon={PackageCheck}
                  label="Receber atualizações por WhatsApp"
                  name="preferences.whatsappUpdates"
                  checked={preferences.whatsappUpdates}
                  onChange={handleChange}
                />
              </div>
            </section>
          )}

          {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
          {message && <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{message}</div>}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-5">
            <p className="text-xs text-neutral-400">Suas alterações ficam salvas na sua conta Seu Manto.</p>
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</span>
      <input {...props} className="input-field" />
    </label>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</span>
      <select {...props} className="input-field">
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "Selecionar"}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-black text-neutral-950">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
      <Icon className="mb-2 h-5 w-5 text-yellow-600" />
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function PreferenceCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
      <Icon className="mb-2 h-5 w-5 text-yellow-700" />
      <p className="font-bold text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{text}</p>
    </div>
  );
}

function ToggleField({ icon: Icon, label, ...props }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition-colors hover:bg-yellow-50">
      <span className="flex items-center gap-3 text-sm font-bold text-neutral-800">
        <Icon className="h-5 w-5 text-yellow-700" />
        {label}
      </span>
      <input type="checkbox" {...props} className="h-5 w-5 rounded border-neutral-300 text-yellow-400 focus:ring-yellow-200" />
    </label>
  );
}
