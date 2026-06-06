import { MdDirectionsCar, MdAttachMoney, MdArrowForward, MdBlock, MdEdit } from "react-icons/md";
import { formatarVeiculo } from "../../utils/veiculo";

function extrairNomeServico(servico) {
  if (!servico) return "Serviço não informado";
  if (typeof servico === "string") return servico;
  if (typeof servico === "object") return servico.nome || "Serviço não informado";
  return "Serviço não informado";
}

const TRANSICOES = {
  agendado:     { proximo: "em_andamento", labelProximo: "Iniciar atendimento" },
  em_andamento: { proximo: "concluido",    labelProximo: "Concluir"            },
  concluido:    { proximo: null,           labelProximo: null                  },
  cancelado:    { proximo: null,           labelProximo: null                  },
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatarHora(ts) {
  if (!ts?.toDate) return "--:--";
  return ts.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function KanbanCard({ agendamento, onMover, onEditar }) {
  const { id, clienteNome, servico, veiculo, data, valor, status } = agendamento;
  const veiculoTexto = formatarVeiculo(veiculo);
  const { proximo, labelProximo } = TRANSICOES[status] || TRANSICOES.agendado;
  const podeCancelar = status !== "concluido" && status !== "cancelado";

  return (
    <div className="bg-dark-900 border border-slate-600/40 rounded-xl p-4 space-y-3 hover:border-slate-500/60 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-white text-sm leading-tight">{clienteNome || "—"}</p>
        <span className="text-xs text-cyan-400 font-mono shrink-0">{formatarHora(data)}</span>
      </div>

      <span className="inline-block text-xs text-slate-300 bg-dark-700 border border-slate-600/50 rounded-lg px-2 py-1">
        {extrairNomeServico(servico)}
      </span>

      <div className="space-y-1">
        {veiculoTexto && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MdDirectionsCar className="shrink-0" />
            <span className="truncate">{veiculoTexto}</span>
          </div>
        )}
        {valor != null && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MdAttachMoney className="shrink-0" />
            <span>{BRL.format(valor)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        {proximo && (
          <button
            onClick={() => onMover(id, proximo)}
            className="flex items-center justify-center gap-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 px-2 py-1.5 rounded-lg transition-colors flex-1"
          >
            {labelProximo} <MdArrowForward />
          </button>
        )}
        <button
          onClick={() => onEditar?.(agendamento)}
          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 border border-slate-600/30 hover:border-cyan-500/20 rounded-lg transition-colors"
          title="Editar"
        >
          <MdEdit className="text-base" />
        </button>
        {podeCancelar && (
          <button
            onClick={() => onMover(id, "cancelado")}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-600/30 hover:border-red-500/20 rounded-lg transition-colors"
            title="Cancelar"
          >
            <MdBlock className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
}
