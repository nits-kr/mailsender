import React, { useState } from "react";
import { useMergeDataMutation } from "../store/apiSlice";

const DataMerge = () => {
  const [fileList, setFileList] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [mergeStats, setMergeStats] = useState<any>(null);

  const [mergeData, { isLoading: loading }] = useMergeDataMutation();

  const handleMerge = async () => {
    const filenames = fileList
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f);
    if (filenames.length === 0) {
      setStatus({ type: "error", message: "Enter at least one file name!" });
      return;
    }

    setStatus({ type: "info", message: "Merging files..." });

    try {
      const res = await mergeData({ filenames }).unwrap();
      setStatus({ type: "success", message: "Files merged successfully!" });
      setMergeStats(res);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error?.data?.message || "Merge failed",
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-black p-4"
      style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}
    >
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter">
          DATA MERGE PORTAL
        </h2>

        <div className="flex flex-col items-center gap-2 text-[12px] font-bold">
          <label>File Names (one per line):</label>
          <textarea
            value={fileList}
            onChange={(e) => setFileList(e.target.value)}
            placeholder="[Example]&#10;file1.txt&#10;file2.txt&#10;file3.txt"
            className="w-full md:w-[600px] h-32 border border-gray-400 px-2 py-1 outline-none text-gray-700 font-mono text-[11px] resize-none"
          />

          <p className="text-[10px] text-gray-500 italic mt-1">
            Note: Files should be present in /var/www/data directory
          </p>

          <div className="mt-4">
            <button
              onClick={handleMerge}
              disabled={loading}
              className="bg-gray-100 border border-gray-500 px-8 py-0.5 font-bold shadow-sm hover:bg-gray-200 active:bg-gray-300 transition-colors uppercase text-[11px]"
            >
              {loading ? "Merging..." : "MERGE FILES"}
            </button>
          </div>

          <label className="mt-6">Output File Name:</label>
          <textarea
            readOnly
            value={
              mergeStats?.output_file ||
              (status.type === "info"
                ? "Processing..."
                : status.message ||
                  "MERGED OUTPUT FILE NAME WILL APPEAR HERE.....")
            }
            className="w-full md:w-[600px] h-24 border border-gray-400 px-2 py-1 outline-none text-gray-500 font-mono text-[11px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default DataMerge;
