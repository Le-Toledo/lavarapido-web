import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EstabelecimentoProvider } from "./contexts/EstabelecimentoContext";
import { ToastProvider } from "./components/ui/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import RotaProtegida from "./components/layout/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";

// Lazy loading — cada página carrega sob demanda, bundle inicial ~70% menor
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Agenda       = lazy(() => import("./pages/Agenda"));
const Servicos     = lazy(() => import("./pages/Servicos"));
const Relatorios   = lazy(() => import("./pages/Relatorios"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <EstabelecimentoProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<RotaProtegida />}>
                  <Route element={<MainLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard"     element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                    <Route path="/agenda"        element={<Suspense fallback={<PageLoader />}><Agenda /></Suspense>} />
                    <Route path="/servicos"      element={<Suspense fallback={<PageLoader />}><Servicos /></Suspense>} />
                    <Route path="/relatorios"    element={<Suspense fallback={<PageLoader />}><Relatorios /></Suspense>} />
                    <Route path="/configuracoes" element={<Suspense fallback={<PageLoader />}><Configuracoes /></Suspense>} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ToastProvider>
          </EstabelecimentoProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
