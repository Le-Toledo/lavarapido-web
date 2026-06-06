import { createContext, useContext, useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const EstabelecimentoContext = createContext(null);

export function EstabelecimentoProvider({ children }) {
  const { usuario } = useAuth();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) {
      setEstabelecimento(null);
      setCarregando(false);
      return;
    }

    const q = query(
      collection(db, "estabelecimentos"),
      where("userId", "==", usuario.uid)
    );

    const cancelar = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const doc = snap.docs[0];
        setEstabelecimento({ id: doc.id, ...doc.data() });
      } else {
        setEstabelecimento(null);
      }
      setCarregando(false);
    });

    return cancelar;
  }, [usuario]);

  return (
    <EstabelecimentoContext.Provider value={{ estabelecimento, carregando }}>
      {children}
    </EstabelecimentoContext.Provider>
  );
}

export function useEstabelecimento() {
  const contexto = useContext(EstabelecimentoContext);
  if (!contexto) {
    throw new Error("useEstabelecimento deve ser usado dentro de EstabelecimentoProvider");
  }
  return contexto;
}
