import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function atualizarAgendamento(id, dados) {
  await updateDoc(doc(db, "agendamentos", id), dados);
}
