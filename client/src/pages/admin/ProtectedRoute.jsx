import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { isAdminSession } from "../../utils/auth.js";

/**
 * Guard para rotas /admin/*.
 *
 * Bloqueia renderizacao de qualquer componente interno ate confirmar:
 *  - usuario autenticado no Supabase Auth
 *  - JWT com role admin (role=admin ou app_metadata.role=admin)
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setChecking(false);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const isAuthorized = isAdminSession(session);

  if (checking) {
    return (
      <div className="mx-auto max-w-md animate-fade-in">
        <div className="card p-8 text-center">
          <div className="skeleton mx-auto mb-4 h-12 w-12 rounded-full" />
          <p className="text-sm font-medium text-neutral-500">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
