import { useEffect, useState, useCallback } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

export function useServicos() {
  const { usuario } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const q = query(
      collection(db, "servicos"),
      where("userId", "==", usuario.uid)
    );
    return onSnapshot(q, (snap) => {
      setServicos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
  }, [usuario]);

  const criarServico = useCallback(async (dados) => {
    await addDoc(collection(db, "servicos"), {
      ...dados,
      userId: usuario.uid,
      estabelecimentoId: usuario.uid,
      criadoEm: serverTimestamp(),
    });
  }, [usuario]);

  const atualizarServico = useCallback(async (id, dados) => {
    await updateDoc(doc(db, "servicos", id), dados);
  }, []);

  const removerServico = useCallback(async (id) => {
    await deleteDoc(doc(db, "servicos", id));
  }, []);

  return { servicos, carregando, criarServico, atualizarServico, removerServico };
}
