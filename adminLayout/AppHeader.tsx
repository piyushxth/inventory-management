"use client";

import { useSidebar } from "@/adminContext/SidebarContext";
import { ThemeToggleButton } from "@/components/admin/common/ThemeToggleButton";
import NotificationDropdown from "@/components/admin/header/NotificationDropdown";
import UserDropdown from "@/components/admin/header/UserDropdown";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{
    products: any[];
    users: any[];
    orders: any[];
    suggestions?: {
      products: any[];
      users: any[];
      orders: any[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setShowDropdown(!!value);
    setLoading(true);
    setResults(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setLoading(false);
      setResults(null);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({
          products: [],
          users: [],
          orders: [],
          suggestions: { products: [], users: [], orders: [] },
        });
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleResultClick = (type: string, id: string) => {
    setShowDropdown(false);
    setSearch("");
    setResults(null);
    if (type === "product") router.push(`/admin/products/edit/${id}`);
    if (type === "user") router.push(`/admin/users/edit/${id}`);
    if (type === "order") router.push(`/admin/orders/view/${id}`);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {/* Cross Icon */}
          </button>

          <Link href="/" className="lg:hidden">
            <Image
              width={160}
              height={32}
              className="dark:hidden w-[154px] h-auto"
              src="/images/logo/logo.svg"
              alt="Logo"
              priority
            />
            <Image
              width={160}
              height={32}
              className="hidden dark:block"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
              style={{ width: "154px", height: "auto" }}
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <form className="relative">
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
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
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill=""
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(!!search)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800 max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        Searching...
                      </div>
                    ) : (
                      results && (
                        <>
                          {results.products.length === 0 &&
                          results.users.length === 0 &&
                          results.orders.length === 0 ? (
                            <>
                              <div className="p-4 text-center text-gray-500">
                                No results found
                              </div>
                              {results.suggestions && (
                                <div>
                                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                    Suggestions
                                  </div>
                                  {results.suggestions.products.length > 0 && (
                                    <div>
                                      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                        Recent Products
                                      </div>
                                      {results.suggestions.products.map((p) => (
                                        <div
                                          key={p._id}
                                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                          onClick={() =>
                                            handleResultClick("product", p._id)
                                          }
                                        >
                                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                            {p.images && p.images.length > 0 ? (
                                              <img
                                                src={p.images[0]}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <svg
                                                  className="w-4 h-4 text-gray-400"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {p.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {results.suggestions.users.length > 0 && (
                                    <div>
                                      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                        Recent Users
                                      </div>
                                      {results.suggestions.users.map((u) => (
                                        <div
                                          key={u._id}
                                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                          onClick={() =>
                                            handleResultClick("user", u._id)
                                          }
                                        >
                                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                            {u.profilePicture ? (
                                              <img
                                                src={u.profilePicture}
                                                alt={u.name}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <svg
                                                  className="w-4 h-4 text-gray-400"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                              {u.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                              {u.email}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {results.suggestions.orders.length > 0 && (
                                    <div>
                                      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                        Recent Orders
                                      </div>
                                      {results.suggestions.orders.map((o) => (
                                        <div
                                          key={o._id}
                                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                          onClick={() =>
                                            handleResultClick("order", o._id)
                                          }
                                        >
                                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                            {o.items &&
                                            o.items.length > 0 &&
                                            o.items[0].product &&
                                            o.items[0].product.images &&
                                            o.items[0].product.images.length >
                                              0 ? (
                                              <img
                                                src={
                                                  o.items[0].product.images[0]
                                                }
                                                alt="Order product"
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <svg
                                                  className="w-4 h-4 text-gray-400"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex flex-col flex-1">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                              {o.customer?.name
                                                ? `${o.customer.name} — `
                                                : ""}
                                              {o.items && o.items.length > 0
                                                ? o.items.length === 1
                                                  ? o.items[0].product?.name ||
                                                    `Order #${o._id}`
                                                  : `${
                                                      o.items[0].product?.name
                                                    } +${
                                                      o.items.length - 1
                                                    } more`
                                                : `Order #${o._id}`}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                              ${o.totalAmount} •{" "}
                                              {o.items?.length || 0} items •{" "}
                                              {o.orderStatus}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {results.products.length > 0 && (
                                <div>
                                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                    Products
                                  </div>
                                  {results.products.map((p) => (
                                    <div
                                      key={p._id}
                                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                      onClick={() =>
                                        handleResultClick("product", p._id)
                                      }
                                    >
                                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                        {p.images && p.images.length > 0 ? (
                                          <img
                                            src={p.images[0]}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <svg
                                              className="w-4 h-4 text-gray-400"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                          {p.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          ${p.selling_price} •{" "}
                                          {p.availableQuantity} left
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {results.users.length > 0 && (
                                <div>
                                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                    Users
                                  </div>
                                  {results.users.map((u) => (
                                    <div
                                      key={u._id}
                                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                      onClick={() =>
                                        handleResultClick("user", u._id)
                                      }
                                    >
                                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                        {u.profilePicture ? (
                                          <img
                                            src={u.profilePicture}
                                            alt={u.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <svg
                                              className="w-4 h-4 text-gray-400"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                          {u.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {u.email}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {results.orders.length > 0 && (
                                <div>
                                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400">
                                    Orders
                                  </div>
                                  {results.orders.map((o) => (
                                    <div
                                      key={o._id}
                                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                      onClick={() =>
                                        handleResultClick("order", o._id)
                                      }
                                    >
                                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                        {o.items &&
                                        o.items.length > 0 &&
                                        o.items[0].product &&
                                        o.items[0].product.images &&
                                        o.items[0].product.images.length > 0 ? (
                                          <img
                                            src={o.items[0].product.images[0]}
                                            alt="Order product"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <svg
                                              className="w-4 h-4 text-gray-400"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                          {o.customer?.name
                                            ? `${o.customer.name} — `
                                            : ""}
                                          {o.items && o.items.length > 0
                                            ? o.items.length === 1
                                              ? o.items[0].product?.name ||
                                                `Order #${o._id}`
                                              : `${o.items[0].product?.name} +${
                                                  o.items.length - 1
                                                } more`
                                            : `Order #${o._id}`}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          ${o.totalAmount} •{" "}
                                          {o.items?.length || 0} items •{" "}
                                          {o.orderStatus}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )
                    )}
                  </div>
                )}
                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}

            <NotificationDropdown />
            {/* <!-- Notification Menu Area --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
