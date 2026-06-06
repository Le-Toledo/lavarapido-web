import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdCalendarMonth,
  MdBuildCircle,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdWaterDrop,
} from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";

const LINKS = [
  { to: "/dashboard",      label: "Dashboard",     icone: MdDashboard    },
  { to: "/agenda",         label: "Agenda",         icone: MdCalendarMonth },
  { to: "/servicos",       label: "Serviços",       icone: MdBuildCircle  },
  { to: "/relatorios",     label: "Relatórios",     icone: MdBarChart     },
  { to: "/configuracoes",  label: "Configurações",  icone: MdSettings     },
];

export default function Sidebar() {
  const { sair } = useAuth();
  const navegar = useNavigate();

  async function handleLogout() {
    await sair();
    navegar("/login");
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-dark-800 border-r border-slate-700/60 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center justify-center w-9 h-9 bg-cyan-500 rounded-lg shrink-0">
          <MdWaterDrop className="text-white text-xl" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">LavaRápido</p>
          <p className="text-slate-400 text-xs">Painel Admin</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {LINKS.map(({ to, label, icone: Icone }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-cyan-500 text-dark-900"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <Icone className="text-xl shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150"
        >
          <MdLogout className="text-xl shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
