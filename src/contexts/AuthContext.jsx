import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        try {
          // Busca perfil na coleção "usuarios"
          let snap = await getDoc(doc(db, "usuarios", user.uid));

          // Se não achar em "usuarios", tenta em "users"
          if (!snap.exists()) {
            snap = await getDoc(doc(db, "users", user.uid));
          }

          if (snap.exists()) {
            setPerfil(snap.data());
          } else {
            // Cria perfil automaticamente como funcionario
            const novoPerfil = {
              uid: user.uid,
              nome: user.displayName || user.email.split("@")[0],
              email: user.email,
              role: "funcionario",
              criadoEm: serverTimestamp(),
            };
            await setDoc(doc(db, "usuarios", user.uid), novoPerfil);
            setPerfil(novoPerfil);
          }
        } catch (erro) {
          console.error("Erro ao buscar perfil:", erro);
          // Fallback: assume funcionario para o dashboard web
          setPerfil({
            uid: user.uid,
            nome: user.displayName || user.email.split("@")[0],
            email: user.email,
            role: "funcionario",
          });
        }
      } else {
        setUsuario(null);
        setPerfil(null);
      }
      setCarregando(false);
    });
    return cancelar;
  }, []);

  async function entrar(email, senha) {
    const resultado = await signInWithEmailAndPassword(auth, email, senha);
    return resultado.user;
  }

  async function sair() {
    await signOut(auth);
    setPerfil(null);
  }

  const valor = {
    usuario,
    perfil,
    carregando,
    eFuncionario: perfil?.role === "funcionario" || perfil?.role === "admin",
    eCliente: perfil?.role === "cliente",
    entrar,
    sair,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return contexto;
}
