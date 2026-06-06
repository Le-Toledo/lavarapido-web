import { useState, useEffect } from "react";
import Modal from "./Modal";

const FORM_VAZIO = { nome: "", descricao: "", preco: "", tempoMinutos: "" };

export default function ModalServico({ isOpen, onClose, onSalvar, servicoEditando }) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setForm(
      servicoEditando
        ? {
            nome: servicoEditando.nome || "",
            descricao: servicoEditando.descricao || "",
            preco: servicoEditando.preco ?? "",
            tempoMinutos: servicoEditando.tempoMinutos ?? "",
          }
        : FORM_VAZIO
    );
  }, [servicoEditando, isOpen]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({
        ...form,
        preco: parseFloat(form.preco) || 0,
        tempoMinutos: parseInt(form.tempoMinutos) || 0,
      });
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  const titulo = servicoEditando ? "Editar Serviço" : "Novo Serviço";

  return (
    <Modal isOpen={isOpen} onClose={onClose} titulo={titulo}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome do serviço *</label>
          <input name="nome" value={form.nome} onChange={handleChange}
            required placeholder="Ex: Lavagem completa" className="input-field" />
        </div>

        <div>
          <label className="label">Descrição</label>
          <textarea name="descricao" value={form.descricao} onChange={handleChange}
            rows={2} placeholder="Descreva o que inclui…"
            className="input-field resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Preço (R$) *</label>
            <input type="number" name="preco" value={form.preco} onChange={handleChange}
              required min="0" step="0.01" placeholder="0,00" className="input-field" />
          </div>
          <div>
            <label className="label">Tempo (minutos)</label>
            <input type="number" name="tempoMinutos" value={form.tempoMinutos} onChange={handleChange}
              min="1" placeholder="Ex: 30" className="input-field" />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={salvando} className="btn-primary flex-1">
            {salvando ? "Salvando…" : servicoEditando ? "Salvar alterações" : "Criar serviço"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
