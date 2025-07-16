"use client";
import React, { useEffect, useState } from "react";
import { AdminLog } from "@/libs/models/adminLog"; // For type only, not for fetching
import { User } from "@/libs/models/users"; // For type only
import { format } from "date-fns";

// Dummy fetch function (replace with real API call)
async function fetchLogs() {
  try {
    const res = await fetch("/api/admin/logs");
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch (e) {
    return [];
  }
}

const columns = [
  { key: "admin", label: "Admin" },
  { key: "action", label: "Action" },
  { key: "entity", label: "Entity" },
  { key: "entityId", label: "Entity ID" },
  { key: "details", label: "Details" },
  { key: "timestamp", label: "Timestamp" },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(logs);
    } else {
      setFiltered(
        logs.filter(
          (log) =>
            log.adminName?.toLowerCase().includes(search.toLowerCase()) ||
            log.action?.toLowerCase().includes(search.toLowerCase()) ||
            log.entity?.toLowerCase().includes(search.toLowerCase()) ||
            log.entityId
              ?.toString()
              .toLowerCase()
              .includes(search.toLowerCase())
        )
      );
    }
  }, [search, logs]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Activity Logs</h1>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Add more filters here if needed */}
      </div>
      <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No logs found.
                </td>
              </tr>
            ) : (
              filtered.map((log, idx) => (
                <tr
                  key={log._id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {log.adminName || log.admin || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {log.entity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.entityId || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300 max-w-xs">
                    {typeof log.details === "object"
                      ? JSON.stringify(log.details, null, 2)
                      : log.details || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.timestamp
                      ? format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
