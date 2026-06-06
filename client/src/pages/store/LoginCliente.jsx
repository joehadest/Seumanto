import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

function friendlyAuthError(message) {
  const text = String(message ?? "").toLowerCase();
  if (text.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (text.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  return "Não foi possível entrar. Verifique seus dados e tente novamente.";
}

export default function LoginCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/minha-conta";

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthorized(Boolean(data.session?.user));
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return;
    }

    navigate(from, { replace: true });
  }

  if (checking) return null;
  if (authorized) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="mb-6 text-center">
        <img src="/logo.png" alt="Seu manto" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">Entrar na conta</h1>
        <p className="mt-1 text-sm text-neutral-500">Acompanhe pedidos e finalize compras mais rápido.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="input-field"
            placeholder="voce@email.com"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="input-field"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" state={{ from }} className="font-semibold text-yellow-700 hover:underline">
            Criar cadastro
          </Link>
        </p>
      </form>
    </div>
  );
}
