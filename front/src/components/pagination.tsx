/**
 * @file: pagination.tsx
 * @description: Переиспользуемый компонент серверной пагинации с иконками (shadcn/ui)
 * @dependencies: react, @/components/ui/pagination, @/components/ui/button
 * @created: 2024-07-03
 */
import React from "react";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface PaginationProps {
  page: number;
  total: number;
  limit?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  limit = 10,
  onPageChange,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // if (totalPages <= 1) return null;

  return (
    <div className={className}>
      <ShadcnPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onPageChange(page - 1)}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : 0}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={page === i + 1}
                onClick={e => {
                  e.preventDefault();
                  onPageChange(i + 1);
                }}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && onPageChange(page + 1)}
              aria-disabled={page === totalPages}
              tabIndex={page === totalPages ? -1 : 0}
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
}; 