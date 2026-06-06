import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

export default function CadastroCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/minha-conta";

  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError("Informe nome, e-mail e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate(from, { replace: true });
      return;
    }

    setMessage("Cadastro criado. Confira seu e-mail para confirmar a conta antes de entrar.");
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="mb-6 text-center">
        <img src="/logo.png" alt="Seu manto" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">Criar cadastro</h1>
        <p className="mt-1 text-sm text-neutral-500">Tenha seus pedidos e dados de entrega sempre à mão.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Nome completo</span>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Telefone</span>
          <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">E-mail</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Senha</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="input-field"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl border border-yellow-100 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800">{message}</div>}

        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Criando..." : "Criar cadastro"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Já tem conta?{" "}
          <Link to="/login" state={{ from }} className="font-semibold text-yellow-700 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
