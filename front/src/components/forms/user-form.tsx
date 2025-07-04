/**
 * @file: user-form.tsx
 * @description: Универсальная форма создания/редактирования пользователя (login, role, status, магазин)
 * @dependencies: react, shadcn/ui, zod
 * @created: 2024-07-04
 */
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const userSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  role: z.enum(["admin", "store_manager"]),
  status: z.enum(["active", "blocked", "inactive"]).optional(),
  storeId: z.string().optional().nullable(),
  password: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  initialValues: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
  mode: "create" | "edit";
  loading?: boolean;
  stores: { id: string; name: string }[];
}

export const UserForm: React.FC<UserFormProps> = ({ initialValues, onSubmit, mode, loading, stores }) => {
  const [values, setValues] = useState<UserFormValues>({
    login: initialValues.login || "",
    role: initialValues.role || "store_manager",
    status: initialValues.status || "active",
    storeId: initialValues.storeId || "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
  
  const handleChange = (field: keyof UserFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "role" && value !== "store_manager") {
      setValues((prev) => ({ ...prev, storeId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    // Валидация пароля: обязательно для создания, min 6 символов
    const schema = mode === "create"
      ? userSchema.extend({ password: z.string().min(6, "Пароль минимум 6 символов") })
      : userSchema.extend({
          password: z.string()
            .refine(
              (val) => !val || val.length >= 6,
              { message: "Пароль минимум 6 символов" }
            )
            .optional(),
        });
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UserFormValues, string>> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof UserFormValues] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    const submitData = { ...parsed.data };
    if (mode === "edit" && !submitData.password) {
      delete submitData.password;
    }
    if (mode === "create" && typeof submitData.status !== 'undefined') {
      delete submitData.status;
    }
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Логин</label>
        <Input
          value={values.login}
          onChange={(e) => handleChange("login", e.target.value)}
          placeholder="user123"
          disabled={loading}
        />
        {errors.login && <div className="text-red-500 text-xs mt-1">{errors.login}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Пароль</label>
        <Input
          type="password"
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder={mode === "edit" ? "Оставьте пустым, чтобы не менять" : "Введите пароль"}
          disabled={loading}
        />
        {mode === "edit" && (
          <div className="text-xs text-gray-500 mt-1">Если оставить пустым, пароль не изменится</div>
        )}
        {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Роль</label>
        <Select
          value={values.role}
          onValueChange={(v) => handleChange("role", v)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Администратор</SelectItem>
            <SelectItem value="store_manager">Менеджер магазина</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <div className="text-red-500 text-xs mt-1">{errors.role}</div>}
      </div>
      {values.role === "store_manager" && (
        <div>
          <label className="block text-sm font-medium mb-1">Магазин</label>
          <Select
            value={values.storeId || ""}
            onValueChange={(v) => handleChange("storeId", v)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите магазин" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.storeId && <div className="text-red-500 text-xs mt-1">{errors.storeId}</div>}
        </div>
      )}
      {mode === "edit" && (
        <div>
          <label className="block text-sm font-medium mb-1">Статус</label>
          <Select
            value={values.status}
            onValueChange={(v) => handleChange("status", v)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="blocked">Заблокирован</SelectItem>
              <SelectItem value="inactive">Неактивен</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {mode === "create" ? "Создать пользователя" : "Сохранить изменения"}
      </Button>
    </form>
  );
}; 