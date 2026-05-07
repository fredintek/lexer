"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
}

export default function DataTable<T>({
  data,
  columns,
  itemsPerPage = 10,
  minWidth = "1200px",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-bg shadow-sm">
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
            {currentData.map((item, rowIdx) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Footer --- */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 dark:bg-slate-900/20 gap-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}{" "}
          entries
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-brand text-white shadow-lg shadow-brand/20"
                        : "text-slate-400 hover:text-fg"
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2)
                return (
                  <span key={i} className="text-slate-400">
                    ...
                  </span>
                );
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
