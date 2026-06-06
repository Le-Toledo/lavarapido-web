import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

function calcularPeriodo(tipo, customInicio, customFim) {
  const agora = new Date();
  agora.setHours(23, 59, 59, 999);

  if (tipo === "hoje") {
    const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora };
  }
  if (tipo === "semana") {
    const inicio = new Date();
    inicio.setDate(agora.getDate() - agora.getDay());
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora };
  }
  if (tipo === "mes") {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    return { inicio, fim: agora };
  }
  if (tipo === "personalizado" && customInicio && customFim) {
    const fim = new Date(customFim); fim.setHours(23, 59, 59, 999);
    return { inicio: new Date(customInicio), fim };
  }
  return { inicio: new Date(), fim: agora };
}

export function useRelatorios(periodo = "mes", customInicio = null, customFim = null) {
  const { usuario } = useAuth();
  const [todos, setTodos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca todos os agendamentos do usuário — sem filtro de data no Firestore
  // para evitar exigência de índice composto. Filtragem feita em JS abaixo.
  useEffect(() => {
    if (!usuario) return;
    const q = query(
      collection(db, "agendamentos"),
      where("uid", "==", usuario.uid)
    );
    return onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("[useRelatorios] agendamentos:", docs);
        setTodos(docs);
        setCarregando(false);
      },
      (err) => {
        console.error("[useRelatorios] erro Firestore:", err);
        setCarregando(false);
      }
    );
  }, [usuario]);

  const { inicio, fim } = calcularPeriodo(periodo, customInicio, customFim);
  const agendamentos = todos
    .filter((a) => {
      const d = a.data?.toDate?.();
      if (!d) return false;
      return d >= inicio && d <= fim;
    })
    .sort((a, b) => {
      const da = a.data?.toDate?.() ?? 0;
      const db_ = b.data?.toDate?.() ?? 0;
      return db_ - da;
    });

  const concluidos = agendamentos.filter((a) => a.status === "concluido");
  const totalReceita = concluidos.reduce((acc, a) => acc + (a.valor || 0), 0);
  const totalAtendimentos = concluidos.length;
  const ticketMedio = totalAtendimentos > 0 ? totalReceita / totalAtendimentos : 0;

  const porDia = {};
  concluidos.forEach((a) => {
    const d = a.data?.toDate?.();
    if (!d) return;
    const chave = d.toISOString().slice(0, 10);
    porDia[chave] = {
      data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      receita: (porDia[chave]?.receita || 0) + (a.valor || 0),
    };
  });
  const receitaPorDia = Object.keys(porDia).sort().map((k) => porDia[k]);

  return { carregando, agendamentos, totalReceita, totalAtendimentos, ticketMedio, receitaPorDia };
}
