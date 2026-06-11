import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

const links = [
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/categorias", label: "Categorias" },
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
        : "text-white/55 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="admin-dark relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_-10%,rgba(250,204,21,0.15),transparent_42%),linear-gradient(to_bottom,rgba(250,204,21,0.06),rgba(23,23,23,0)_62%)]" />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-neutral-950/90 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex lg:flex-col 2xl:w-72">
        <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
          <img src="/logo-dark.svg" alt="Seu manto" className="h-20 w-auto" />
          <div>
            <p className="font-bold leading-tight text-white">Seu manto</p>
            <p className="text-xs text-white/45">Painel administrativo</p>
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

      <div className="relative z-10 lg:pl-64 2xl:pl-72">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl lg:hidden">
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

        <main className="mx-auto max-w-6xl px-4 py-6 2xl:max-w-screen-2xl 2xl:px-8 min-[1800px]:max-w-[1760px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
