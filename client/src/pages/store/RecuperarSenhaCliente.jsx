import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { supabase } from "../../lib/supabase.js";

export default function RecuperarSenhaCliente() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Informe o e-mail cadastrado.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      }
    );
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Enviamos um link para redefinir sua senha. Verifique seu e-mail.");
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="mb-6 text-center">
        <img src="/logo.png" alt="Seu manto" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">
          Recuperar senha
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Digite seu e-mail e enviaremos um link seguro para criar uma nova senha.
        </p>
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

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Lembrou a senha?{" "}
          <Link to="/login" className="font-semibold text-yellow-700 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
