/**
 * @file: store-form.tsx
 * @description: Красивая современная форма создания/редактирования магазина (admin) с использованием shadcn/ui Card и Form
 * @dependencies: React, shadcn/ui, react-hook-form, zod, react-input-mask, services/api
 * @created: 2024-07-03
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PatternFormat } from 'react-number-format';
import { CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '../ui/form';
import { adminApi } from '../../services/api';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import type { ApiError } from '@/types/api-response';

const statusOptions = [
  { value: 'active', label: 'Активен' },
  { value: 'inactive', label: 'Неактивен' },
];

const storeSchema = z.object({
  name: z.string().min(2, 'Название обязательно'),
  address: z.string().min(5, 'Адрес обязателен'),
  phone: z.string().regex(/^998\d{9}$/, 'Телефон должен быть в формате 998XXXXXXXXX'),
  status: z.enum(['active', 'inactive']),
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
      const err = e as ApiError
        
      if (err?.errors) {
        const errors = err.errors as Record<keyof StoreFormValues, string[]>;
        Object.entries(errors).forEach(([field, messages]) => {
          setError(field as keyof StoreFormValues, { type: 'server', message: messages.join(', ') });
        });
      } else {
        const message = err?.message || err.message || 'Ошибка';
        toast.error('Ошибка: ' + message);
      }
    }
  };

  return (
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
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
                    <PatternFormat
                      {...field}
                      format="998#########"
                      allowEmptyFormatting={true}
                      mask=" "
                      placeholder="998 90 123 45 67"
                      customInput={Input}
                      disabled={isSubmitting}
                      onValueChange={values => field.onChange(values.value)}
                    />
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