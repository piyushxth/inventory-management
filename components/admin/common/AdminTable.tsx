"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "../tables/Pagination";
import Input from "../form/input/InputField";

export interface AdminTableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  pageSize?: number;
  loading?: boolean;
  onRowSelect?: (selected: T[]) => void;
  actions?: (row: T) => React.ReactNode;
}

export default function AdminTable<T extends { id: string | number }>({
  columns,
  data,
  pageSize = 10,
  loading = false,
  onRowSelect,
  actions,
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const filtered = data.filter((row) => {
    return columns.some((col) => {
      const value = col.accessor ? row[col.accessor] : "";
      return (
        typeof value === "string" &&
        value.toLowerCase().includes(search.toLowerCase())
      );
    });
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const allSelected =
    paginated.length > 0 &&
    paginated.every((row) => selectedIds.includes(row.id));

  const handleSelectAll = () => {
    if (allSelected) {
      const newSelected = selectedIds.filter(
        (id) => !paginated.some((row) => row.id === id)
      );
      setSelectedIds(newSelected);
      onRowSelect &&
        onRowSelect(data.filter((row) => newSelected.includes(row.id)));
    } else {
      const newSelected = [
        ...selectedIds,
        ...paginated
          .filter((row) => !selectedIds.includes(row.id))
          .map((row) => row.id),
      ];
      setSelectedIds(newSelected);
      onRowSelect &&
        onRowSelect(data.filter((row) => newSelected.includes(row.id)));
    }
  };

  const handleSelectRow = (id: string | number) => {
    let newSelected: (string | number)[];
    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((sid) => sid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }
    setSelectedIds(newSelected);
    onRowSelect &&
      onRowSelect(data.filter((row) => newSelected.includes(row.id)));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Table
        </h3>
        <form className="flex-1 max-w-xs">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                  fill=""
                />
              </svg>
            </span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-[42px] h-[42px]"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </form>
      </div>
      <div className="custom-scrollbar max-w-full overflow-x-auto overflow-y-visible px-5 sm:px-6">
        <Table>
          <TableHeader className="border-y border-gray-100 py-3 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 pr-5 font-normal whitespace-nowrap sm:pr-6 align-middle"
              >
                <div className="flex items-center justify-center h-full">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="align-middle w-4 h-4 accent-brand-500"
                  />
                </div>
              </TableCell>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  isHeader
                  className={
                    col.className ||
                    "px-5 py-3 font-normal whitespace-nowrap sm:px-6 align-middle"
                  }
                >
                  <div className="flex items-center">
                    <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                      {col.header}
                    </p>
                  </div>
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  isHeader
                  className="px-5 py-3 font-normal whitespace-nowrap sm:px-6 align-middle"
                >
                  <div className="flex items-center">
                    <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                      Actions
                    </p>
                  </div>
                </TableCell>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((row, rowIdx) => (
              <TableRow
                key={row.id}
                className={`$${
                  selectedIds.includes(row.id)
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : rowIdx % 2 === 0
                    ? "bg-white dark:bg-white/[0.01]"
                    : "bg-gray-50 dark:bg-white/[0.03]"
                }`}
              >
                <TableCell className="py-3 pr-5 whitespace-nowrap sm:pr-5 align-middle">
                  <div className="flex items-center justify-center h-full">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      aria-label={`Select row ${row.id}`}
                      className="align-middle w-4 h-4 accent-brand-500"
                    />
                  </div>
                </TableCell>
                {columns.map((col, idx) => (
                  <TableCell
                    key={idx}
                    className={
                      col.className ||
                      "px-5 py-3 whitespace-nowrap sm:px-6 align-middle"
                    }
                  >
                    <span className="text-theme-sm text-gray-700 dark:text-gray-400">
                      {col.render
                        ? col.render(row)
                        : String(row[col.accessor as keyof T] ?? "")}
                    </span>
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="px-5 py-3 whitespace-nowrap sm:px-6 align-middle">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <button
            className="text-theme-sm shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:px-3.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 9.99715C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 9.99715C2.58301 9.99766 2.58301 9.99817 2.58301 9.99868Z"
                fill=""
              />
            </svg>
            <span className="hidden sm:inline"> Previous </span>
          </button>
          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i}>
                <button
                  className={`$${
                    page === i + 1
                      ? "bg-brand-500/[0.08] text-brand-500"
                      : "text-gray-700 dark:text-gray-400"
                  } text-theme-sm flex h-10 w-10 items-center justify-center rounded-lg font-medium hover:bg-brand-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="text-theme-sm shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:px-3.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <span className="hidden sm:inline"> Next </span>
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
