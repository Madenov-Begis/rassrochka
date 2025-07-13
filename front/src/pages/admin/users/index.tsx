import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { adminApi } from "@/services/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Eye, Plus, UserCheck, UserX } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { toast } from "react-toastify"
import { Pagination } from "@/components/pagination"
import { useDebounce } from "@/hooks/use-debounce"
import { UserForm } from "@/components/forms/user-form"
import type { UserFormValues } from "@/components/forms/user-form"

export default function AdminUsers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const limit = 10
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", { page, limit, search: debouncedSearch }],
    queryFn: () => adminApi.getUsers({ page, limit, search: debouncedSearch }),
  })

  useEffect(() => {
    adminApi.getStores({ limit: 1000 }).then((res) => {
      setStores(res.data || [])
    })
  }, [])

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setIsCreateDialogOpen(false)
      toast.success("Пользователь создан")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error("Не удалось создать пользователя: " + error.response?.data?.message)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, status === "active"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("Статус пользователя обновлен")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error("Не удалось обновить статус: " + error.response?.data?.message)
    },
  })

  const users = data?.data?.items || []
  const total = data?.data?.total || 0

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Администратор", variant: "default" as const },
      store_manager: { label: "Менеджер магазина", variant: "secondary" as const },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.store_manager
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleCreateUser = async (values: UserFormValues) => {
    await createUserMutation.mutateAsync({
      ...values,
      storeId: values.role === "store_manager" ? values.storeId : null,
    })
    setIsCreateDialogOpen(false)
  }

  const handleStatusToggle = (user: { id: string; status: string }) => {
    const newStatus = user.status === "active" ? "blocked" : "active"
    updateStatusMutation.mutate({ id: user.id, status: newStatus })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
            <p className="text-muted-foreground">Управление пользователями системы</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать пользователя</DialogTitle>
              </DialogHeader>
              <UserForm
                initialValues={{ login: "", role: "store_manager", status: "active", storeId: "" }}
                onSubmit={handleCreateUser}
                mode="create"
                loading={createUserMutation.isPending}
                stores={stores}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Поиск</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по логину..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="pt-6">
          <CardContent>

            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Пользователи не найдены</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Магазин</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Создан</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: { id: string; login: string; role: string; store: { name: string }; status: string; createdAt: string }) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.login}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.store?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : user.status === "blocked"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {user.status === "active"
                              ? "Активен"
                              : user.status === "blocked"
                              ? "Заблокирован"
                              : "Неактивен"}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(user.createdAt), "dd MMM yyyy", { locale: ru })}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/users/${user.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(user)}
                              disabled={updateStatusMutation.isPending}
                            >
                              {user.status === "active" ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination
                  page={page}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                  className="flex justify-center mt-6"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
