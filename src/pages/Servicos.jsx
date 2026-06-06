import { useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdBuildCircle } from "react-icons/md";
import { useServicos } from "../hooks/useServicos";
import { useToast } from "../components/ui/Toast";
import ModalServico from "../components/ui/ModalServico";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatarTempo(min) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m ? ` ${m}min` : ""}` : `${m}min`;
}

function EmptyState({ onAdicionar }) {
  return (
    <div className="card flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-5">
        <MdBuildCircle className="text-3xl text-cyan-400" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">Nenhum serviço cadastrado</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs">
        Adicione os serviços que seu lava-rápido oferece para começar a agendar.
      </p>
      <button onClick={onAdicionar} className="btn-primary flex items-center gap-2">
        <MdAdd className="text-xl" /> Adicionar primeiro serviço
      </button>
    </div>
  );
}

export default function Servicos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState(null);
  const { servicos, carregando, criarServico, atualizarServico, removerServico } = useServicos();
  const { adicionarToast } = useToast();

  function abrirEdicao(s) { setServicoEditando(s); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setServicoEditando(null); }

  async function handleSalvar(dados) {
    try {
      if (servicoEditando) { await atualizarServico(servicoEditando.id, dados); adicionarToast("Serviço atualizado!"); }
      else { await criarServico(dados); adicionarToast("Serviço criado!"); }
    } catch { adicionarToast("Erro ao salvar serviço.", "erro"); throw new Error(); }
  }

  async function handleRemover(id) {
    if (!window.confirm("Remover este serviço?")) return;
    try { await removerServico(id); adicionarToast("Serviço removido."); }
    catch { adicionarToast("Erro ao remover.", "erro"); }
  }

  if (carregando) return <div className="card animate-pulse h-48" />;

  if (!servicos.length) return (
    <>
      <EmptyState onAdicionar={() => setModalAberto(true)} />
      <ModalServico isOpen={modalAberto} onClose={fecharModal} onSalvar={handleSalvar} />
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">
          {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} cadastrado{servicos.length !== 1 ? "s" : ""}
        </p>
        <button onClick={() => setModalAberto(true)} className="btn-primary flex items-center gap-2">
          <MdAdd className="text-xl" /> Novo serviço
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-dark-700/50">
              {["Nome", "Descrição", "Preço", "Duração", "Ações"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {servicos.map((s) => (
              <tr key={s.id} className="hover:bg-slate-700/20 transition-colors group">
                <td className="px-5 py-3.5 font-medium text-white">{s.nome}</td>
                <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">{s.descricao || "—"}</td>
                <td className="px-5 py-3.5 text-cyan-400 font-semibold whitespace-nowrap">{BRL.format(s.preco || 0)}</td>
                <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{formatarTempo(s.tempoMinutos)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => abrirEdicao(s)}
                      className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Editar">
                      <MdEdit className="text-base" />
                    </button>
                    <button onClick={() => handleRemover(s.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remover">
                      <MdDelete className="text-base" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalServico isOpen={modalAberto} onClose={fecharModal} onSalvar={handleSalvar} servicoEditando={servicoEditando} />
    </div>
  );
}
