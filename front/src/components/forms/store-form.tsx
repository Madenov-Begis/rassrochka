/**
 * @file: store-form.tsx
 * @description: Красивая современная форма создания/редактирования магазина (admin) с использованием shadcn/ui Card и Form
 * @dependencies: React, shadcn/ui, react-hook-form, zod, react-input-mask, services/api
 * @created: 2024-07-03
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputMask from 'react-input-mask';
import { CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '../ui/form';
import { adminApi } from '../../services/api';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const statusOptions = [
  { value: 'active', label: 'Активен' },
  { value: 'payment_overdue', label: 'Просрочка' },
  { value: 'blocked', label: 'Заблокирован' },
];

const storeSchema = z.object({
  name: z.string().min(2, 'Название обязательно'),
  address: z.string().min(5, 'Адрес обязателен'),
  phone: z.string().regex(/^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/, 'Телефон в формате +998 (90) 123-45-67'),
  status: z.enum(['active', 'payment_overdue', 'blocked']),
});

type StoreFormValues = z.infer<typeof storeSchema>;

type StoreFormProps = {
  initial?: Partial<StoreFormValues>;
  onSuccess?: () => void;
  storeId?: string;
};

export function StoreForm({ initial, onSuccess, storeId }: StoreFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: initial || { name: '', address: '', phone: '', status: 'active' },
    mode: 'onChange',
  });

  const { reset, formState, handleSubmit, setError, clearErrors } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: StoreFormValues) => {
    try {
      if (storeId) {
        await adminApi.updateStore(storeId, data);
        toast.success('Магазин обновлён');
      } else {
        await adminApi.createStore(data);
        toast.success('Магазин создан');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      clearErrors();
      if (onSuccess) onSuccess();
    } catch (e: unknown) {
      // AxiosError
      const err = e as import('axios').AxiosError<Record<string, any>>;
      const data = err?.response?.data;
      if (data?.errors) {
        const errors = data.errors as Record<keyof StoreFormValues, string[]>;
        Object.entries(errors).forEach(([field, messages]) => {
          setError(field as keyof StoreFormValues, { type: 'server', message: messages.join(', ') });
        });
      } else {
        const message = data?.message || err.message || 'Ошибка';
        toast.error('Ошибка: ' + message);
      }
    }
  };

  return (
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <CardContent className="p-0 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название магазина</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите название магазина" autoFocus disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите адрес магазина" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="+998 (99) 999-99-99"
                      maskChar="_" 
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      disabled={isSubmitting}
                      type="tel"
                    >
                      {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                        <Input {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} placeholder="+998 (90) 123-45-67" />
                      )}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Текущий статус магазина.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex gap-2 justify-end bg-muted/40 rounded-b-lg px-6 py-4">
            <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
              Сбросить
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin mr-2" />}
              {storeId ? 'Сохранить изменения' : 'Создать магазин'}
            </Button>
          </CardFooter>
        </form>
      </Form>
  );
} 