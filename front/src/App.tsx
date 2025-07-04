import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/auth-store"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from "./pages/auth/login"
import StoreDashboard from "./pages/store/dashboard"
import StoreCustomers from "./pages/store/customers"
import StoreCustomerDetail from "./pages/store/customers/[id]"
import StoreInstallments from "./pages/store/installments"
import StoreInstallmentDetail from "./pages/store/installments/[id]"
import StorePayments from "./pages/store/payments"
import StorePaymentDetail from "./pages/store/payments/[id]"
import PaymentsCalendar from "./pages/store/payments/calendar"
import AdminDashboard from "./pages/admin/dashboard"
import AdminStores from "./pages/admin/stores"
import AdminStoreDetail from "./pages/admin/stores/[id]"
import AdminUsers from "./pages/admin/users"
import AdminUserDetail from "./pages/admin/users/[id]"

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/store"} replace />
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Store routes
  const storeRoutes = [
    { path: "/store", element: <StoreDashboard /> },
    { path: "/store/customers", element: <StoreCustomers /> },
    { path: "/store/customers/:id", element: <StoreCustomerDetail /> },
    { path: "/store/installments", element: <StoreInstallments /> },
    { path: "/store/installments/:id", element: <StoreInstallmentDetail /> },
    { path: "/store/payments", element: <StorePayments /> },
    { path: "/store/payments/calendar", element: <PaymentsCalendar /> },
    { path: "/store/payments/:id", element: <StorePaymentDetail /> },
  ]

  // Admin routes
  const adminRoutes = [
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/stores", element: <AdminStores /> },
    { path: "/admin/stores/:id", element: <AdminStoreDetail /> },
    { path: "/admin/users", element: <AdminUsers /> },
    { path: "/admin/users/:id", element: <AdminUserDetail /> },
  ]

  return (
    <div className="App">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to={user?.role === "admin" ? "/admin" : "/store"} replace /> : <LoginPage />
            }
          />

          {/* Store routes */}
          {storeRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={["store_manager"]}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Admin routes */}
          {adminRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Default redirects */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/store") : "/login"} replace />
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </div>
  )
}

export default App
