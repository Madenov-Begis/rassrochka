/**
 * @file: use-debounce.ts
 * @description: Универсальный React-хук для дебаунса значения любого типа
 * @dependencies: react
 * @created: 2024-07-03
 */
import { useEffect, useState } from "react";

/**
 * useDebounce — возвращает значение с задержкой (debounce).
 * @template T
 * @param value Значение любого типа
 * @param delay Задержка в миллисекундах (по умолчанию 300)
 * @returns Дебаунснутое значение
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
} 