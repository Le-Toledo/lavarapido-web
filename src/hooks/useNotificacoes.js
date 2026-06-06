import { useEffect, useRef } from "react";

const ANTECEDENCIA_MIN = 30;
const INTERVALO_VERIFICACAO_MS = 60_000; // 1 min

async function pedirPermissao() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function notificar(agendamento) {
  const hora = agendamento.data?.toDate?.()?.toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  }) ?? "";
  new Notification("Próximo agendamento em 30 min", {
    body: `${agendamento.clienteNome || "Cliente"} — ${agendamento.servico || ""} às ${hora}`,
    icon: "/favicon.svg",
    tag: agendamento.id,
  });
}

// agendamentos: lista do dia (do useAgendamentos)
export function useNotificacoes(agendamentos) {
  const notificadosRef = useRef(new Set());

  useEffect(() => {
    pedirPermissao();
  }, []);

  useEffect(() => {
    function verificar() {
      if (Notification.permission !== "granted") return;
      const agora = new Date();
      agendamentos.forEach((ag) => {
        if (notificadosRef.current.has(ag.id)) return;
        if (!["agendado", "em_andamento", "pendente"].includes(ag.status)) return;
        const dataAg = ag.data?.toDate?.();
        if (!dataAg) return;
        const diffMin = (dataAg - agora) / 60_000;
        if (diffMin > 0 && diffMin <= ANTECEDENCIA_MIN) {
          notificar(ag);
          notificadosRef.current.add(ag.id);
        }
      });
    }

    verificar();
    const id = setInterval(verificar, INTERVALO_VERIFICACAO_MS);
    return () => clearInterval(id);
  }, [agendamentos]);
}
