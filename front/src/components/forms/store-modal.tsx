/**
 * @file: store-modal.tsx
 * @description: Модальное окно для создания/редактирования магазина с формой StoreForm (shadcn/ui Dialog)
 * @dependencies: React, shadcn/ui, StoreForm
 * @created: 2024-07-03
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { StoreForm } from './store-form';

interface StoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  storeId?: string;
  initial?: {
    name?: string;
    address?: string;
    phone?: string;
    status?: string;
  };
  trigger?: React.ReactNode;
}

export function StoreModal({ open, onOpenChange, onSuccess, storeId, initial, trigger }: StoreModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{storeId ? 'Редактировать магазин' : 'Добавить магазин'}</DialogTitle>
          <DialogDescription>
            {storeId
              ? 'Измените данные магазина и сохраните изменения.'
              : 'Заполните все поля для добавления нового магазина.'}
          </DialogDescription>
        </DialogHeader>
        <StoreForm
          storeId={storeId}
          initial={initial}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
} 