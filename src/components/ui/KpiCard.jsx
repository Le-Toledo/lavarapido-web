export default function KpiCard({ icone: Icone, label, valor, variacao, cor = "cyan" }) {
  const corMap = {
    cyan:   { bg: "bg-cyan-500/10",   icone: "text-cyan-400",   borda: "border-cyan-500/20"  },
    green:  { bg: "bg-green-500/10",  icone: "text-green-400",  borda: "border-green-500/20" },
    yellow: { bg: "bg-yellow-500/10", icone: "text-yellow-400", borda: "border-yellow-500/20"},
    purple: { bg: "bg-purple-500/10", icone: "text-purple-400", borda: "border-purple-500/20"},
  };
  const c = corMap[cor];

  const positivo = variacao >= 0;

  return (
    <div className={`card border ${c.borda} flex items-start gap-4`}>
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.bg} shrink-0`}>
        <Icone className={`text-2xl ${c.icone}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{valor}</p>

        {variacao !== undefined && (
          <p className={`text-xs mt-1 font-medium ${positivo ? "text-green-400" : "text-red-400"}`}>
            {positivo ? "+" : ""}{variacao}% hoje
          </p>
        )}
      </div>
    </div>
  );
}
