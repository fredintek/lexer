"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "use-intl";

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  minWidth?: string;
  isLoading?: boolean;
  totalItems?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T>({
  data,
  columns,
  itemsPerPage = 10,
  minWidth = "1200px",
  isLoading = false,
  totalItems,
  page: externalPage,
  onPageChange,
}: DataTableProps<T>) {
  const t = useTranslations();

  // Determine if we are using internal state or external server-side state
  const isServerSide = totalItems !== undefined;
  const [internalPage, setInternalPage] = React.useState(1);

  const currentPage = isServerSide ? externalPage || 1 : internalPage;
  const totalCount = isServerSide ? totalItems : data.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // If server-side, 'data' is already a slice. If client-side, we slice it here.
  const currentData = isServerSide
    ? data
    : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  // Skeleton rows to match the table structure during loading
  const skeletonRows = Array.from({ length: itemsPerPage });

  return (
    <div className="relative max-w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-bg shadow-sm">
      {/* Optional: Visual loading bar at the top */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand/20 overflow-hidden z-10">
          <div
            className="h-full bg-brand w-1/3 animate-[loading_1.5s_infinite_linear]"
            style={{
              backgroundImage:
                "linear-gradient(to right, transparent, currentColor, transparent)",
            }}
          />
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <table
          className="w-full text-left border-collapse"
          style={{ minWidth }}
        >
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${
                    col.align === "right" ? "text-right" : ""
                  } ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? (
              // --- SKELETON LOADING STATE ---
              skeletonRows.map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {columns.map((_, colIdx) => (
                    <td key={`skeleton-col-${colIdx}`} className="px-6 py-6">
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : currentData?.length > 0 ? (
              currentData.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-6 py-4 ${
                        col.align === "right" ? "text-right" : ""
                      } ${col.className || ""}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // --- EMPTY STATE ---
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                >
                  {t("NO_RECORDS_FOUND")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Footer --- */}
      {/* Hide footer while loading to prevent interaction with empty pages */}
      {!isLoading && totalCount > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 dark:bg-slate-900/20 gap-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
            {t("SHOWING_ENTRIES", {
              from: (currentPage - 1) * itemsPerPage + 1,
              to: Math.min(currentPage * itemsPerPage, totalCount),
              total: totalCount,
            })}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-brand text-white shadow-lg shadow-brand/20"
                          : "text-slate-400 hover:text-fg"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2)
                  return (
                    <span key={i} className="text-slate-400">
                      ...
                    </span>
                  );
                return null;
              })}
            </div>

            <button
              onClick={() =>
                handlePageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Skeleton Footer for consistent height while loading */}
      {isLoading && (
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
      )}
    </div>
  );
}
