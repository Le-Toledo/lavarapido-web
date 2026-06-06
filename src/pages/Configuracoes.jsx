import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { db, auth } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useEstabelecimento } from "../contexts/EstabelecimentoContext";
import { useToast } from "../components/ui/Toast";

const FORM_EST_VAZIO = { nome: "", endereco: "", telefone: "", horarioFuncionamento: "" };

function Secao({ titulo, children }) {
  return (
    <div className="card space-y-4">
      <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">{titulo}</h2>
      {children}
    </div>
  );
}

export default function Configuracoes() {
  const { usuario } = useAuth();
  const { estabelecimento } = useEstabelecimento();
  const { adicionarToast } = useToast();

  const [formEst, setFormEst] = useState(FORM_EST_VAZIO);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoSenha, setEnviandoSenha] = useState(false);

  useEffect(() => {
    if (estabelecimento) {
      setFormEst({
        nome: estabelecimento.nome || "",
        endereco: estabelecimento.endereco || "",
        telefone: estabelecimento.telefone || "",
        horarioFuncionamento: estabelecimento.horarioFuncionamento || "",
      });
    }
    setNomeUsuario(usuario?.displayName || "");
  }, [estabelecimento, usuario]);

  function handleChange(e) {
    setFormEst((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await setDoc(doc(db, "estabelecimentos", usuario.uid), { ...formEst, userId: usuario.uid }, { merge: true });
      if (nomeUsuario.trim() && nomeUsuario !== usuario?.displayName) {
        await updateProfile(usuario, { displayName: nomeUsuario.trim() });
      }
      adicionarToast("Configurações salvas com sucesso!");
    } catch {
      adicionarToast("Erro ao salvar configurações.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function handleEnviarSenha() {
    setEnviandoSenha(true);
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      adicionarToast("E-mail de redefinição enviado para " + usuario.email);
    } catch {
      adicionarToast("Erro ao enviar e-mail de redefinição.", "erro");
    } finally {
      setEnviandoSenha(false);
    }
  }

  return (
    <form onSubmit={handleSalvar} className="max-w-2xl space-y-6">
      <Secao titulo="Dados do estabelecimento">
        <div>
          <label className="label">Nome do estabelecimento</label>
          <input name="nome" value={formEst.nome} onChange={handleChange}
            className="input-field" placeholder="Ex: Lava Rápido do João" />
        </div>
        <div>
          <label className="label">Endereço</label>
          <input name="endereco" value={formEst.endereco} onChange={handleChange}
            className="input-field" placeholder="Rua, número, bairro — Cidade/UF" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Telefone / WhatsApp</label>
            <input name="telefone" value={formEst.telefone} onChange={handleChange}
              className="input-field" placeholder="(48) 99999-9999" />
          </div>
          <div>
            <label className="label">Horário de funcionamento</label>
            <input name="horarioFuncionamento" value={formEst.horarioFuncionamento} onChange={handleChange}
              className="input-field" placeholder="Ex: Seg–Sáb, 8h–18h" />
          </div>
        </div>
      </Secao>

      <Secao titulo="Perfil do usuário">
        <div>
          <label className="label">Nome de exibição</label>
          <input value={nomeUsuario} onChange={(e) => setNomeUsuario(e.target.value)}
            className="input-field" placeholder="Seu nome" />
        </div>
        <div>
          <label className="label">E-mail (não editável)</label>
          <input value={usuario?.email || ""} disabled
            className="input-field opacity-50 cursor-not-allowed" />
        </div>
        <div>
          <label className="label">Senha</label>
          <button type="button" onClick={handleEnviarSenha} disabled={enviandoSenha}
            className="btn-secondary text-sm">
            {enviandoSenha ? "Enviando…" : "Enviar e-mail para alterar senha"}
          </button>
        </div>
      </Secao>

      <button type="submit" disabled={salvando} className="btn-primary px-10">
        {salvando ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}
