import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function GraficoLinha({ dados }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Receita por dia no período</h3>
      {dados.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-slate-500 text-sm">
          Nenhuma receita no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dados} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="data" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v) => [BRL.format(v), "Receita"]}
            />
            <Line
              type="monotone"
              dataKey="receita"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
