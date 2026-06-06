import { Routes, Route, Navigate } from "react-router-dom";
import FloatingCart from "./components/FloatingCart.jsx";
import Navbar from "./components/Navbar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import StoreFooter from "./components/StoreFooter.jsx";
import Catalog from "./pages/store/Catalog.jsx";
import Cart from "./pages/store/Cart.jsx";
import Checkout from "./pages/store/Checkout.jsx";
import PaymentResult from "./pages/store/PaymentResult.jsx";
import LoginCliente from "./pages/store/LoginCliente.jsx";
import CadastroCliente from "./pages/store/CadastroCliente.jsx";
import RecuperarSenhaCliente from "./pages/store/RecuperarSenhaCliente.jsx";
import RedefinirSenhaCliente from "./pages/store/RedefinirSenhaCliente.jsx";
import MeusPedidos from "./pages/store/MeusPedidos.jsx";
import MinhaConta from "./pages/store/MinhaConta.jsx";
import CustomerRoute from "./pages/store/CustomerRoute.jsx";
import Login from "./pages/admin/Login.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import ProductsAdmin from "./pages/admin/ProductsAdmin.jsx";
import OrdersAdmin from "./pages/admin/OrdersAdmin.jsx";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin.jsx";
import SettingsAdmin from "./pages/admin/SettingsAdmin.jsx";
import ProtectedRoute from "./pages/admin/ProtectedRoute.jsx";
import { useStoreSettings } from "./hooks/useStoreSettings.js";

function StorefrontLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-white">
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <StoreFooter />
        <FloatingCart />
      </div>
    </div>
  );
}

function MaintenanceGate({ children }) {
  const { settings, loading } = useStoreSettings();

  if (!loading && settings?.maintenanceMode) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-card animate-fade-in">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Loja em manutenção</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Estamos ajustando a experiência da loja. Volte em instantes.
          </p>
        </div>
      </StorefrontLayout>
    );
  }

  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route
        path="/"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <Catalog />
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/carrinho"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <Cart />
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/checkout"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <Checkout />
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/checkout/sucesso"
        element={
          <StorefrontLayout>
            <PaymentResult variant="sucesso" />
          </StorefrontLayout>
        }
      />
      <Route
        path="/checkout/pendente"
        element={
          <StorefrontLayout>
            <PaymentResult variant="pendente" />
          </StorefrontLayout>
        }
      />
      <Route
        path="/checkout/erro"
        element={
          <StorefrontLayout>
            <PaymentResult variant="erro" />
          </StorefrontLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <LoginCliente />
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/cadastro"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <CadastroCliente />
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/recuperar-senha"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <RecuperarSenhaCliente />
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/redefinir-senha"
        element={
          <StorefrontLayout>
            <RedefinirSenhaCliente />
          </StorefrontLayout>
        }
      />
      <Route
        path="/meus-pedidos"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <CustomerRoute>
                <MeusPedidos />
              </CustomerRoute>
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />
      <Route
        path="/minha-conta"
        element={
          <MaintenanceGate>
            <StorefrontLayout>
              <CustomerRoute>
                <MinhaConta />
              </CustomerRoute>
            </StorefrontLayout>
          </MaintenanceGate>
        }
      />

      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/produtos" replace />} />
        <Route path="produtos" element={<ProductsAdmin />} />
        <Route path="pedidos" element={<OrdersAdmin />} />
        <Route path="avaliacoes" element={<ReviewsAdmin />} />
        <Route path="configuracoes" element={<SettingsAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
