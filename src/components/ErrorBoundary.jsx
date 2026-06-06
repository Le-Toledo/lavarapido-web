import { Component } from "react";
import { MdErrorOutline, MdRefresh } from "react-icons/md";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("[ErrorBoundary]", erro, info.componentStack);
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <MdErrorOutline className="text-4xl text-red-400" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Algo deu errado</h1>
              <p className="text-slate-400 text-sm mt-1">
                {this.state.erro?.message || "Erro inesperado. Tente recarregar a página."}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center gap-2 mx-auto"
            >
              <MdRefresh className="text-lg" /> Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
