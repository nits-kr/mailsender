import React, { useState } from "react";
import { useUpdateDataStatusMutation } from "../store/apiSlice";

const ComplainUpdate = () => {
  const [ids, setIds] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const [updateDataStatus, { isLoading: loading }] =
    useUpdateDataStatusMutation();

  const handleUpdate = async () => {
    if (!ids.trim()) {
      setStatus({ type: "error", message: "Email IDs are required!" });
      return;
    }

    setStatus({ type: "info", message: "Updating records..." });

    try {
      const idArray = ids
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);
      await updateDataStatus({
        ids: idArray,
        type: "complain",
      }).unwrap();
      setStatus({ type: "success", message: "Done" });
      setIds("");
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error?.data?.message || error?.message || "Update failed",
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
          COMPLAIN UPDATE PORTAL
        </h2>

        <div className="flex flex-col items-center gap-4 text-[12px] font-bold">
          <div className="flex flex-col items-center gap-2 w-full max-w-[600px]">
            <label>Ids (One Per Line) = </label>
            <textarea
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              className="w-full h-48 border border-gray-400 px-2 py-1 outline-none text-gray-700 font-mono text-[11px] resize-none"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className={`bg-[#5cb85c] border border-[#4cae4c] text-white px-8 py-1 font-bold shadow-sm hover:bg-[#449d44] transition-colors uppercase text-[11px]`}
            >
              {loading ? "Updating..." : "UPDATE COMPLAIN"}
            </button>
          </div>
        </div>

        <div className="mt-8 px-4">
          <div className="w-full bg-[#5F9EA0] border border-gray-400 p-2 h-[300px] overflow-y-auto font-mono text-[11px] leading-tight">
            <p className="text-green-900 font-bold mb-1">
              Complain Process Status...
            </p>
            {status.message && (
              <p
                className={
                  status.type === "error" ? "text-red-900" : "text-green-900"
                }
              >
                [{status.type.toUpperCase()}]{" "}
                {status.message === "Done"
                  ? "Records updated in complain database."
                  : status.message}
              </p>
            )}
            {loading && (
              <div className="text-white mt-2">
                <p>Processing complaint IDs...</p>
                <p className="animate-pulse">Updating suppression tables...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplainUpdate;
