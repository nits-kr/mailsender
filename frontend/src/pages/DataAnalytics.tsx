import React, { useState, useEffect, useRef } from "react";
import {
  useGetOffersQuery,
  useGetDataAnalyticsMutation,
} from "../store/apiSlice";
import {
  BarChart4,
  Terminal,
  Loader2,
  RefreshCw,
  X,
  CheckSquare,
  Square,
  Search,
  Activity,
  Target,
} from "lucide-react";
import "./DataAnalytics.css";

const TagSelect = ({
  label,
  options,
  selected,
  onToggle,
  onSelectAll,
  disabled,
  placeholder,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAllSelected =
    options.length > 0 && selected.length === options.length;

  return (
    <div className={`value-control ${disabled ? "disabled-control" : ""}`}>
      <div
        className="check-icon-wrapper"
        onClick={() => onSelectAll(!isAllSelected)}
      >
        {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
      </div>

      <div className="tag-container-inner" ref={containerRef}>
        <div
          className="tags-input-container"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selected.length === 0 && (
            <span className="text-gray-400 text-[11px]">{placeholder}</span>
          )}
          {selected.map((val: string) => (
            <div key={val} className="tag-item">
              {val}
              <span
                className="tag-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(val);
                }}
              >
                <X size={10} />
              </span>
            </div>
          ))}
          <div className="search-icon-wrapper">
            <Search size={12} />
          </div>
        </div>

        {isOpen && options.length > 0 && (
          <div className="dropdown-portal">
            {options.map((opt: any) => {
              const val = typeof opt === "string" ? opt : opt.val;
              const display = typeof opt === "string" ? opt : opt.label;
              return (
                <div
                  key={val}
                  className={`dropdown-item ${selected.includes(val) ? "selected" : ""}`}
                  onClick={() => onToggle(val)}
                >
                  {display}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const DataAnalytics = () => {
  const [filters, setFilters] = useState<any>({
    type: ["Open"],
    offer: [],
    offerId: [],
    isp: [],
    timeframe: [],
  });
  const [result, setResult] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Analysis Engine Ready.",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const { data: offersData, isLoading: isFetchingOffers } = useGetOffersQuery();
  const [getAnalytics, { isLoading: isAnalyzing }] =
    useGetDataAnalyticsMutation();

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [
      ...prev.slice(-10),
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  const handleToggle = (key: string, value: string) => {
    setFilters((prev: any) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSelectAll = (key: string, options: any[]) => {
    const optionValues = options.map((o) =>
      typeof o === "string" ? o : o.val,
    );
    setFilters((prev: any) => ({
      ...prev,
      [key]: prev[key].length === optionValues.length ? [] : optionValues,
    }));
  };

  const handleLoadData = async () => {
    addLog(`INIT: Querying engagement for ${filters.type.join(", ")}...`);
    try {
      const payload = {
        ...filters,
        offer: filters.offer.join(","),
        offerId: filters.offerId.join(","),
        isp: filters.isp.join(","),
        timeframe: filters.timeframe.join(","),
      };
      const res = await getAnalytics(payload).unwrap();
      setResult(res);
      addLog(`SUCCESS: Found ${res.count.toLocaleString()} unique records.`);
    } catch (error: any) {
      addLog(`ERROR: Pipeline failure - ${error?.data?.message || "Timeout"}`);
    }
  };

  const typeOptions = [
    { val: "Open", label: "OPENER" },
    { val: "Subscribe", label: "CLICKER" },
  ];

  const offerOptions = Array.isArray(offersData)
    ? offersData.map((o) => ({
        val: o._id,
        label: `${o.offer_name.substring(0, 20)}...`,
      }))
    : [];

  const ispOptions = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "aol.com",
    "hotmail.com",
    "icloud.com",
  ];
  const timeframeOptions = ["2026-02", "2026-01", "2025-12", "Lifetime"];

  return (
    <div className="analytics-wrapper">
      <div className="analytics-container">
        <h2 className="analytics-title">Analysis Portal</h2>

        <div className="analysis-table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th style={{ width: "250px" }}>Options</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="option-name">Type</td>
                <td>
                  <TagSelect
                    options={typeOptions}
                    selected={filters.type}
                    onToggle={(v: string) => handleToggle("type", v)}
                    onSelectAll={() => handleSelectAll("type", typeOptions)}
                    placeholder="Choose Activity Type..."
                  />
                </td>
              </tr>
              <tr>
                <td className="option-name">Offer</td>
                <td>
                  <TagSelect
                    options={offerOptions}
                    selected={filters.offer}
                    onToggle={(v: string) => handleToggle("offer", v)}
                    onSelectAll={() => handleSelectAll("offer", offerOptions)}
                    disabled={filters.type.length === 0}
                    placeholder="Select Target Offers..."
                  />
                </td>
              </tr>
              <tr>
                <td className="option-name">OfferID</td>
                <td>
                  <TagSelect
                    options={["OID_001", "OID_002", "OID_003"]} // Mocked sub-ids
                    selected={filters.offerId}
                    onToggle={(v: string) => handleToggle("offerId", v)}
                    onSelectAll={() =>
                      handleSelectAll("offerId", [
                        "OID_001",
                        "OID_002",
                        "OID_003",
                      ])
                    }
                    disabled={filters.offer.length === 0}
                    placeholder="Select Specific Tags..."
                  />
                </td>
              </tr>
              <tr>
                <td className="option-name">ISP</td>
                <td>
                  <TagSelect
                    options={ispOptions}
                    selected={filters.isp}
                    onToggle={(v: string) => handleToggle("isp", v)}
                    onSelectAll={() => handleSelectAll("isp", ispOptions)}
                    disabled={filters.offerId.length === 0}
                    placeholder="Select Mail Services..."
                  />
                </td>
              </tr>
              <tr>
                <td className="option-name">TimeFrame</td>
                <td>
                  <TagSelect
                    options={timeframeOptions}
                    selected={filters.timeframe}
                    onToggle={(v: string) => handleToggle("timeframe", v)}
                    onSelectAll={() =>
                      handleSelectAll("timeframe", timeframeOptions)
                    }
                    disabled={filters.isp.length === 0}
                    placeholder="Choose Analysis Period..."
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="action-area">
            <button
              className="load-btn"
              onClick={handleLoadData}
              disabled={isAnalyzing || filters.timeframe.length === 0}
            >
              {isAnalyzing ? "Processing..." : "Load Data"}
            </button>
          </div>

          <div className="console-section">
            <div className="console-header">
              <Terminal size={12} /> Diagnostic Stream
            </div>
            <div className="console-body">
              {consoleLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className="diagnostics-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>FILENAME</th>
                  <th>TOTAL COUNT</th>
                  <th>AFTER SUPPRESS UNIQ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{Math.random().toString(36).substring(7)}.txt</td>
                  <td>{result.count.toLocaleString()}</td>
                  <td className="highlight-count">
                    {result.count.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="diagnostic-text">
              * Active Filter: {filters.isp.join(", ") || "GLOBAL"} | timeframe:{" "}
              {filters.timeframe.join(", ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalytics;
