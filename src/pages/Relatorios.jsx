import { useState } from "react";
import { MdDownload, MdTrendingUp, MdReceiptLong, MdShowChart, MdWarning } from "react-icons/md";
import { useRelatorios } from "../hooks/useRelatorios";
import { formatarVeiculo } from "../utils/veiculo";
import GraficoLinha from "../components/ui/GraficoLinha";

function extrairNomeServico(servico) {
  if (!servico) return "Serviço não informado";
  if (typeof servico === "string") return servico;
  if (typeof servico === "object") return servico.nome || "Serviço não informado";
  return "Serviço não informado";
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PERIODOS = [
  { id: "hoje",          label: "Hoje"          },
  { id: "semana",        label: "Esta semana"   },
  { id: "mes",           label: "Este mês"      },
  { id: "personalizado", label: "Personalizado" },
];
const BADGE = {
  concluido:    "bg-green-500/15  text-green-400",
  em_andamento: "bg-yellow-500/15 text-yellow-400",
  agendado:     "bg-cyan-500/15   text-cyan-400",
  pendente:     "bg-cyan-500/15   text-cyan-400",
  cancelado:    "bg-red-500/15    text-red-400",
};

function exportarCSV(dados) {
  const linhas = dados.map((a) => {
    const data = a.data?.toDate?.()?.toLocaleDateString("pt-BR") ?? "";
    const veiculo = formatarVeiculo(a.veiculo) ?? "";
    return `${data},"${a.clienteNome || ""}","${extrairNomeServico(a.servico)}","${veiculo}",${a.valor || 0},${a.status || ""}`;
  });
  const csv = ["Data,Cliente,Serviço,Veículo,Valor,Status", ...linhas].join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
  Object.assign(document.createElement("a"), {
    href: url, download: `relatorio-${new Date().toISOString().slice(0, 10)}.csv`,
  }).click();
  URL.revokeObjectURL(url);
}

function TabelaAgendamentos({ agendamentos, semMensagem = "Nenhum registro no período" }) {
  if (agendamentos.length === 0) {
    return <p className="text-center text-slate-500 text-sm py-14">{semMensagem}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-dark-700/50">
            {["Data", "Cliente", "Serviço", "Veículo", "Valor", "Status"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {agendamentos.map((a) => (
            <tr key={a.id} className="hover:bg-slate-700/20 transition-colors">
              <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{a.data?.toDate?.()?.toLocaleDateString("pt-BR") ?? "—"}</td>
              <td className="px-5 py-3 font-medium text-white">{a.clienteNome || "—"}</td>
              <td className="px-5 py-3 text-slate-300">{extrairNomeServico(a.servico)}</td>
              <td className="px-5 py-3 text-slate-400">{formatarVeiculo(a.veiculo) || "—"}</td>
              <td className="px-5 py-3 text-cyan-400 font-semibold whitespace-nowrap">{BRL.format(a.valor || 0)}</td>
              <td className="px-5 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${BADGE[a.status] || "bg-slate-500/15 text-slate-400"}`}>
                  {a.status || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("mes");
  const [customInicio, setCustomInicio] = useState("");
  const [customFim, setCustomFim] = useState("");
  const [aba, setAba] = useState("historico");

  const { totalReceita, totalAtendimentos, ticketMedio, receitaPorDia, agendamentos, carregando } =
    useRelatorios(periodo, customInicio || null, customFim || null);

  // Inadimplentes: sem valor registrado e não cancelados
  const inadimplentes = agendamentos.filter(
    (a) => (!a.valor || a.valor === 0) && a.status !== "cancelado"
  );

  const resumos = [
    { label: "Receita total",  valor: BRL.format(totalReceita),  cor: "text-green-400",  icone: MdTrendingUp  },
    { label: "Atendimentos",   valor: totalAtendimentos,          cor: "text-cyan-400",   icone: MdReceiptLong },
    { label: "Ticket médio",   valor: BRL.format(ticketMedio),   cor: "text-purple-400", icone: MdShowChart   },
    { label: "Sem valor",      valor: inadimplentes.length,       cor: "text-yellow-400", icone: MdWarning     },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Filtros de período */}
      <div className="flex flex-wrap items-center gap-2">
        {PERIODOS.map((p) => (
          <button key={p.id} onClick={() => setPeriodo(p.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodo === p.id ? "bg-cyan-500 text-dark-900" : "btn-secondary"}`}>
            {p.label}
          </button>
        ))}
        {periodo === "personalizado" && (
          <div className="flex items-center gap-2">
            <input type="date" value={customInicio} onChange={(e) => setCustomInicio(e.target.value)} className="input-field py-2 text-sm" />
            <span className="text-slate-400 text-sm">até</span>
            <input type="date" value={customFim} onChange={(e) => setCustomFim(e.target.value)} className="input-field py-2 text-sm" />
          </div>
        )}
        <button onClick={() => exportarCSV(aba === "historico" ? agendamentos : inadimplentes)}
          className="ml-auto btn-secondary flex items-center gap-2 text-sm">
          <MdDownload /> Exportar CSV
        </button>
      </div>

      {/* KPIs — agora com 4 cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {resumos.map(({ label, valor, cor, icone: Icone }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-700/50 flex items-center justify-center shrink-0">
              <Icone className={`text-xl ${cor}`} />
            </div>
            <div>
              <p className="text-slate-400 text-xs">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${cor}`}>{valor}</p>
            </div>
          </div>
        ))}
      </div>

      <GraficoLinha dados={receitaPorDia} />

      {/* Tabela com abas */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between gap-4">
          {/* Abas */}
          <div className="flex gap-1">
            <button
              onClick={() => setAba("historico")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${aba === "historico" ? "bg-cyan-500/15 text-cyan-400" : "text-slate-400 hover:text-white"}`}
            >
              Histórico
            </button>
            <button
              onClick={() => setAba("inadimplentes")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${aba === "inadimplentes" ? "bg-yellow-500/15 text-yellow-400" : "text-slate-400 hover:text-white"}`}
            >
              Sem valor
              {inadimplentes.length > 0 && (
                <span className="bg-yellow-500 text-dark-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {inadimplentes.length}
                </span>
              )}
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {aba === "historico" ? agendamentos.length : inadimplentes.length} registros
          </span>
        </div>

        {carregando ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : aba === "historico" ? (
          <TabelaAgendamentos agendamentos={agendamentos} semMensagem="Nenhum registro no período selecionado" />
        ) : (
          <TabelaAgendamentos
            agendamentos={inadimplentes}
            semMensagem="Nenhum agendamento sem valor no período"
          />
        )}
      </div>
    </div>
  );
}
