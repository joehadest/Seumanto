import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { supabase } from "../../lib/supabase.js";

export default function RedefinirSenhaCliente() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasRecoverySession(Boolean(data.session?.user));
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setHasRecoverySession(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Senha redefinida com sucesso. Você já pode entrar com a nova senha.");
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => navigate("/login", { replace: true }), 1200);
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-card">
        <div className="skeleton mx-auto mb-4 h-12 w-12 rounded-full" />
        <p className="text-sm font-medium text-neutral-500">Validando link de recuperação...</p>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="mx-auto max-w-md animate-fade-in">
        <div className="card p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 text-yellow-700">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-neutral-950">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Solicite um novo link para redefinir sua senha com segurança.
          </p>
          <Link to="/recuperar-senha" className="btn-primary mt-6">
            Enviar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="mb-6 text-center">
        <img src="/logo.png" alt="Seu manto" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">
          Criar nova senha
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Escolha uma senha forte para acessar sua conta Seu Manto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Nova senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="input-field"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Confirmar nova senha
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="input-field"
            placeholder="Repita a senha"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
