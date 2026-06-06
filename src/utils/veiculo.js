// Normaliza o campo veiculo independente de ser objeto {modelo,placa} ou string legada
export function formatarVeiculo(v) {
  if (!v) return null;
  if (typeof v === "string") return v || null;
  const parts = [v.modelo, v.placa].filter(Boolean);
  return parts.length ? parts.join(" — ") : null;
}

// Extrai modelo e placa seja objeto ou string
export function extrairVeiculo(v) {
  if (!v) return { modelo: "", placa: "" };
  if (typeof v === "string") return { modelo: v, placa: "" };
  return { modelo: v.modelo || "", placa: v.placa || "" };
}
