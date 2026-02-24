import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  useGetDashboardLogsQuery,
  useGetDashboardStatsQuery,
} from "../store/apiSlice";

const Dashboard = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [queryDates, setQueryDates] = useState({ from: dateFrom, to: dateTo });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isFetching: logsFetching } =
    useGetDashboardLogsQuery(queryDates);
  const { data: stats = { pieData: [], barData: [] } } =
    useGetDashboardStatsQuery();

  const handleApply = () => setQueryDates({ from: dateFrom, to: dateTo });

  const filteredLogs = logs.filter((log) =>
    Object.values(log).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const totals = filteredLogs.reduce(
    (acc, log) => ({
      test_sent: acc.test_sent + (log.test_sent || 0),
      bulk_test_sent: acc.bulk_test_sent + (log.bulk_test_sent || 0),
      bulk_test: acc.bulk_test + (log.bulk_test || 0),
      error: acc.error + (log.error || 0),
    }),
    { test_sent: 0, bulk_test_sent: 0, bulk_test: 0, error: 0 },
  );

  return (
    <div className="dashboard-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
          SENDING REPORT
        </h1>
        <div className="flex items-center gap-2 bg-dark-2 p-1 rounded">
          <span className="text-gray-400 text-10px font-bold ml-2 uppercase">
            From:
          </span>
          <input
            type="date"
            className="bg-white text-black text-xs px-2 py-0.5 rounded w-32 outline-none font-bold"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-gray-400 text-10px font-bold uppercase">
            To:
          </span>
          <input
            type="date"
            className="bg-white text-black text-xs px-2 py-0.5 rounded w-32 outline-none font-bold"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <button
            onClick={handleApply}
            className="bg-primary text-white text-xs font-bold px-4 py-1 rounded ml-2 shadow-lg active:scale-95 transition-all flex items-center gap-1"
          >
            <RefreshCw
              size={12}
              className={logsFetching ? "animate-spin" : ""}
            />
            Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6 mb-8">
        <div className="dash-card">
          <h3 className="text-black font-bold text-xs mb-4 text-center">
            Bulk Sent Analysis by SMTP
          </h3>
          <div className="h-64 flex items-center justify-center border border-gray-300 rounded bg-gray-50 p-4">
            {stats.pieData.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {stats.pieData.map((d: any, i: number) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-primary rounded-t"
                      style={{
                        height: `${Math.min(d.count / 100, 100)}%`,
                        minHeight: "10px",
                      }}
                    ></div>
                    <span className="text-[8px] text-gray-600 truncate w-12 text-center">
                      {d._id}
                    </span>
                    <span className="text-[8px] font-bold">{d.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 italic text-xs">
                No data available
              </div>
            )}
          </div>
        </div>
        <div className="dash-card">
          <h3 className="text-black font-bold text-xs mb-4 text-center">
            Bulk Sent by SMTP (Cylinder)
          </h3>
          <div className="h-64 flex items-end justify-around p-4 bg-gray-50 border border-gray-300 rounded">
            {stats.barData.length > 0 ? (
              stats.barData.map((d: any, i: number) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-600 w-8 shadow-md rounded-t relative group"
                    style={{
                      height: `${Math.min(d.sent / 100, 100)}%`,
                      minHeight: "20px",
                    }}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] p-1 rounded">
                      {d.sent}
                    </div>
                  </div>
                  <span className="text-[9px] mt-2 font-bold rotate-45 origin-left truncate w-12">
                    {d._id}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 italic text-xs">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold uppercase tracking-widest">
            Search:
          </span>
          <input
            type="text"
            className="bg-white text-black text-xs px-2 py-1 rounded outline-none w-48 font-bold border-2 border-primary"
            placeholder="Filter logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div
        className="overflow-x-auto border border-gray-800 rounded relative shadow-2xl"
        style={{ maxHeight: "600px", overflowY: "auto" }}
      >
        <table className="legacy-table">
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
            {filteredLogs.length > 0 ? (
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
                  <td className="font-bold text-cyan-400">{row.test_sent}</td>
                  <td className="font-bold text-cyan-400">
                    {row.bulk_test_sent}
                  </td>
                  <td className="font-bold text-cyan-400">{row.bulk_test}</td>
                  <td className="font-bold text-red-400">{row.error}</td>
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
          <tfoot
            className="sticky bottom-0 z-10 bg-primary font-bold text-white uppercase tracking-tighter"
            style={{ fontSize: "10px" }}
          >
            <tr className="bg-primary border-t-2 border-white">
              <td colSpan={8} className="text-right pr-4">
                Totals:
              </td>
              <td className="bg-blue-700">
                {totals.test_sent.toLocaleString()}
              </td>
              <td className="bg-blue-700">
                {totals.bulk_test_sent.toLocaleString()}
              </td>
              <td className="bg-blue-700">
                {totals.bulk_test.toLocaleString()}
              </td>
              <td className="bg-blue-800">{totals.error.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
