import { useState, useMemo } from "react";
import { MdAdd, MdChevronLeft, MdChevronRight, MdToday, MdSearch, MdClose } from "react-icons/md";
import { useAgendamentos } from "../hooks/useAgendamentos";
import { useToast } from "../components/ui/Toast";
import { useNotificacoes } from "../hooks/useNotificacoes";
import { formatarVeiculo } from "../utils/veiculo";
import KanbanColuna from "../components/ui/KanbanColuna";
import KanbanCard from "../components/ui/KanbanCard";
import ModalAgendamento from "../components/ui/ModalAgendamento";
import ModalEditarAgendamento from "../components/agenda/ModalEditarAgendamento";

const COLUNAS = ["agendado", "em_andamento", "concluido", "cancelado"];

function formatarData(data) {
  return data.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function isHoje(data) {
  return data.toDateString() === new Date().toDateString();
}

function cardMatchBusca(ag, termo) {
  if (!termo) return true;
  const t = termo.toLowerCase();
  return (
    ag.clienteNome?.toLowerCase().includes(t) ||
    ag.servico?.toLowerCase().includes(t) ||
    formatarVeiculo(ag.veiculo)?.toLowerCase().includes(t)
  );
}

export default function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [busca, setBusca] = useState("");

  const { agendamentosHoje, agendamentosPorStatus, carregando, criarAgendamento, moverStatus, editarAgendamento } = useAgendamentos(dataSelecionada);
  useNotificacoes(agendamentosHoje);
  const { adicionarToast } = useToast();

  const agendamentosFiltrados = useMemo(() => {
    if (!busca.trim()) return agendamentosPorStatus;
    return Object.fromEntries(
      COLUNAS.map((s) => [s, (agendamentosPorStatus[s] || []).filter((ag) => cardMatchBusca(ag, busca))])
    );
  }, [agendamentosPorStatus, busca]);

  function navegarDia(delta) {
    setDataSelecionada((prev) => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + delta);
      return nova;
    });
  }

  async function handleCriar(dados) {
    try {
      await criarAgendamento(dados);
      adicionarToast("Agendamento criado com sucesso!");
    } catch {
      adicionarToast("Erro ao criar agendamento.", "erro");
      throw new Error();
    }
  }

  async function handleEditar(id, dados) {
    try {
      await editarAgendamento(id, dados);
      adicionarToast("Agendamento atualizado!");
      setAgendamentoEditando(null);
    } catch {
      adicionarToast("Erro ao atualizar agendamento.", "erro");
      throw new Error();
    }
  }

  async function handleMover(id, novoStatus) {
    try {
      await moverStatus(id, novoStatus);
      const msg = novoStatus === "concluido" ? "Serviço concluído!" : "Status atualizado!";
      adicionarToast(msg);
    } catch {
      adicionarToast("Erro ao atualizar status.", "erro");
    }
  }

  const totalResultados = busca.trim()
    ? COLUNAS.reduce((acc, s) => acc + (agendamentosFiltrados[s]?.length || 0), 0)
    : null;

  return (
    <div className="space-y-5">
      {/* Barra de controle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navegarDia(-1)} className="btn-secondary p-2" title="Dia anterior">
            <MdChevronLeft className="text-xl" />
          </button>
          <span className="text-white font-medium text-sm sm:text-base capitalize min-w-72 text-center px-2">
            {formatarData(dataSelecionada)}
          </span>
          <button onClick={() => navegarDia(1)} className="btn-secondary p-2" title="Próximo dia">
            <MdChevronRight className="text-xl" />
          </button>
          {!isHoje(dataSelecionada) && (
            <button onClick={() => setDataSelecionada(new Date())} className="btn-secondary flex items-center gap-1 text-sm px-3 py-2">
              <MdToday className="text-base" /> Hoje
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xs">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, serviço ou placa…"
              className="input-field pl-9 pr-8 py-2 text-sm w-full"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <MdClose className="text-base" />
              </button>
            )}
          </div>
          {totalResultados !== null && (
            <span className="text-xs text-slate-400 shrink-0">{totalResultados} resultado{totalResultados !== 1 ? "s" : ""}</span>
          )}
        </div>

        <button onClick={() => setModalAberto(true)} className="btn-primary flex items-center gap-2">
          <MdAdd className="text-xl" /> Novo agendamento
        </button>
      </div>

      {/* Kanban */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 transition-opacity ${carregando ? "opacity-40 pointer-events-none" : ""}`}>
        {COLUNAS.map((status) => (
          <KanbanColuna
            key={status}
            status={status}
            cards={agendamentosFiltrados[status] || []}
            renderCard={(a) => (
              <KanbanCard key={a.id} agendamento={a} onMover={handleMover} onEditar={setAgendamentoEditando} />
            )}
          />
        ))}
      </div>

      <ModalAgendamento
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleCriar}
        dataSelecionada={dataSelecionada}
      />

      <ModalEditarAgendamento
        isOpen={!!agendamentoEditando}
        onClose={() => setAgendamentoEditando(null)}
        onSalvar={handleEditar}
        agendamento={agendamentoEditando}
      />
    </div>
  );
}
