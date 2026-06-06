import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

export default function CustomerRoute({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session?.user));
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-card">
        <div className="skeleton mx-auto mb-4 h-12 w-12 rounded-full" />
        <p className="text-sm font-medium text-neutral-500">Verificando sua sessão...</p>
      </div>
    );
  }

  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
