import {
  MdCalendarToday,
  MdAttachMoney,
  MdDirectionsCar,
  MdCheckCircle,
} from "react-icons/md";
import { useAgendamentos } from "../hooks/useAgendamentos";
import KpiCard from "../components/ui/KpiCard";
import GraficoSemana from "../components/ui/GraficoSemana";
import GraficoPizza from "../components/ui/GraficoPizza";
import ProximosAgendamentos from "../components/ui/ProximosAgendamentos";

function formatarReais(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function SkeletonKpi() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-700/50 rounded w-2/3" />
          <div className="h-7 bg-slate-700/50 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    carregando,
    agendamentosAtivos,
    receitaDia,
    emAndamento,
    concluidos,
    proximosAgendamentos,
    agendamentosSemana,
    servicosPopulares,
  } = useAgendamentos();

  const kpis = [
    {
      icone: MdCalendarToday,
      label: "Agendamentos hoje",
      valor: carregando ? "—" : agendamentosAtivos.length,
      cor: "cyan",
    },
    {
      icone: MdAttachMoney,
      label: "Receita do dia",
      valor: carregando ? "—" : formatarReais(receitaDia),
      cor: "green",
    },
    {
      icone: MdDirectionsCar,
      label: "Em atendimento",
      valor: carregando ? "—" : emAndamento,
      cor: "yellow",
    },
    {
      icone: MdCheckCircle,
      label: "Concluídos",
      valor: carregando ? "—" : concluidos,
      cor: "purple",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {carregando
          ? [...Array(4)].map((_, i) => <SkeletonKpi key={i} />)
          : kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)
        }
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GraficoSemana dados={agendamentosSemana} />
        <GraficoPizza dados={servicosPopulares} />
      </div>

      {/* Próximos agendamentos */}
      <ProximosAgendamentos
        agendamentos={proximosAgendamentos}
        carregando={carregando}
      />
    </div>
  );
}
