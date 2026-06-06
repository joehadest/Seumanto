import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { isAdminSession } from "../../utils/auth.js";

function friendlyAuthError(message) {
  const text = String(message ?? "").toLowerCase();
  if (text.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (text.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de acessar.";
  }
  return "Nao foi possivel entrar. Verifique seus dados e tente novamente.";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin/produtos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthorized(isAdminSession(data.session));
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return;
    }

    if (!isAdminSession(data.session)) {
      await supabase.auth.signOut();
      setError("Seu usuario nao possui permissao de administrador.");
      return;
    }

    navigate(from, { replace: true });
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="skeleton mx-auto mb-4 h-12 w-12 rounded-full" />
          <p className="text-sm font-medium text-neutral-500">Verificando sessao...</p>
        </div>
      </div>
    );
  }

  if (authorized) return <Navigate to={from} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <img src="/logo.png" alt="Seu manto" className="h-24 w-auto" />
            <span className="text-sm font-medium text-neutral-500">Painel administrativo</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <h1 className="text-xl font-bold text-neutral-900">Entrar no Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Acesso restrito a usuarios com role de administrador.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="input-field"
                placeholder="admin@maykeloja.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
