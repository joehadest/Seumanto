import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

const links = [
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/avaliacoes", label: "Avaliações" },
  { to: "/admin/configuracoes", label: "Configuracoes" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  const navClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-yellow-400 text-neutral-900"
        : "text-neutral-500 hover:bg-yellow-50 hover:text-neutral-900"
    }`;

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-neutral-100 bg-white p-4 lg:flex lg:flex-col">
        <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl bg-yellow-50/70 p-3">
          <img src="/logo.png" alt="Seu manto" className="h-20 w-auto" />
          <div>
            <p className="font-bold leading-tight text-neutral-900">Seu manto</p>
            <p className="text-xs text-neutral-400">Admin</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="btn-ghost w-full">
          Sair
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-xl lg:hidden">
          <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-3">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="ml-auto text-sm font-semibold text-neutral-400">
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
