import React, { useState } from "react";
import {
  RefreshCw,
  Calendar,
  Filter,
  Search,
  Activity,
  BarChart3,
  TrendingUp,
  LogOut,
} from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";
import {
  useGetDashboardLogsQuery,
  useGetDashboardStatsQuery,
} from "../store/apiSlice";
import "./Dashboard.css";

const Dashboard = () => {
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [queryDates, setQueryDates] = useState({ from: dateFrom, to: dateTo });
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: logs = [],
    isFetching: logsFetching,
    refetch: refetchLogs,
  } = useGetDashboardLogsQuery(queryDates);

  const {
    data: stats = { pieData: [], barData: [] },
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery();

  const handleApply = () => {
    setQueryDates({ from: dateFrom, to: dateTo });
    refetchLogs();
    refetchStats();
  };

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
    <div className="dashboard-container-new">
      <header className="dashboard-header-new">
        <h1>Sending Report</h1>
        <div className="filter-bar-new">
          <div className="filter-item-new">
            <span className="filter-label-new">From</span>
            <input
              type="date"
              className="filter-input-new"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-item-new">
            <span className="filter-label-new">To</span>
            <input
              type="date"
              className="filter-input-new"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button onClick={handleApply} className="btn-sync-new">
            <RefreshCw
              size={16}
              className={logsFetching ? "animate-spin" : ""}
            />
            SYNC REPORT
          </button>
        </div>
      </header>

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 lg-grid-cols-2 gap-8 mb-8"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(45%, 1fr))",
          gap: "24px",
        }}
      >
        {/* Pie Chart */}
        <div className="card-new">
          <h3 className="card-title-new">Bulk Analysis by SMTP</h3>
          {stats.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={(Array.isArray(stats.pieData) ? stats.pieData : []).map(
                    (d: any) => ({ name: d._id, value: d.count }),
                  )}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={100}
                  stroke="#fff"
                  strokeWidth={2}
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
                            "#3b82f6",
                            "#06b6d4",
                            "#f59e0b",
                            "#10b981",
                            "#ef4444",
                            "#8b5cf6",
                            "#ec4899",
                            "#14b8a6",
                          ][i % 8]
                        }
                      />
                    ),
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    border: "1px solid #f1f5f9",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 11,
                    fontWeight: 600,
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-gray-400">
              <Activity size={48} className="opacity-20 mb-4" />
              <div className="italic text-xs">Waiting for data...</div>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card-new">
          <h3 className="card-title-new">Distribution by Server</h3>
          {stats.barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={(Array.isArray(stats.barData) ? stats.barData : []).map(
                  (d: any) => ({ name: d._id, Sent: d.sent }),
                )}
                margin={{ top: 5, right: 10, left: -10, bottom: 45 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="Sent"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-gray-400">
              <BarChart3 size={48} className="opacity-20 mb-4" />
              <div className="italic text-xs">Waiting for data...</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Daily Trend Chart ────────────────────────────────────── */}
      <div className="card-new mb-10">
        <h3 className="card-title-new">Sending Performance Trend</h3>
        {dailyHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={dailyHistory}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sent"
                name="Volume"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSent)"
              />
              <Area
                type="monotone"
                dataKey="errors"
                name="Fails"
                stroke="#ef4444"
                strokeWidth={2}
                fill="transparent"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-gray-400">
            <TrendingUp size={48} className="opacity-20 mb-4" />
            <div className="italic text-sm">
              Insufficient data for current period
            </div>
          </div>
        )}
      </div>

      <div className="logs-card-new">
        <div className="logs-card-header-new">
          <h3 className="logs-title-new">Sending Execution Logs</h3>
          <div className="quick-filter-new">
            <span className="quick-filter-label">Quick Filter:</span>
            <input
              type="text"
              className="quick-filter-input"
              placeholder="Search log entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="text-gray-400" />
          </div>
        </div>

        <div className="table-wrapper-new">
          <table className="table-new">
            <thead>
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
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 12 }).map((_, j) => (
                      <td key={j}>
                        <div
                          style={{
                            height: "12px",
                            background: "#f1f5f9",
                            borderRadius: "4px",
                            width: "80%",
                          }}
                        ></div>
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
                    <td
                      title={row.from}
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.from}
                    </td>
                    <td className="val-green">{row.test_sent}</td>
                    <td className="val-green">{row.bulk_test_sent}</td>
                    <td className="val-green">{row.bulk_test}</td>
                    <td className="val-red">{row.error}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={12}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                      fontStyle: "italic",
                    }}
                  >
                    No sending logs found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="table-footer-new">
              <tr>
                <td colSpan={8} className="total-label">
                  Totals:
                </td>
                <td className="total-cell">
                  {totals.test_sent.toLocaleString()}
                </td>
                <td className="total-cell">
                  {totals.bulk_test_sent.toLocaleString()}
                </td>
                <td className="total-cell">
                  {totals.bulk_test.toLocaleString()}
                </td>
                <td className="total-cell-red">
                  {totals.error.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
