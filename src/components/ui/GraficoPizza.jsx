import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const CORES = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e"];

export default function GraficoPizza({ dados }) {
  if (!dados.length) {
    return (
      <div className="card flex items-center justify-center h-48 text-slate-500 text-sm">
        Sem dados de serviços esta semana
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Serviços populares — semana</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={35}
            paddingAngle={3}
          >
            {dados.map((_, idx) => (
              <Cell key={idx} fill={CORES[idx % CORES.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend
            formatter={(val) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
