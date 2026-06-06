const CONFIG = {
  agendado:     { titulo: "Agendado",     cor: "text-blue-400",   borda: "border-blue-500/25",   bg: "bg-blue-500/5"   },
  em_andamento: { titulo: "Em andamento", cor: "text-yellow-400", borda: "border-yellow-500/25", bg: "bg-yellow-500/5" },
  concluido:    { titulo: "Concluído",    cor: "text-green-400",  borda: "border-green-500/25",  bg: "bg-green-500/5"  },
  cancelado:    { titulo: "Cancelado",    cor: "text-red-400",    borda: "border-red-500/25",    bg: "bg-red-500/5"    },
};

export default function KanbanColuna({ status, cards, renderCard }) {
  const c = CONFIG[status];

  return (
    <div className={`flex flex-col rounded-xl border ${c.borda} ${c.bg} min-h-[480px]`}>
      {/* Cabeçalho */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${c.borda}`}>
        <h3 className={`text-sm font-semibold ${c.cor}`}>{c.titulo}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${c.borda} ${c.cor} font-mono`}>
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-slate-600 text-xs">Vazio</p>
          </div>
        ) : (
          cards.map((card) => renderCard(card))
        )}
      </div>
    </div>
  );
}
