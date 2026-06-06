import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEstabelecimento } from "../../contexts/EstabelecimentoContext";

const TITULOS = {
  "/dashboard": "Dashboard",
  "/agenda": "Agenda",
  "/servicos": "Serviços",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
};

function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  return nome.slice(0, 2).toUpperCase() || "?";
}

export default function Header() {
  const { usuario } = useAuth();
  const { estabelecimento } = useEstabelecimento();
  const { pathname } = useLocation();
  const titulo = TITULOS[pathname] ?? "LavaRápido";

  // Prioridade: nome do usuário → nome do estabelecimento → prefixo do e-mail
  const nomeExibido =
    usuario?.displayName?.trim() ||
    estabelecimento?.nome?.trim() ||
    usuario?.email?.split("@")[0] ||
    "Usuário";

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-dark-800 border-b border-slate-700/60 shrink-0">
      <h1 className="text-lg font-semibold text-white">{titulo}</h1>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white leading-tight">{nomeExibido}</p>
          <p className="text-xs text-slate-400">{usuario?.email}</p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500 text-dark-900 font-bold text-sm shrink-0">
          {iniciais(nomeExibido)}
        </div>
      </div>
    </header>
  );
}
