import React, { useState } from "react";
import { useGetDataCountQuery, useSplitDataMutation } from "../store/apiSlice";

const DataSplit = () => {
  const [filename, setFilename] = useState("");
  const [count, setCount] = useState("50000");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [log, setLog] = useState("");

  const { data: files } = useGetDataCountQuery();
  const [splitData, { isLoading: loading }] = useSplitDataMutation();

  const handleSplit = async () => {
    if (!filename || !count) {
      setStatus({
        type: "error",
        message: "Provide filename and split count!",
      });
      return;
    }

    setStatus({ type: "info", message: "Processing split..." });
    setLog(
      `[INFO] Starting split operation for ${filename}...\n[INFO] Target records per file: ${count}`,
    );

    try {
      const res = await splitData({ filename, count }).unwrap();
      setStatus({ type: "success", message: "Done" });
      setLog(
        (prev) =>
          prev +
          `\n[SUCCESS] File split completed.\n[INFO] Result: ${res.message || "Files generated in data directory."}`,
      );
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error?.data?.message || "Split failed",
      });
      setLog(
        (prev) =>
          prev +
          `\n[ERROR] Split operation failed: ${error?.data?.message || "Unknown error"}`,
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-black p-4"
      style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}
    >
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter">
          DATA SPLIT PORTAL
        </h2>

        <div className="flex flex-col items-center gap-4 text-[12px] font-bold">
          <div className="flex items-center gap-2">
            <label>Filename = </label>
            <select
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="border border-gray-400 px-2 py-0.5 w-64 outline-none font-mono bg-white"
            >
              <option value="">Select File</option>
              {Array.isArray(files) &&
                files.map((f) => (
                  <option key={f.filename} value={f.filename}>
                    {f.filename}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label>Records Per File = </label>
            <input
              type="text"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="border border-gray-400 px-2 py-0.5 w-64 outline-none font-mono"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={handleSplit}
              disabled={loading}
              className={`bg-[#5cb85c] border border-[#4cae4c] text-white px-8 py-1 font-bold shadow-sm hover:bg-[#449d44] transition-colors uppercase text-[11px]`}
            >
              {loading ? "Processing..." : "SUBMIT"}
            </button>
          </div>
        </div>

        <div className="mt-8 px-4">
          <div className="w-full bg-[#5F9EA0] border border-gray-400 p-2 h-[400px] overflow-y-auto font-mono text-[11px] leading-tight">
            <p className="text-green-900 font-bold mb-1">
              Split Process Status Log...
            </p>
            <pre className="whitespace-pre-wrap text-[#003300] font-bold italic">
              {log || "Waiting for split command..."}
            </pre>
            {status.message && (
              <p
                className={
                  status.type === "error" ? "text-red-900" : "text-green-900"
                }
              >
                [{status.type.toUpperCase()}]{" "}
                {status.message === "Done"
                  ? "Split operation finished."
                  : status.message}
              </p>
            )}
            {loading && (
              <div className="text-white mt-2">
                <p>Calculating shards for {filename}...</p>
                <p className="animate-pulse">Reading master file stream...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSplit;
