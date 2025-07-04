import { createBrowserRouter, Navigate } from "react-router-dom"
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
import { DashboardLayout } from "./components/layout/dashboard-layout"
import React from "react"
import { useAuthStore } from "./store/auth-store"

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore.getState()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/store"} replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/store",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StoreDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/customers",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StoreCustomers />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/customers/:id",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StoreCustomerDetail />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/installments",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StoreInstallments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/installments/:id",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StoreInstallmentDetail />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/payments",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StorePayments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/payments/calendar",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <PaymentsCalendar />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store/payments/:id",
    element: (
      <ProtectedRoute allowedRoles={["store_manager"]}>
        <DashboardLayout>
          <StorePaymentDetail />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      {/* // </ProtectedRoute> */}
    ),
  },
  {
    path: "/admin/stores",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AdminStores />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/stores/:id",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AdminStoreDetail />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AdminUsers />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/:id",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AdminUserDetail />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      (() => {
        const { isAuthenticated, user } = useAuthStore.getState()
        return <Navigate to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/store") : "/login"} replace />
      })()
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]) 