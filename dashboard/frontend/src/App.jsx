import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topPaths, setTopPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, logsRes, topPathsRes] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/stats/logs`),
          axios.get(`${API}/stats/top-paths`),
        ]);
        setStats(statsRes.data.data);
        setLogs(logsRes.data.data);
        setTopPaths(topPathsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );

  const maxCount = topPaths[0]?.count || 1;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex items-center gap-4 mb-8">
        <svg viewBox="0 0 80 90" className="w-10 h-10">
          <path
            d="M40 0 L72 14 L72 46 Q72 72 40 84 Q8 72 8 46 L8 14 Z"
            fill="#1e293b"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          <polyline
            points="18,42 26,42 30,28 36,56 42,36 48,48 54,48 58,42 66,42"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <h1 className="text-2xl font-semibold text-white">
            DevPulse<span className="text-blue-500">ZA</span>
          </h1>
          <p className="text-xs text-slate-400 tracking-widest uppercase">
            Gateway Admin
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Requests" value={stats.total_requests} />
        <StatCard
          label="Blocked"
          value={stats.total_blocked}
          color="text-red-400"
        />
        <StatCard label="Avg Response" value={`${stats.avg_duration}ms`} />
        <StatCard
          label="Today"
          value={stats.requests_today}
          color="text-blue-400"
        />
      </div>

      {/* TOP PATHS */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Top Paths
        </h2>
        <div className="space-y-3">
          {topPaths.map((p) => (
            <div key={p.path} className="flex items-center gap-4">
              <span className="text-sm text-gray-300 w-48 truncate">
                {p.path}
              </span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(p.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8 text-right">
                {p.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Recent Logs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-3 pr-4">Method</th>
                <th className="pb-3 pr-4">Path</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Duration</th>
                <th className="pb-3 pr-4">IP</th>
                <th className="pb-3 pr-4">Blocked</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log, i) => (
                <tr key={i} className={log.blocked ? "bg-red-950/30" : ""}>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${methodColor(log.method)}`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{log.path}</td>
                  <td className="py-3 pr-4">
                    <span className={statusColor(log.status_code)}>
                      {log.status_code}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {log.duration_ms}ms
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{log.ip}</td>
                  <td className="py-3 pr-4">
                    {log.blocked ? (
                      <span className="text-red-400">Yes</span>
                    ) : (
                      <span className="text-green-400">No</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function methodColor(method) {
  const colors = {
    GET: "bg-blue-900 text-blue-300",
    POST: "bg-green-900 text-green-300",
    PUT: "bg-yellow-900 text-yellow-300",
    DELETE: "bg-red-900 text-red-300",
  };
  return colors[method] || "bg-gray-800 text-gray-300";
}

function statusColor(status) {
  if (status >= 500) return "text-red-400";
  if (status >= 400) return "text-yellow-400";
  if (status >= 300) return "text-blue-400";
  return "text-green-400";
}
