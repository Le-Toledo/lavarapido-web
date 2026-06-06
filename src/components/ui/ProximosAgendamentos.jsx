function extrairNomeServico(servico) {
  if (!servico) return "Serviço não informado";
  if (typeof servico === "string") return servico;
  if (typeof servico === "object") return servico.nome || "Serviço não informado";
  return "Serviço não informado";
}

const STATUS_CONFIG = {
  pendente:     { label: "Pendente",     cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  em_andamento: { label: "Em andamento", cls: "bg-cyan-500/15   text-cyan-400   border-cyan-500/30"   },
  concluido:    { label: "Concluído",    cls: "bg-green-500/15  text-green-400  border-green-500/30"  },
  cancelado:    { label: "Cancelado",    cls: "bg-red-500/15    text-red-400    border-red-500/30"    },
};

function formatarHora(timestamp) {
  if (!timestamp?.toDate) return "--:--";
  return timestamp.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function BadgeStatus({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function ProximosAgendamentos({ agendamentos, carregando }) {
  if (carregando) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Próximos agendamentos do dia
      </h3>

      {agendamentos.length === 0 ? (
        <p className="text-slate-500 text-sm py-4 text-center">
          Nenhum agendamento pendente para hoje
        </p>
      ) : (
        <ul className="divide-y divide-slate-700/60">
          {agendamentos.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-dark-700 rounded-lg shrink-0">
                  <span className="text-cyan-400 text-xs font-bold">{formatarHora(a.data)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {a.clienteNome || "Cliente"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{extrairNomeServico(a.servico)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {a.valor != null && (
                  <span className="text-sm font-semibold text-white">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.valor)}
                  </span>
                )}
                <BadgeStatus status={a.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
