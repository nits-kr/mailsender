import React, { useState } from "react";
import { useGetDataCountQuery, useDeleteDataMutation } from "../store/apiSlice";

const DataDelete = () => {
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: files } = useGetDataCountQuery();
  const [deleteData, { isLoading: loading }] = useDeleteDataMutation();

  const handleDelete = async (targetFilename?: string) => {
    const fileToDelete = targetFilename || filename;

    if (!fileToDelete) {
      setStatus({
        type: "error",
        message: "Enter or select a filename to delete!",
      });
      return;
    }

    if (
      !window.confirm(
        `Are you absolutely sure you want to PERMANENTLY delete ${fileToDelete}?`,
      )
    ) {
      return;
    }

    setStatus({ type: "info", message: "Deleting file..." });

    try {
      await deleteData(fileToDelete).unwrap();
      setStatus({ type: "success", message: "Done" });
      setFilename("");
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error?.data?.message || "Delete failed",
      });
    }
  };

  const filteredFiles = Array.isArray(files)
    ? files.filter((f) =>
        f.filename?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  return (
    <div
      className="min-h-screen bg-white text-black p-4"
      style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter">
          DATA DELETE PORTAL
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Actions & Status */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <label>Filename To Erase = </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="border border-gray-400 px-2 py-0.5 w-64 outline-none font-mono"
              />
            </div>

            <button
              onClick={() => handleDelete()}
              disabled={loading}
              className="bg-[#d9534f] border border-[#d43f3a] text-white px-8 py-1 font-bold shadow-sm hover:bg-[#c9302c] transition-colors uppercase text-[11px]"
            >
              {loading ? "Erasing..." : "Delete File"}
            </button>

            <div className="w-full mt-4">
              <div className="w-full bg-[#5F9EA0] border border-gray-400 p-2 h-[250px] overflow-y-auto font-mono text-[11px] leading-tight">
                <p className="text-green-900 font-bold mb-1">
                  Delete Process Status...
                </p>
                {status.message && (
                  <p
                    className={
                      status.type === "error"
                        ? "text-red-900"
                        : "text-green-900"
                    }
                  >
                    [{status.type.toUpperCase()}]{" "}
                    {status.message === "Done"
                      ? "File erased from system."
                      : status.message}
                  </p>
                )}
                {loading && (
                  <div className="text-white mt-2">
                    <p>Searching for {filename}...</p>
                    <p className="animate-pulse text-red-100">
                      Wiping data records...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: File Browser */}
          <div className="border border-gray-400 p-4 bg-gray-50 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-widest border-b border-gray-300 pb-2">
              <span>File Name</span>
              <div className="flex items-center gap-2">
                <span className="italic">Search:</span>
                <input
                  type="text"
                  className="border border-gray-400 px-2 py-0.5 w-32 font-mono bg-white outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-300">
                  <tr>
                    <th className="py-1">Filename</th>
                    <th className="py-1 text-right">Count</th>
                    <th className="py-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredFiles) &&
                    filteredFiles.map((file) => (
                      <tr
                        key={file.filename}
                        className="hover:bg-red-50 border-b border-gray-200"
                      >
                        <td className="py-2 pr-2 truncate max-w-[200px]">
                          {file.filename}
                        </td>
                        <td className="py-2 text-right">{file.count}</td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleDelete(file.filename)}
                            className="text-red-600 font-bold hover:underline"
                          >
                            [DELETE]
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDelete;
