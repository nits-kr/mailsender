import React, { useState } from "react";
import { RefreshCw, Calendar, Filter } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  useGetDashboardLogsQuery,
  useGetDashboardStatsQuery,
} from "../store/apiSlice";

const Dashboard = () => {
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [queryDates, setQueryDates] = useState({ from: dateFrom, to: dateTo });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isFetching: logsFetching } =
    useGetDashboardLogsQuery(queryDates);
  const { data: stats = { pieData: [], barData: [] } } =
    useGetDashboardStatsQuery();

  const handleApply = () => setQueryDates({ from: dateFrom, to: dateTo });

  const filteredLogs = Array.isArray(logs)
    ? logs.filter((log) =>
        Object.values(log).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : [];

  const totals = filteredLogs.reduce(
    (acc, log) => ({
      test_sent: acc.test_sent + (log.test_sent || 0),
      bulk_test_sent: acc.bulk_test_sent + (log.bulk_test_sent || 0),
      bulk_test: acc.bulk_test + (log.bulk_test || 0),
      error: acc.error + (log.error || 0),
    }),
    { test_sent: 0, bulk_test_sent: 0, bulk_test: 0, error: 0 },
  );

  // Group logs by date for the Line Chart
  const dailyHistory = filteredLogs
    .reduce((acc: any[], log) => {
      const date = new Date(log.sent_on).toLocaleDateString();
      let existing = acc.find((d) => d.date === date);
      if (!existing) {
        existing = { date, sent: 0, errors: 0 };
        acc.push(existing);
      }
      existing.sent += (log.test_sent || 0) + (log.bulk_test || 0);
      existing.errors += log.error || 0;
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="dashboard-container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl premium-title uppercase tracking-tighter">
          Sending Report
        </h1>
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 group ml-2">
            <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">
              From
            </span>
            <input
              type="date"
              className="bg-dark-3 text-white text-xs px-3 py-1.5 rounded-lg outline-none font-bold border border-white/5 focus:border-indigo-500 transition-all w-36 cursor-pointer"
              style={{ colorScheme: "dark" }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 group">
            <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">
              To
            </span>
            <input
              type="date"
              className="bg-dark-3 text-white text-xs px-3 py-1.5 rounded-lg outline-none font-bold border border-white/5 focus:border-indigo-500 transition-all w-36 cursor-pointer"
              style={{ colorScheme: "dark" }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <button
            onClick={handleApply}
            className="bg-indigo-600 hover:bg-indigo-500 text-dark text-xs font-black px-6 py-2 rounded-lg ml-1 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw
              size={13}
              className={logsFetching ? "animate-spin" : ""}
            />
            SYNC REPORT
          </button>
        </div>
      </div>

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-8 mb-10">
        {/* Pie Chart – Bulk Analysis by SMTP */}
        <div className="dash-card">
          <h3 className="text-gray-400 font-extrabold text-[10px] mb-6 text-center uppercase tracking-[0.2em] opacity-80">
            Bulk Analysis by SMTP
          </h3>
          {stats.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={(Array.isArray(stats.pieData) ? stats.pieData : []).map(
                    (d: any) => ({
                      name: d._id,
                      value: d.count,
                    }),
                  )}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={100}
                  stroke="none"
                  minAngle={15}
                  label={({ name, percent }) =>
                    (percent ?? 0) > 0.05
                      ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {(Array.isArray(stats.pieData) ? stats.pieData : []).map(
                    (_: any, i: number) => (
                      <Cell
                        key={i}
                        fill={
                          [
                            "#6366f1",
                            "#22d3ee",
                            "#f59e0b",
                            "#10b981",
                            "#ef4444",
                            "#a855f7",
                            "#ec4899",
                            "#14b8a6",
                          ][i % 8]
                        }
                      />
                    ),
                  )}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [
                    value.toLocaleString(),
                    "Emails Sent",
                  ]}
                  contentStyle={{
                    backgroundColor: "#1e2125",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                    fontSize: 11,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-gray-500 opacity-50">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 mb-3" />
              <div className="italic text-xs">Waiting for data...</div>
            </div>
          )}
        </div>

        {/* Bar Chart – Distribution by Server */}
        <div className="dash-card">
          <h3 className="text-gray-400 font-extrabold text-[10px] mb-6 text-center uppercase tracking-[0.2em] opacity-80">
            Distribution by Server
          </h3>
          {stats.barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={(Array.isArray(stats.barData) ? stats.barData : []).map(
                  (d: any) => ({
                    name: d._id,
                    Sent: d.sent,
                  }),
                )}
                margin={{ top: 5, right: 10, left: -10, bottom: 45 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(value: any) => [value.toLocaleString(), "Volume"]}
                  contentStyle={{
                    backgroundColor: "#1e2125",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: 11,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="Sent"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-gray-500 opacity-50">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 mb-3" />
              <div className="italic text-xs">Waiting for data...</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Daily Trend Chart ────────────────────────────────────── */}
      <div className="dash-card mb-10 overflow-visible">
        <h3 className="text-gray-400 font-extrabold text-[10px] mb-8 text-center uppercase tracking-[0.2em] opacity-80">
          Sending Performance Trend
        </h3>
        {dailyHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={dailyHistory}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e2125",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "14px",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                  fontSize: 12,
                  padding: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sent"
                name="Volume"
                stroke="#818cf8"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorSent)"
                animationBegin={200}
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="errors"
                name="Fails"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorErr)"
                strokeDasharray="5 5"
                animationBegin={400}
                animationDuration={1800}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-gray-500 opacity-50">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 mb-4 animate-pulse" />
            <div className="italic text-sm tracking-wide">
              Insufficient behavioral data for current period
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6 mt-4">
        <h3 className="text-gray-400 font-extrabold text-[12.5px] uppercase tracking-[0.2em] opacity-80">
          Sending Execution Logs
        </h3>
        <div className="flex items-center gap-3 bg-white/5 p-1 px-4 rounded-full border border-white/5 shadow-inner">
          <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest pt-0.5">
            Quick Filter:
          </span>
          <input
            type="text"
            className="bg-transparent text-white text-xs py-1.5 outline-none w-56 font-bold placeholder:text-gray-600"
            placeholder="Search log entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="modern-table-container">
        <table className="modern-table">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>SENT ON</th>
              <th>MAILER</th>
              <th>TEMPLATE ID</th>
              <th>INTERFACE</th>
              <th>SERVER</th>
              <th>OFFER ID</th>
              <th>DOMAIN</th>
              <th>FROM</th>
              <th>TEST SENT</th>
              <th>BULK TEST SENT</th>
              <th>BULK TEST</th>
              <th>ERROR</th>
            </tr>
          </thead>
          <tbody>
            {logsFetching && filteredLogs.length === 0 ? (
              // Skeleton Loading
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`dash-sk-${i}`}>
                  {Array.from({ length: 12 }).map((_, j) => (
                    <td key={j}>
                      <div
                        className="skeleton-cell sk-cell-inner"
                        style={{ width: j === 7 ? "120px" : "50px" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((row, i) => (
                <tr key={i}>
                  <td>{new Date(row.sent_on).toLocaleDateString()}</td>
                  <td>{row.mailer}</td>
                  <td>{row.template_id}</td>
                  <td>{row.interface}</td>
                  <td>{row.server}</td>
                  <td>{row.offer_id}</td>
                  <td>{row.domain}</td>
                  <td className="truncate max-w-[150px]" title={row.from}>
                    {row.from}
                  </td>
                  <td className="highlight-green">{row.test_sent}</td>
                  <td className="highlight-green">{row.bulk_test_sent}</td>
                  <td className="highlight-green">{row.bulk_test}</td>
                  <td className="highlight-red">{row.error}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-10 text-gray-500 italic">
                  No sending logs found matching criteria
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="sticky bottom-0 z-10 uppercase tracking-tighter">
            <tr>
              <td colSpan={8} className="text-right pr-4">
                Totals:
              </td>
              <td className="bg-indigo-600/20">
                {totals.test_sent.toLocaleString()}
              </td>
              <td className="bg-indigo-600/20">
                {totals.bulk_test_sent.toLocaleString()}
              </td>
              <td className="bg-indigo-600/20">
                {totals.bulk_test.toLocaleString()}
              </td>
              <td className="bg-red-600/20">{totals.error.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
