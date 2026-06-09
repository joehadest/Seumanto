import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { useStoreSettings } from "../../hooks/useStoreSettings.js";
import { useProducts } from "../../hooks/useProducts.js";
import { formatBRL } from "../../utils/format.js";

const EMPTY_FORM = {
  storeName: "Seu manto",
  maintenanceMode: false,
  contactEmail: "",
  contactPhone: "",
  featuredProductIds: [],
  freeShippingMinAmount: "",
  flatRate: "",
};

export default function SettingsAdmin() {
  const navigate = useNavigate();
  const { settings, loading, error, saveSettings } = useStoreSettings();
  const { products, loading: productsLoading } = useProducts();
  const [form, setForm] = useState(EMPTY_FORM);
  const [account, setAccount] = useState({
    currentEmail: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const [accountFeedback, setAccountFeedback] = useState("");
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setAccount((prev) => ({
        ...prev,
        currentEmail: data.user?.email ?? "",
        newEmail: data.user?.email ?? "",
      }));
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!settings) return;
    setForm({
      storeName: settings.storeName ?? "Seu manto",
      maintenanceMode: Boolean(settings.maintenanceMode),
      contactEmail:
        settings.contactInfo?.email ?? settings.contactInfo?.footerEmailText ?? "",
      contactPhone:
        settings.contactInfo?.phone ?? settings.contactInfo?.footerServiceText ?? "",
      featuredProductIds: settings.featuredProductIds ?? [],
      freeShippingMinAmount: settings.shippingRules?.freeShippingMinAmount ?? "",
      flatRate: settings.shippingRules?.flatRate ?? "",
    });
  }, [settings]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateAccountField(field, value) {
    setAccount((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFeaturedProduct(productId) {
    setForm((prev) => {
      const current = prev.featuredProductIds ?? [];
      const isSelected = current.includes(productId);

      if (isSelected) {
        return {
          ...prev,
          featuredProductIds: current.filter((id) => id !== productId),
        };
      }

      return {
        ...prev,
        featuredProductIds: [...current, productId].slice(0, 6),
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback("");
    setFormError("");

    if (!form.storeName.trim()) {
      setFormError("Informe o nome da loja.");
      return;
    }

    setSaving(true);
    try {
      await saveSettings({
        storeName: form.storeName,
        maintenanceMode: form.maintenanceMode,
        contactInfo: {
          email: form.contactEmail,
          phone: form.contactPhone,
        },
        featuredProductIds: form.featuredProductIds,
        shippingRules: {
          freeShippingMinAmount: Number(form.freeShippingMinAmount) || 0,
          flatRate: Number(form.flatRate) || 0,
        },
      });
      setFeedback("Configuracoes salvas com sucesso.");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAccountUpdate() {
    setAccountFeedback("");
    setAccountError("");

    const nextEmail = account.newEmail.trim();
    const nextPassword = account.newPassword;

    if (!nextEmail) {
      setAccountError("Informe o e-mail de acesso.");
      return;
    }

    if (nextPassword && nextPassword.length < 6) {
      setAccountError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (nextPassword !== account.confirmPassword) {
      setAccountError("A confirmação de senha não confere.");
      return;
    }

    const payload = {};
    if (nextEmail !== account.currentEmail) payload.email = nextEmail;
    if (nextPassword) payload.password = nextPassword;

    if (Object.keys(payload).length === 0) {
      setAccountError("Altere o e-mail ou informe uma nova senha.");
      return;
    }

    setSavingAccount(true);
    const { error: updateError } = await supabase.auth.updateUser(payload);
    setSavingAccount(false);

    if (updateError) {
      setAccountError(updateError.message);
      return;
    }

    setAccountFeedback(
      "Acesso admin atualizado. Entre novamente usando as novas credenciais."
    );

    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/admin/login", { replace: true });
    }, 900);
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">
              Central da loja
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-950">
              Configurações
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Controle identidade, contato, frete, manutenção e acesso administrativo.
            </p>
          </div>

          <StatusPill active={!form.maintenanceMode} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric
            icon={Store}
            label="Nome público"
            value={form.storeName || "Seu manto"}
          />
          <SummaryMetric
            icon={Truck}
            label="Frete fixo"
            value={formatBRL(Number(form.flatRate) || 0)}
          />
          <SummaryMetric
            icon={CheckCircle2}
            label="Frete grátis"
            value={`Acima de ${formatBRL(Number(form.freeShippingMinAmount) || 0)}`}
          />
          <SummaryMetric
            icon={ShieldCheck}
            label="Status"
            value={form.maintenanceMode ? "Manutenção ativa" : "Loja online"}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <SettingsSection
            icon={Store}
            title="Identidade da loja"
            description="Defina o nome exibido para clientes e controle a disponibilidade pública."
          >
            <Field icon={Store} label="Nome da loja">
              <input
                value={form.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
                className="input-field"
                placeholder="Seu manto"
              />
            </Field>

            <label className={`mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${
              form.maintenanceMode
                ? "border-amber-100 bg-amber-50"
                : "border-emerald-100 bg-emerald-50"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  form.maintenanceMode ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {form.maintenanceMode ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-neutral-950">Modo de manutenção</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Quando ativo, clientes veem uma tela de manutenção no lugar da loja.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => updateField("maintenanceMode", e.target.checked)}
                className="h-5 w-5 accent-yellow-400"
              />
            </label>
          </SettingsSection>

          <SettingsSection
            icon={Mail}
            title="Cards do footer"
            description="Edite os dois textos exibidos nos cards de contato do rodapé da loja."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={Mail} label="Card de contato">
                <input
                  value={form.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  className="input-field"
                  placeholder="contato@seumanto.com"
                />
              </Field>
              <Field icon={Phone} label="Card de atendimento">
                <input
                  value={form.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  className="input-field"
                  placeholder="Atendimento online"
                />
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Sparkles}
            title="Produtos em destaque"
            description="Escolha até 6 produtos para aparecerem no carrossel logo abaixo do hero da loja."
          >
            {productsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-500">
                Nenhum produto cadastrado ainda. Enquanto isso, a loja mostra exemplos no carrossel.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-yellow-50 px-4 py-3 text-sm">
                  <span className="font-bold text-neutral-700">
                    {form.featuredProductIds.length} de 6 selecionados
                  </span>
                  <button
                    type="button"
                    onClick={() => updateField("featuredProductIds", [])}
                    className="font-bold text-yellow-700 hover:text-yellow-800"
                  >
                    Limpar seleção
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((product) => {
                    const selected = form.featuredProductIds.includes(product._id);
                    const disabled = !selected && form.featuredProductIds.length >= 6;

                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => toggleFeaturedProduct(product._id)}
                        disabled={disabled}
                        className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          selected
                            ? "border-yellow-300 bg-yellow-50 ring-2 ring-yellow-100"
                            : "border-neutral-100 bg-white hover:border-yellow-200 hover:bg-yellow-50/50"
                        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <img
                          src={product.imageUrl || "/logo.png"}
                          alt={product.name}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-neutral-950">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block text-xs font-bold text-yellow-700">
                            {formatBRL(product.price)}
                          </span>
                        </span>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-yellow-400 bg-yellow-400 text-neutral-950"
                              : "border-neutral-200 text-transparent"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </SettingsSection>

          <SettingsSection
            icon={Truck}
            title="Regras de frete"
            description="Configure a comunicação de frete usada no checkout e no resumo da loja."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={CheckCircle2} label="Frete grátis acima de">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freeShippingMinAmount}
                  onChange={(e) => updateField("freeShippingMinAmount", e.target.value)}
                  className="input-field"
                  placeholder="199.90"
                />
              </Field>
              <Field icon={Truck} label="Frete fixo">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.flatRate}
                  onChange={(e) => updateField("flatRate", e.target.value)}
                  className="input-field"
                  placeholder="19.90"
                />
              </Field>
            </div>
          </SettingsSection>

          {formError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {formError}
            </div>
          )}
          {feedback && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              {feedback}
            </div>
          )}

          <div className="sticky bottom-4 z-10 rounded-2xl border border-neutral-100 bg-white/90 p-3 shadow-card backdrop-blur">
            <button type="submit" disabled={saving} className="btn-primary w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar configurações da loja"}
            </button>
          </div>
        </form>

        <aside className="space-y-5">
          <StorePreview form={form} />

          <section className="overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-card">
            <div className="border-b border-neutral-100 bg-neutral-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-yellow-300">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-neutral-950">Resumo rápido</h2>
                  <p className="text-xs text-neutral-400">Conferência antes de salvar</p>
                </div>
              </div>
            </div>

            <dl className="space-y-3 p-5 text-sm">
              <SummaryRow label="Loja" value={form.storeName || "-"} />
              <SummaryRow label="Card contato" value={form.contactEmail || "-"} />
              <SummaryRow label="Card atendimento" value={form.contactPhone || "-"} />
              <SummaryRow
                label="Destaques"
                value={
                  form.featuredProductIds.length
                    ? `${form.featuredProductIds.length} produto(s)`
                    : "Exemplos automáticos"
                }
              />
              <SummaryRow label="Frete fixo" value={formatBRL(Number(form.flatRate) || 0)} />
              <SummaryRow
                label="Frete grátis"
                value={formatBRL(Number(form.freeShippingMinAmount) || 0)}
              />
            </dl>
          </section>
        </aside>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-card">
        <div className="border-b border-neutral-100 bg-gradient-to-r from-neutral-950 to-neutral-800 p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black">Acesso administrativo</h2>
                <p className="mt-1 text-sm text-white/60">
                  Atualize o e-mail e a senha usados para entrar no painel.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80 ring-1 ring-white/10">
              Segurança
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field icon={Mail} label="E-mail de acesso">
              <input
                type="email"
                value={account.newEmail}
                onChange={(e) => updateAccountField("newEmail", e.target.value)}
                className="input-field"
                placeholder="admin@seumanto.com"
              />
            </Field>

            <Field icon={KeyRound} label="Nova senha">
              <input
                type="password"
                value={account.newPassword}
                onChange={(e) => updateAccountField("newPassword", e.target.value)}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </Field>

            <Field icon={ShieldCheck} label="Confirmar nova senha">
              <input
                type="password"
                value={account.confirmPassword}
                onChange={(e) => updateAccountField("confirmPassword", e.target.value)}
                className="input-field"
                placeholder="Repita a senha"
                autoComplete="new-password"
              />
            </Field>
          </div>

          {accountError && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {accountError}
            </div>
          )}
          {accountFeedback && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              {accountFeedback}
            </div>
          )}

          <button
            type="button"
            onClick={handleAccountUpdate}
            disabled={savingAccount}
            className="btn-primary mt-5 gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            {savingAccount ? "Atualizando acesso..." : "Salvar novo acesso admin"}
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-sm">
      <div className="border-b border-neutral-100 bg-neutral-50/80 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-black text-neutral-950">{title}</h2>
            <p className="mt-0.5 text-sm text-neutral-400">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-neutral-700">
        {Icon && <Icon className="h-3.5 w-3.5 text-yellow-700" />}
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-amber-50 text-amber-700 ring-amber-100"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
      {active ? "Loja online" : "Manutenção ativa"}
    </span>
  );
}

function SummaryMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm">
      <Icon className="mb-3 h-5 w-5 text-yellow-700" />
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-neutral-950">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="max-w-[190px] truncate text-right font-bold text-neutral-900">{value}</dd>
    </div>
  );
}

function StorePreview({ form }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-yellow-100 bg-white shadow-card">
      <div className="bg-gradient-to-br from-yellow-100 via-white to-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">
          Prévia pública
        </p>
        <div className="mt-4 flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-14 w-auto" />
          <div>
            <h2 className="text-xl font-black text-neutral-950">{form.storeName || "Seu manto"}</h2>
            <p className="text-xs text-neutral-400">Como a loja aparece para o cliente</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <PreviewLine icon={Mail} text={form.contactEmail || "contato@seumanto.com"} />
          <PreviewLine icon={Phone} text={form.contactPhone || "Atendimento online"} />
        </div>
        <PreviewLine
          icon={Sparkles}
          text={
            form.featuredProductIds.length
              ? `${form.featuredProductIds.length} destaque(s) no carrossel`
              : "Carrossel com exemplos automáticos"
          }
        />
        <div className="rounded-2xl bg-yellow-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-yellow-700">Frete</p>
          <p className="mt-1 font-bold text-neutral-900">
            Fixo {formatBRL(Number(form.flatRate) || 0)}
          </p>
          <p className="text-xs text-neutral-500">
            Grátis acima de {formatBRL(Number(form.freeShippingMinAmount) || 0)}
          </p>
        </div>
      </div>
    </section>
  );
}

function PreviewLine({ icon: Icon, text }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-yellow-700" />
      <span className="truncate text-neutral-600">{text}</span>
    </div>
  );
}
