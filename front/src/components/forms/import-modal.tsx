/**
 * @file: import-modal.tsx
 * @description: Модалка для импорта клиентов или рассрочек через Excel
 * @dependencies: Dialog, Button, Card, axios
 * @created: 2024-07-16
 */
import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'clients' | 'installments';
  templateUrl: string;
  endpoint: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({ open, onOpenChange, type, templateUrl, endpoint }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`http://localhost:3000${endpoint}`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } 
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ошибка импорта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Импорт {type === 'clients' ? 'клиентов' : 'рассрочек'}</DialogTitle>
          <DialogDescription>
            Загрузите Excel-файл по <a href={templateUrl} download className="text-blue-600 underline">шаблону</a>. Все поля должны быть заполнены строго по формату.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="py-4 flex flex-col gap-4">
            <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleFileChange} />
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? 'Импорт...' : 'Импортировать'}
            </Button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {result && (
              <div className="text-sm">
                <div>Всего строк: {result.total}</div>
                <div>Успешно: <span className="text-green-700 font-bold">{result.success}</span></div>
                <div>Ошибки: <span className="text-red-700 font-bold">{result.errors.length}</span></div>
                {result.errors.length > 0 && (
                  <div className="max-h-40 overflow-auto mt-2 border rounded p-2 bg-red-50">
                    {result.errors.map((err: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-semibold">Строка: {JSON.stringify(err.row)}</div>
                        <div className="text-xs text-red-600">{Array.isArray(err.errors) ? err.errors.map((e: any) => typeof e === 'string' ? e : e.toString()).join('; ') : err.errors}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Закрыть</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 