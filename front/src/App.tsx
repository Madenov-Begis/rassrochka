import { Navigate, RouterProvider, createBrowserRouter, Outlet } from "react-router-dom"
import { useAuthStore } from "./store/auth-store"
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
import SearchPassportPage from "./pages/store/customers/search-passport"
import CreateInstallmentPage from "./pages/store/installments/create"
import { DashboardLayout } from "./components/layout/dashboard-layout"

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/store" replace />
  }

  return <Outlet />
}


const StoreRoute = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "store_manager") {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/store"} replace />
  }

  return <Outlet />
}

const storeRoutes = [
  { path: "/store", element: <StoreDashboard /> },
  { path: "/store/customers", element: <StoreCustomers /> },
  { path: "/store/customers/:id", element: <StoreCustomerDetail /> },
  { path: "/store/customers/search-passport", element: <SearchPassportPage /> },
  { path: "/store/installments", element: <StoreInstallments /> },
  { path: "/store/installments/create", element: <CreateInstallmentPage /> },
  { path: "/store/installments/:id", element: <StoreInstallmentDetail /> },
  { path: "/store/payments", element: <StorePayments /> },
  { path: "/store/calendar", element: <PaymentsCalendar /> },
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

const router = createBrowserRouter([
  { path: "/", 
    element: <PublicRoute />, 
    children: [
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "/login", element: <LoginPage   /> },
  ] },
  {
    path: "",
    element: <DashboardLayout />,
    children: [
      { path: "/store", element: <StoreRoute />, children: storeRoutes },
      { path: "/admin", element: <AdminRoute />, children: adminRoutes },
    ]
  },
])

function App() {
  return (
   <RouterProvider router={router} />
  )
}

export default App
