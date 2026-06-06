import { createContext, useContext, useState, useCallback } from "react";
import { MdCheckCircle, MdError, MdClose } from "react-icons/md";

const ToastContext = createContext(null);

function ToastItem({ id, mensagem, tipo, onRemover }) {
  const cfg = {
    sucesso: { bg: "bg-green-500/15 border-green-500/30", icone: MdCheckCircle, cor: "text-green-400" },
    erro:    { bg: "bg-red-500/15   border-red-500/30",   icone: MdError,        cor: "text-red-400"   },
  }[tipo] ?? { bg: "bg-green-500/15 border-green-500/30", icone: MdCheckCircle, cor: "text-green-400" };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${cfg.bg}`}>
      <cfg.icone className={`text-xl shrink-0 ${cfg.cor}`} />
      <p className="text-sm text-white flex-1">{mensagem}</p>
      <button onClick={() => onRemover(id)} className="text-slate-400 hover:text-white transition-colors">
        <MdClose className="text-lg" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const adicionarToast = useCallback((mensagem, tipo = "sucesso") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removerToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ adicionarToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onRemover={removerToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
