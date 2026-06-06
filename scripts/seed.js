import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  inMemoryPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import readline from "readline";

const firebaseConfig = {
  apiKey: "AIzaSyDyvtTQAb_8G3RCOe_CwOLfdwD_9OS3szk",
  authDomain: "lavarapido-wl.firebaseapp.com",
  projectId: "lavarapido-wl",
  storageBucket: "lavarapido-wl.firebasestorage.app",
  messagingSenderId: "634963539792",
  appId: "1:634963539792:web:bc209f55cec3d4e26dde55",
};

const SERVICOS = [
  {
    nome: "Lavagem Simples",
    descricao: "Lavagem externa completa",
    preco: 30,
    tempoMinutos: 30,
  },
  {
    nome: "Lavagem Completa",
    descricao: "Lavagem externa e interna",
    preco: 60,
    tempoMinutos: 60,
  },
  {
    nome: "Lavagem + Aspiração",
    descricao: "Lavagem completa com aspiração",
    preco: 80,
    tempoMinutos: 75,
  },
  {
    nome: "Polimento",
    descricao: "Polimento da pintura",
    preco: 150,
    tempoMinutos: 120,
  },
  {
    nome: "Higienização Interna",
    descricao: "Limpeza profunda do interior",
    preco: 200,
    tempoMinutos: 180,
  },
  {
    nome: "Lavagem de Motor",
    descricao: "Limpeza completa do compartimento",
    preco: 100,
    tempoMinutos: 90,
  },
];

const CLIENTES = [
  { nome: "João Silva", tel: "(48) 98111-1111" },
  { nome: "Maria Santos", tel: "(48) 98222-2222" },
  { nome: "Carlos Oliveira", tel: "(48) 98333-3333" },
  { nome: "Ana Souza", tel: "(48) 98444-4444" },
  { nome: "Pedro Lima", tel: "(48) 98555-5555" },
  { nome: "Fernanda Costa", tel: "(48) 98666-6666" },
  { nome: "Lucas Pereira", tel: "(48) 98777-7777" },
  { nome: "Juliana Rocha", tel: "(48) 98888-8888" },
];

const VEICULOS = [
  { placa: "ABC-1234", modelo: "Honda Civic" },
  { placa: "DEF-5678", modelo: "Toyota Corolla" },
  { placa: "GHI-9012", modelo: "VW Gol" },
  { placa: "JKL-3456", modelo: "Fiat Argo" },
  { placa: "MNO-7890", modelo: "Chevrolet Onix" },
  { placa: "PQR-1357", modelo: "Hyundai HB20" },
];

const HORARIOS = [
  "08:00",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "13:00",
  "14:00",
  "14:30",
  "15:00",
  "16:00",
  "17:00",
];

function gerarAgendamento(uid, diasOffset, status) {
  const data = new Date();
  data.setDate(data.getDate() + diasOffset);
  data.setHours(0, 0, 0, 0);
  const svc = SERVICOS[Math.floor(Math.random() * SERVICOS.length)];
  const cliente = CLIENTES[Math.floor(Math.random() * CLIENTES.length)];
  const veiculo = VEICULOS[Math.floor(Math.random() * VEICULOS.length)];
  const horario = HORARIOS[Math.floor(Math.random() * HORARIOS.length)];
  return {
    estabelecimentoId: uid,
    userId: uid,
    clienteNome: cliente.nome,
    clienteTelefone: cliente.tel,
    servico: svc.nome,
    servicoId: svc.nome.toLowerCase().replace(/\s+/g, "_"),
    veiculo: veiculo,
    data: Timestamp.fromDate(data),
    horario,
    valor: svc.preco,
    status,
    criadoEm: Timestamp.now(),
  };
}

function perguntar(rl, pergunta) {
  return new Promise((resolve) => rl.question(pergunta, resolve));
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n⚠️  Este script vai popular o Firestore com dados de teste.");
  const confirmar = await perguntar(rl, "Continuar? (s/n): ");
  if (confirmar.trim().toLowerCase() !== "s") {
    console.log("Cancelado.");
    rl.close();
    process.exit(0);
  }

  const email = await perguntar(rl, "E-mail Firebase: ");
  const senha = await perguntar(rl, "Senha: ");
  rl.close();

  const app = initializeApp(firebaseConfig);
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });
  const db = getFirestore(app);

  console.log("\n🔐 Autenticando...");
  let uid;
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      senha.trim()
    );
    uid = cred.user.uid;
    console.log(`✔  Autenticado como ${email.trim()} (uid: ${uid})\n`);
  } catch (err) {
    console.error("✖  Falha na autenticação:", err.message);
    process.exit(1);
  }

  await setDoc(doc(db, "estabelecimentos", uid), {
    userId: uid,
    nome: "LavaRápido do Leandro",
    endereco: "Rua das Flores, 123 — Florianópolis, SC",
    telefone: "(48) 99999-0000",
    horarioFuncionamento: "Seg–Sex 8h–18h | Sáb 8h–14h",
    criadoEm: Timestamp.now(),
  });
  console.log("✓  Estabelecimento criado");

  for (const svc of SERVICOS) {
    await addDoc(collection(db, "servicos"), {
      ...svc,
      userId: uid,
      estabelecimentoId: uid,
      criadoEm: Timestamp.now(),
    });
  }
  console.log(`✓  ${SERVICOS.length} serviços criados`);

  const lotes = [
    ...Array.from({ length: 3 }, () => gerarAgendamento(uid, 0, "agendado")),
    ...Array.from({ length: 2 }, () =>
      gerarAgendamento(uid, 0, "em_andamento")
    ),
    ...Array.from({ length: 2 }, () => gerarAgendamento(uid, 0, "concluido")),
    gerarAgendamento(uid, 0, "cancelado"),
    ...Array.from({ length: 10 }, (_, i) =>
      gerarAgendamento(uid, -(i % 7) - 1, "concluido")
    ),
    ...Array.from({ length: 7 }, (_, i) =>
      gerarAgendamento(uid, -(i + 8), "concluido")
    ),
    ...Array.from({ length: 5 }, (_, i) =>
      gerarAgendamento(uid, (i % 3) + 1, "agendado")
    ),
  ];

  for (const ag of lotes) {
    await addDoc(collection(db, "agendamentos"), ag);
  }
  console.log(`✓  ${lotes.length} agendamentos criados`);
  console.log(
    `\nTotal de documentos inseridos: ${1 + SERVICOS.length + lotes.length}`
  );
  console.log("\n🎉 Seed concluído! Recarregue o painel para ver os dados.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✖  Erro inesperado:", err.message);
  process.exit(1);
});
