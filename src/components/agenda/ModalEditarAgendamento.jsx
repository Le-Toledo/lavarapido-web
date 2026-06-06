import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import Modal from "../ui/Modal";
import { useServicos } from "../../hooks/useServicos";

const STATUS_OPCOES = [
  { value: "agendado",     label: "Agendado"     },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido",    label: "Concluído"    },
  { value: "cancelado",    label: "Cancelado"    },
];

function toDateInput(ts) {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeInput(ts, horario) {
  if (horario) return horario;
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

import { extrairVeiculo } from "../../utils/veiculo";

function extrairNomeServico(servico) {
  if (!servico) return "";
  if (typeof servico === "string") return servico;
  if (typeof servico === "object") return servico.nome || "";
  return "";
}

export default function ModalEditarAgendamento({ isOpen, onClose, onSalvar, agendamento }) {
  const { servicos } = useServicos();
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!agendamento) return;
    setForm({
      clienteNome:     agendamento.clienteNome     || "",
      clienteTelefone: agendamento.clienteTelefone || "",
      servico:         extrairNomeServico(agendamento.servico),
      modeloVeiculo:   extrairVeiculo(agendamento.veiculo).modelo,
      placaVeiculo:    extrairVeiculo(agendamento.veiculo).placa,
      dataInput:       toDateInput(agendamento.data),
      horario:         toTimeInput(agendamento.data, agendamento.horario),
      valor:           agendamento.valor ?? "",
      status:          agendamento.status          || "agendado",
    });
  }, [agendamento]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "servico") {
      const svc = servicos.find((s) => s.nome === value);
      setForm((prev) => ({ ...prev, servico: value, valor: svc?.preco ?? prev.valor }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const [ano, mes, dia] = form.dataInput.split("-").map(Number);
      const [hora, minuto] = form.horario.split(":").map(Number);
      const dataTs = new Date(ano, mes - 1, dia, hora, minuto, 0, 0);

      await onSalvar(agendamento.id, {
        clienteNome:     form.clienteNome,
        clienteTelefone: form.clienteTelefone,
        servico:         form.servico,
        veiculo:         { modelo: form.modeloVeiculo, placa: form.placaVeiculo },
        horario:         form.horario,
        valor:           parseFloat(form.valor) || 0,
        data:            Timestamp.fromDate(dataTs),
        status:          form.status,
      });
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} titulo="Editar Agendamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome do cliente *</label>
          <input name="clienteNome" value={form.clienteNome || ""} onChange={handleChange}
            required placeholder="Ex: João Silva" className="input-field" />
        </div>

        <div>
          <label className="label">Telefone</label>
          <input name="clienteTelefone" value={form.clienteTelefone || ""} onChange={handleChange}
            placeholder="(48) 99999-9999" className="input-field" />
        </div>

        <div>
          <label className="label">Serviço *</label>
          <select name="servico" value={form.servico || ""} onChange={handleChange}
            required className="input-field bg-dark-700">
            <option value="">Selecione um serviço</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.nome}>
                {s.nome}{s.preco ? ` — R$ ${Number(s.preco).toFixed(2)}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Placa</label>
            <input name="placaVeiculo" value={form.placaVeiculo || ""} onChange={handleChange}
              placeholder="ABC-1234" className="input-field" />
          </div>
          <div>
            <label className="label">Modelo</label>
            <input name="modeloVeiculo" value={form.modeloVeiculo || ""} onChange={handleChange}
              placeholder="Ex: Fiat Uno" className="input-field" />
          </div>
          <div>
            <label className="label">Data *</label>
            <input type="date" name="dataInput" value={form.dataInput || ""} onChange={handleChange}
              required className="input-field" />
          </div>
          <div>
            <label className="label">Horário *</label>
            <input type="time" name="horario" value={form.horario || ""} onChange={handleChange}
              required className="input-field" />
          </div>
          <div>
            <label className="label">Valor (R$)</label>
            <input type="number" name="valor" value={form.valor ?? ""} onChange={handleChange}
              min="0" step="0.01" placeholder="0,00" className="input-field" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status || "agendado"} onChange={handleChange}
              className="input-field bg-dark-700">
              {STATUS_OPCOES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="btn-primary flex-1">
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
