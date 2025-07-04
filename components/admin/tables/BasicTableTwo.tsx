"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Pagination from "./Pagination";
import { Modal } from "../ui/modal";
import { useModal } from "@/adminHooks/useModal";
import Input from "../form/input/InputField";

interface Transaction {
  id: number;
  name: string;
  date: string;
  price: string;
  category: string;
  status: "Success" | "Pending" | "Failed";
  brand: string;
}

const transactions: Transaction[] = [
  {
    id: 1,
    name: "Bought PYPL",
    date: "Nov 23, 01:00 PM",
    price: "$2,567.88",
    category: "Finance",
    status: "Success",
    brand: "/images/brand/brand-08.svg",
  },
  {
    id: 2,
    name: "Bought AAPL",
    date: "Nov 22, 09:00 PM",
    price: "$2,567.88",
    category: "Technology",
    status: "Pending",
    brand: "/images/brand/brand-07.svg",
  },
  {
    id: 3,
    name: "Sell KKST",
    date: "Oct 12, 03:54 PM",
    price: "$6,754.99",
    category: "Finance",
    status: "Success",
    brand: "/images/brand/brand-15.svg",
  },
  {
    id: 4,
    name: "Bought FB",
    date: "Sep 09, 02:00 AM",
    price: "$1,445.41",
    category: "Social mendia",
    status: "Success",
    brand: "/images/brand/brand-02.svg",
  },
  {
    id: 5,
    name: "Sell AMZN",
    date: "Feb 35, 08:00 PM",
    price: "$5,698.55",
    category: "E-commerce",
    status: "Failed",
    brand: "/images/brand/brand-10.svg",
  },
];

const statusColor = {
  Success: "success",
  Pending: "warning",
  Failed: "error",
};

const PAGE_SIZE = 3;

export default function BasicTableTwo() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalContent, setModalContent] = useState<Transaction | null>(null);

  const filtered = transactions.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleViewMore = (transaction: Transaction) => {
    setModalContent(transaction);
    openModal();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Latest Transactions
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
                className="py-3 pr-5 font-normal whitespace-nowrap sm:pr-6"
              >
                <div className="flex items-center">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-normal whitespace-nowrap sm:px-6"
              >
                <div className="flex items-center">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Date
                  </p>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-normal whitespace-nowrap sm:px-6"
              >
                <div className="flex items-center">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Price
                  </p>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-normal whitespace-nowrap sm:px-6"
              >
                <div className="flex items-center">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-normal whitespace-nowrap sm:px-6"
              >
                <div className="flex items-center">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-normal whitespace-nowrap sm:px-6"
              >
                <div className="flex items-center">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    asdf
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="py-3 pr-5 whitespace-nowrap sm:pr-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8">
                      <Image src={t.brand} alt="brand" width={32} height={32} />
                    </div>
                    <span className="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
                      {t.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap sm:px-6">
                  <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                    {t.date}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap sm:px-6">
                  <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                    {t.price}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap sm:px-6">
                  <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                    {t.category}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap sm:px-6">
                  <Badge size="sm">{t.status}</Badge>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap sm:px-6">
                  <div className="flex items-center justify-center relative">
                    <button
                      className="dropdown-toggle text-gray-500 dark:text-gray-400"
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === t.id ? null : t.id)
                      }
                      aria-label="Actions"
                      type="button"
                    >
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                          fill=""
                        />
                      </svg>
                    </button>
                    <Dropdown
                      isOpen={dropdownOpen === t.id}
                      onClose={() => setDropdownOpen(null)}
                    >
                      <DropdownItem onClick={() => handleViewMore(t)}>
                        View More
                      </DropdownItem>
                      <DropdownItem onClick={() => alert("Delete action")}>
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </TableCell>
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
        <h4 className="text-lg font-semibold mb-4">Transaction Details</h4>
        {modalContent && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={modalContent.brand}
                alt="brand"
                width={32}
                height={32}
              />
              <span className="font-medium text-gray-800 dark:text-white/90">
                {modalContent.name}
              </span>
            </div>
            <p>Date: {modalContent.date}</p>
            <p>Price: {modalContent.price}</p>
            <p>Category: {modalContent.category}</p>
            <p>
              Status: <Badge size="sm">{modalContent.status}</Badge>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
