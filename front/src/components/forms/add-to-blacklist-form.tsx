/**
 * @file: add-to-blacklist-form.tsx
 * @description: Форма для добавления клиента в чёрный список
 * @dependencies: React, shadcn/ui, TanStack Query, services/api
 * @created: 2024-07-03
 */

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { addToBlacklist } from '../../services/api';

export function AddToBlacklistForm({ passportSeries, passportNumber, customerId, onSuccess }: {
  passportSeries: string;
  passportNumber: string;
  customerId?: string;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      setError(null);
      await addToBlacklist({ passportSeries, passportNumber, reason, customerId });
      if (onSuccess) onSuccess();
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
      <Textarea
        placeholder="Причина добавления в чёрный список"
        value={reason}
        onChange={e => setReason(e.target.value)}
        required
      />
      <Button type="submit" disabled={mutation.isLoading || !reason}>
        Добавить в чёрный список
      </Button>
      {error && <div className="text-red-500">{error}</div>}
      {mutation.isSuccess && <div className="text-green-600">Клиент добавлен в чёрный список</div>}
    </form>
  );
} 