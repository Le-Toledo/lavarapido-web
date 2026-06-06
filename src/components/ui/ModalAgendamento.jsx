import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import Modal from "./Modal";
import { useServicos } from "../../hooks/useServicos";

const FORM_VAZIO = {
  clienteNome: "", servico: "", placaVeiculo: "",
  modeloVeiculo: "", horario: "", valor: "",
};

export default function ModalAgendamento({ isOpen, onClose, onSalvar, dataSelecionada }) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const { servicos } = useServicos();

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
      const [hora, minuto] = form.horario.split(":").map(Number);
      const dataTs = new Date(dataSelecionada);
      dataTs.setHours(hora, minuto, 0, 0);

      await onSalvar({
        clienteNome: form.clienteNome,
        servico: form.servico,
        veiculo: { modelo: form.modeloVeiculo, placa: form.placaVeiculo },
        horario: form.horario,
        valor: parseFloat(form.valor) || 0,
        data: Timestamp.fromDate(dataTs),
      });
      setForm(FORM_VAZIO);
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} titulo="Novo Agendamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome do cliente *</label>
          <input name="clienteNome" value={form.clienteNome} onChange={handleChange}
            required placeholder="Ex: João Silva" className="input-field" />
        </div>

        <div>
          <label className="label">Serviço *</label>
          <select name="servico" value={form.servico} onChange={handleChange}
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
            <input name="placaVeiculo" value={form.placaVeiculo} onChange={handleChange}
              placeholder="ABC-1234" className="input-field" />
          </div>
          <div>
            <label className="label">Modelo</label>
            <input name="modeloVeiculo" value={form.modeloVeiculo} onChange={handleChange}
              placeholder="Ex: Fiat Uno" className="input-field" />
          </div>
          <div>
            <label className="label">Horário *</label>
            <input type="time" name="horario" value={form.horario} onChange={handleChange}
              required className="input-field" />
          </div>
          <div>
            <label className="label">Valor (R$)</label>
            <input type="number" name="valor" value={form.valor} onChange={handleChange}
              min="0" step="0.01" placeholder="0,00" className="input-field" />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={salvando} className="btn-primary flex-1">
            {salvando ? "Salvando…" : "Agendar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
