import { useEffect, useState, useCallback } from "react";
import {
  collection, query, where, orderBy, onSnapshot, Timestamp,
  addDoc, updateDoc, doc, serverTimestamp, arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { atualizarAgendamento } from "../services/agendamentos";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const COLUNAS_KANBAN = ["agendado", "em_andamento", "concluido", "cancelado"];

// new Date("2026-06-06") interpreta como UTC e vira dia anterior em UTC-3.
// Usar construtor com partes numéricas força interpretação local.
function parsearData(data) {
  if (data instanceof Date) return data;
  if (data && typeof data.toDate === 'function') return data.toDate(); // Timestamp Firestore
  if (typeof data === 'string') {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia, 12, 0, 0); // meio-dia neutraliza DST
  }
  return new Date(data);
}
function inicioDoDia(data) {
  const d = parsearData(data); d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}
function fimDoDia(data) {
  const d = parsearData(data); d.setHours(23, 59, 59, 999);
  return Timestamp.fromDate(d);
}
function inicioSemana() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}

// Aceita Date ou string — usa toDateString() internamente para estabilizar a dependência
export function useAgendamentos(dataSelecionada = new Date()) {
  const { usuario, perfil } = useAuth();
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [todosSemana, setTodosSemana] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Chave estável da data para evitar re-render infinito com new Date() padrão
  const dataKey = new Date(dataSelecionada).toDateString();
  const eFuncionario = perfil?.role === "funcionario" || perfil?.role === "admin";

  useEffect(() => {
    if (!usuario) return;
    const dataRef = new Date(dataSelecionada);
    // Funcionário vê todos os agendamentos do dia; cliente vê apenas os seus
    const q = eFuncionario
      ? query(
          collection(db, "agendamentos"),
          where("data", ">=", inicioDoDia(dataRef)),
          where("data", "<=", fimDoDia(dataRef)),
          orderBy("data", "asc")
        )
      : query(
          collection(db, "agendamentos"),
          where("uid", "==", usuario.uid),
          where("data", ">=", inicioDoDia(dataRef)),
          where("data", "<=", fimDoDia(dataRef)),
          orderBy("data", "asc")
        );
    return onSnapshot(
      q,
      (snap) => { setAgendamentosHoje(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setCarregando(false); },
      (err) => { setErro(err.message); setCarregando(false); }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, eFuncionario, dataKey]);

  useEffect(() => {
    if (!usuario) return;
    // Funcionário vê todos os agendamentos da semana; cliente vê apenas os seus
    const q = eFuncionario
      ? query(
          collection(db, "agendamentos"),
          where("data", ">=", inicioSemana()),
          orderBy("data", "asc")
        )
      : query(
          collection(db, "agendamentos"),
          where("uid", "==", usuario.uid),
          where("data", ">=", inicioSemana()),
          orderBy("data", "asc")
        );
    return onSnapshot(q, (snap) => {
      setTodosSemana(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [usuario, eFuncionario]);

  // Mutations
  const criarAgendamento = useCallback(async (dados) => {
    const dataTimestamp = dados.data instanceof Timestamp
      ? dados.data
      : Timestamp.fromDate(parsearData(dados.data));
    await addDoc(collection(db, "agendamentos"), {
      ...dados,
      data: dataTimestamp,
      uid: usuario.uid,
      userId: usuario.uid,
      status: "agendado",
      criadoEm: serverTimestamp(),
    });
  }, [usuario]);

  const moverStatus = useCallback(async (id, novoStatus) => {
    await updateDoc(doc(db, "agendamentos", id), {
      status: novoStatus,
      historico: arrayUnion({ status: novoStatus, timestamp: Timestamp.now() }),
    });
  }, []);

  const editarAgendamento = useCallback(async (id, dados) => {
    await atualizarAgendamento(id, dados);
  }, []);

  // KPIs do dia — apenas status relevantes
  const receitaDia = agendamentosHoje
    .filter((a) => a.status === "concluido")
    .reduce((s, a) => s + (a.valor || 0), 0);
  const emAndamento = agendamentosHoje.filter((a) => a.status === "em_andamento").length;
  const concluidos  = agendamentosHoje.filter((a) => a.status === "concluido").length;
  // Ativos = agendados + em andamento (exclui cancelados e concluídos)
  const agendamentosAtivos = agendamentosHoje.filter((a) =>
    ["agendado", "em_andamento", "pendente"].includes(a.status)
  );
  const proximosAgendamentos = agendamentosHoje
    .filter((a) => ["pendente", "agendado"].includes(a.status))
    .slice(0, 5);

  // Kanban: agrupa por status (compatível com dados mobile que usam "pendente")
  const agendamentosPorStatus = Object.fromEntries(
    COLUNAS_KANBAN.map((s) => [s, agendamentosHoje.filter((a) => a.status === s)])
  );
  agendamentosPorStatus.agendado = [
    ...agendamentosPorStatus.agendado,
    ...agendamentosHoje.filter((a) => a.status === "pendente"),
  ];

  // Gráficos
  const agendamentosSemana = DIAS_SEMANA.map((nome, idx) => ({
    dia: nome,
    total: todosSemana.filter((a) => a.data?.toDate?.()?.getDay() === idx).length,
  }));
  const contagemServicos = {};
  todosSemana.forEach((a) => { if (a.servico) contagemServicos[a.servico] = (contagemServicos[a.servico] || 0) + 1; });
  const servicosPopulares = Object.entries(contagemServicos)
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  return {
    carregando, erro,
    agendamentosHoje, agendamentosAtivos, agendamentosPorStatus,
    receitaDia, emAndamento, concluidos, proximosAgendamentos,
    agendamentosSemana, servicosPopulares,
    criarAgendamento, moverStatus, editarAgendamento,
  };
}
