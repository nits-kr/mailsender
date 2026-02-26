import React, { useState } from "react";
import {
  useGetOffersQuery,
  useGetDataAnalyticsMutation,
} from "../store/apiSlice";

const DataAnalytics = () => {
  const [filters, setFilters] = useState({
    type: ["Open"],
    offer: "",
    offerId: "",
    isp: "",
    timeframe: "",
  });
  const [result, setResult] = useState<any>(null);

  const { data: offers } = useGetOffersQuery();
  const [getAnalytics, { isLoading: loading }] = useGetDataAnalyticsMutation();

  const handleLoadData = async () => {
    try {
      const res = await getAnalytics(filters).unwrap();
      setResult(res);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-black p-4"
      style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}
    >
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter underline">
          ANALYSIS PORTAL
        </h2>

        <div className="border border-gray-400 rounded-sm overflow-hidden bg-white shadow-sm mb-6">
          <table className="w-full border-collapse text-[12px] font-bold">
            <thead className="bg-gray-50 border-b border-gray-400">
              <tr>
                <th className="px-4 py-2 text-left border-r border-gray-400 w-1/3 italic">
                  Options
                </th>
                <th className="px-4 py-2 text-left italic">Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              <tr>
                <td className="px-4 py-3 border-r border-gray-300">
                  Activity Type
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.type.includes("Open")}
                        onChange={() => {}}
                      />{" "}
                      OPENERS
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.type.includes("Subscribe")}
                        onChange={() => {}}
                      />{" "}
                      CLICKERS
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-r border-gray-300">
                  Target Offer
                </td>
                <td className="px-4 py-3">
                  <select
                    className="border border-gray-400 px-1 py-0.5 w-64 outline-none font-mono bg-white"
                    value={filters.offer}
                    onChange={(e) =>
                      setFilters({ ...filters, offer: e.target.value })
                    }
                  >
                    <option value="">Select Offer Category</option>
                    {Array.isArray(offers) &&
                      offers.map((o) => (
                        <option key={o._id} value={o.offer_name}>
                          {o.offer_name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-r border-gray-300">Mail ISP</td>
                <td className="px-4 py-3">
                  <select
                    className="border border-gray-400 px-1 py-0.5 w-64 outline-none font-mono bg-white"
                    value={filters.isp}
                    onChange={(e) =>
                      setFilters({ ...filters, isp: e.target.value })
                    }
                  >
                    <option value="">Choose Mail ISP</option>
                    <option value="Gmail">Gmail</option>
                    <option value="Yahoo">Yahoo</option>
                    <option value="Outlook">Outlook</option>
                    <option value="AOL">AOL</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-r border-gray-300">Offer Id</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="border border-gray-400 px-2 py-0.5 w-64 outline-none font-mono"
                    value={filters.offerId}
                    onChange={(e) =>
                      setFilters({ ...filters, offerId: e.target.value })
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-r border-gray-300">
                  TimeFrame
                </td>
                <td className="px-4 py-3">
                  <select
                    className="border border-gray-400 px-1 py-0.5 w-64 outline-none font-mono bg-white"
                    value={filters.timeframe}
                    onChange={(e) =>
                      setFilters({ ...filters, timeframe: e.target.value })
                    }
                  >
                    <option value="">Choose TimeFrame</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">Lifetime</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleLoadData}
            disabled={loading}
            className="bg-gray-100 border border-gray-500 px-8 py-1 font-bold shadow-sm hover:bg-gray-200 active:bg-gray-300 transition-colors uppercase text-[11px]"
          >
            {loading ? "Analyzing..." : "Load Analytics"}
          </button>
        </div>

        {result && (
          <div className="border border-gray-400 p-4 font-mono text-sm shadow-sm">
            <p className="text-xl font-bold uppercase tracking-widest text-center">
              TOTAL FOUND ={" "}
              <span className="text-blue-600">
                {result.count.toLocaleString()}
              </span>
            </p>
            <div className="mt-4 text-[10px] text-gray-500 text-center uppercase tracking-widest">
              * Selected Criteria : {filters.isp || "ALL ISP"} |{" "}
              {filters.timeframe || "ALL TIME"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalytics;
