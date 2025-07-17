import { useState, useEffect } from "react"
import { ArrowLeft, User, Store, Shield, Calendar, Edit, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/services/api"
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { UserForm } from "@/components/forms/user-form"
import type { UserFormValues } from "@/components/forms/user-form"
import type { AdminStore } from "@/types/admin/store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [stores, setStores] = useState<AdminStore[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUser(id as string),
    enabled: !!id,
  })

  const { data: userActivity } = useQuery({
    queryKey: ["admin-user-activity", id],
    queryFn: () => adminApi.getUserActivity(id as string),
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => adminApi.updateUserStatus(id as string, isActive),
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] })
      setIsStatusDialogOpen(false)
      toast.success(isActive ? "Пользователь активирован" : "Пользователь заблокирован")
    },
  })

  useEffect(() => {
    adminApi.getStores({ limit: 1000 }).then((res) => {
      setStores(res.data?.items || [])
    })
  }, [])

  const handleEditUser = async (values: UserFormValues) => {
    await adminApi.updateUser(user.id, {
      ...values,
      storeId: values.role === "store_manager" ? values.storeId : null,
    })
    setIsEditDialogOpen(false)
    queryClient.invalidateQueries({ queryKey: ["admin-user", user.id] })
    toast.success("Пользователь обновлён")
  }

  if (isLoading) {
    return (
        <DashboardSkeleton />
    )
  }

  if (!user) {
    return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Пользователь не найден</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Вернуться назад
          </Button>
        </div>
    )
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-purple-100 text-purple-800",
      store_manager: "bg-blue-100 text-blue-800",
    }

    const labels = {
      admin: "Администратор",
      store_manager: "Менеджер магазина",
    }

    return <Badge className={variants[role as keyof typeof variants]}>{labels[role as keyof typeof labels]}</Badge>
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.data.login}</h1>
            <p className="text-gray-600">ID: <span className="font-mono text-xs">{user.id}</span></p>
          </div>
          <div className="flex items-center gap-2">
            {getRoleBadge(user.data.role)}
            <Badge
              className={
                user.data.status === "active"
                  ? "bg-green-100 text-green-800"
                  : user.data.status === "blocked"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600"
                  }
                >
              {user.data.status === "active"
                ? "Активен"
                : user.data.status === "blocked"
                ? "Заблокирован"
                : "Неактивен"}
            </Badge>
          
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать пользователя</DialogTitle>
                </DialogHeader>
                <UserForm
                  initialValues={{
                    login: user.data.login,
                    role: user.data.role,
                    status: user.data.status,
                    storeId: user.data.storeId || "",
                  }}
                  onSubmit={handleEditUser}
                  mode="edit"
                  loading={updateStatusMutation.isPending}
                  stores={stores}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
            <TabsTrigger value="permissions">Права доступа</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info */}
              <Card className="text-xs sm:text-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Информация о пользователе</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{user.data.login}</p>
                      <p className="text-sm text-gray-600">Логин</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">{getRoleBadge(user.data.role)}</div>
                      <p className="text-sm text-gray-600">Роль в системе</p>
                    </div>
                  </div>

                  {user.data.store && (
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{user.data.store.name}</p>
                        <p className="text-sm text-gray-600">{user.data.store.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{new Date(user.data.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Дата создания</p>
                      </div>
                    </div>
                  </div>

                  {user.data.lastLogin && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{new Date(user.data.lastLogin).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Последний вход</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Управление пользователем</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant={user.data.isActive ? "destructive" : "default"} className="w-full">
                        {user.data.isActive ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Заблокировать пользователя
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Активировать пользователя
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {user.data.isActive ? "Заблокировать пользователя" : "Активировать пользователя"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert variant={user.data.isActive ? "destructive" : "default"}>
                          <AlertDescription>
                            {user.data.isActive
                              ? "Пользователь будет заблокирован и не сможет войти в систему."
                              : "Пользователь будет активирован и сможет войти в систему."}
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button
                            variant={user.data.isActive ? "destructive" : "default"}
                            onClick={() => updateStatusMutation.mutate(!user.data.isActive)}
                            disabled={updateStatusMutation.isPending}
                          >
                            {user.data.isActive ? "Заблокировать" : "Активировать"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Сменить пароль
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Shield className="h-4 w-4 mr-2" />
                    Изменить роль
                  </Button>

                  {!user.data.isActive && (
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>Пользователь заблокирован и не может войти в систему.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Активность пользователя</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table className="min-w-[700px] sm:min-w-0 text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Дата</TableHead>
                        <TableHead className="whitespace-nowrap">Действие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivity?.map((activity: { action: string; timestamp: string; details: string }, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="whitespace-nowrap text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</TableCell>
                          <TableCell className="font-medium">{activity.action}</TableCell>
                          {activity.details && <TableCell className="whitespace-nowrap text-sm text-gray-600">{activity.details}</TableCell>}
                        </TableRow>
                      )) || <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500 text-sm">История активности пуста</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Права доступа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.data.role === "admin" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>Управление магазинами</span>
                        <Badge className="bg-green-100 text-green-800">Разрешено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>Управление пользователями</span>
                        <Badge className="bg-green-100 text-green-800">Разрешено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>Просмотр всей статистики</span>
                        <Badge className="bg-green-100 text-green-800">Разрешено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>Системные настройки</span>
                        <Badge className="bg-green-100 text-green-800">Разрешено</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span>Управление клиентами магазина</span>
                        <Badge className="bg-blue-100 text-blue-800">Разрешено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span>Создание рассрочек</span>
                        <Badge className="bg-blue-100 text-blue-800">Разрешено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span>Управление платежами</span>
                        <Badge className="bg-blue-100 text-blue-800">Разрешено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Управление магазинами</span>
                        <Badge variant="outline">Запрещено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Управление пользователями</span>
                        <Badge variant="outline">Запрещено</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
