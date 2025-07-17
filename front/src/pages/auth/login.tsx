import { useState } from "react"
import { Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    login: "",
    password: "",
  })

  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/store"} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(credentials)
    } catch (err) {
      console.log(err)
      // Error is handled by the store
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [field]: e.target.value }))
    if (error) clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-2 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">InstallmentPro</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">Система управления рассрочками</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">Вход в систему</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Введите свои учетные данные для доступа к панели управления</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  value={credentials.login}
                  onChange={handleInputChange("login")}
                  placeholder="Введите логин"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange("password")}
                  placeholder="Введите пароль"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs sm:text-sm text-gray-600">
          <p>Демо-аккаунты:</p>
          <p>
            <strong>Администратор:</strong> admin / admin123
          </p>
          <p>
            <strong>Менеджер:</strong> manager / manager123
          </p>
        </div>
      </div>
    </div>
  )
}
