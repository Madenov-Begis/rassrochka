/**
 * @file: check-blacklist-form.tsx
 * @description: Форма для проверки клиента по паспорту в чёрном списке
 * @dependencies: React, shadcn/ui, TanStack Query, services/api
 * @created: 2024-07-03
 */

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useMutation } from '@tanstack/react-query';
import { checkBlacklist } from '../../services/api';

export function CheckBlacklistForm() {
  const [series, setSeries] = useState('');
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      setError(null);
      setResult(null);
      const res = await checkBlacklist(series, number);
      setResult(res.blacklisted);
    },
    onError: (e: any) => setError(e.message || 'Ошибка'),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="flex gap-2">
        <Input
          placeholder="Серия паспорта"
          value={series}
          onChange={e => setSeries(e.target.value)}
          maxLength={4}
        />
        <Input
          placeholder="Номер паспорта"
          value={number}
          onChange={e => setNumber(e.target.value)}
          maxLength={6}
        />
        <Button type="submit" disabled={mutation.isLoading}>
          Проверить
        </Button>
      </div>
      {result !== null && (
        <div className={result ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
          {result ? 'Клиент в чёрном списке' : 'Нет в чёрном списке'}
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
} 