import React, { useState } from "react";
import {
  useGetDataCountQuery,
  useDownloadDataMutation,
} from "../store/apiSlice";
import {
  Search,
  Download,
  Plus,
  Minus,
  Search as SearchIcon,
} from "lucide-react";

const DataDownload = () => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ip, setIp] = useState("173.249.50.153");
  const [count, setCount] = useState("10000");
  const [repeat, setRepeat] = useState("1");
  const [type, setType] = useState("Random");
  const [selector, setSelector] = useState("email");
  const [result, setResult] = useState("");
  const [generatedFilename, setGeneratedFilename] = useState("");

  const { data: allFiles } = useGetDataCountQuery();
  const [downloadData, { isLoading: loading }] = useDownloadDataMutation();

  const toggleFile = (file: any) => {
    if (!Array.isArray(selectedFiles)) return;
    if (selectedFiles.find((f) => f.filename === file.filename)) {
      setSelectedFiles(
        selectedFiles.filter((f) => f.filename !== file.filename),
      );
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleDownload = async () => {
    if (selectedFiles.length === 0) {
      setResult("Select any file first!");
      return;
    }
    setResult("Processing...");

    try {
      const res = await downloadData({
        filenames: (Array.isArray(selectedFiles) ? selectedFiles : []).map(
          (f) => f.filename,
        ),
        count,
        type,
        times: repeat,
        ip,
        selector,
      }).unwrap();
      setGeneratedFilename(res.filename);
      setResult(
        `Success! File: ${res.filename} | Final: ${res.finalCount} | Supp: ${res.suppCount}`,
      );
    } catch (error: any) {
      setResult(`Error: ${error?.data?.message || "Download failed"}`);
    }
  };

  const filteredFiles = (Array.isArray(allFiles) ? allFiles : []).filter(
    (f) =>
      f.filename?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(Array.isArray(selectedFiles) ? selectedFiles : []).find(
        (sf) => sf.filename === f.filename,
      ),
  );

  const totalSelectedCount = (
    Array.isArray(selectedFiles) ? selectedFiles : []
  ).reduce((acc, f) => acc + (f.count || 0), 0);
  const totalAllCount = (Array.isArray(allFiles) ? allFiles : []).reduce(
    (acc, f) => acc + (f.count || 0),
    0,
  );

  return (
    <div
      className="min-h-screen bg-white text-black p-4 pb-20"
      style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}
    >
      <div className="max-w-[1100px] mx-auto flex flex-col items-center">
        <center>
          <h2 className="text-xl font-bold mb-10 pt-4 uppercase tracking-tighter">
            DATA DOWNLOADING PORTAL
          </h2>
        </center>

        {/* Portlets Container */}
        <div className="flex flex-row justify-center items-start gap-8 w-full mb-10">
          {/* SELECTED Portlet */}
          <div className="w-[480px] border border-blue-600 rounded-sm bg-white flex flex-col h-[420px] shadow-sm">
            <div className="text-center py-2 border-b border-gray-300 bg-white">
              <span className="text-green-700 font-bold text-md uppercase">
                SELECTED
              </span>
            </div>
            <div className="relative flex items-center px-3 py-1 border-b border-gray-400 text-[12px] font-bold bg-white h-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <span>Filename</span>
              </div>
              <div className="ml-auto">
                <span>Total : {totalSelectedCount}</span>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin bg-white">
              {selectedFiles.map((file) => (
                <div
                  key={file.filename}
                  onClick={() => toggleFile(file)}
                  className="px-3 py-0.5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-[12px] font-bold flex justify-between"
                >
                  <span className="text-gray-800">{file.filename}</span>
                  <span className="text-gray-400">[{file.count}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* All Portlet */}
          <div className="w-[480px] border border-blue-600 rounded-sm bg-white flex flex-col h-[420px] shadow-sm">
            <div className="text-center py-2 border-b border-gray-300 bg-white">
              <span className="text-blue-700 font-bold text-md uppercase">
                All
              </span>
            </div>
            <div className="py-2 border-b border-gray-300 bg-white text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[12px] font-bold italic text-gray-700">
                  Search..
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 px-1 py-0.5 text-[11px] w-48 outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="relative flex items-center px-3 py-1 border-b border-gray-400 text-[12px] font-bold bg-white h-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <span>Filename</span>
              </div>
              <div className="ml-auto">
                <span>Total : {totalAllCount}</span>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin bg-white">
              {filteredFiles.map((file) => (
                <div
                  key={file.filename}
                  onClick={() => toggleFile(file)}
                  className="px-3 py-0.5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-[12px] font-bold leading-tight"
                >
                  <span className="text-green-700">{file.filename}</span>
                  <span className="text-black mx-1 font-normal">|</span>
                  <span className="text-red-600">{file.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="flex flex-col items-center gap-2 text-[12px] font-bold mb-8">
          <div className="flex items-center gap-3">
            <label className="w-24 text-right">IP :</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="border border-gray-400 px-2 py-0.5 w-[220px] outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-right">Count :</label>
            <input
              type="text"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="border border-gray-400 px-2 py-0.5 w-[220px] outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-right">Repeat By:</label>
            <input
              type="text"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="border border-gray-400 px-2 py-0.5 w-[220px] outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-right">Type :</label>
            <div className="flex items-center gap-6 w-[220px]">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={type === "Random"}
                  onChange={() => setType("Random")}
                />{" "}
                Random
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={type === "Not Random"}
                  onChange={() => setType("Not Random")}
                />{" "}
                Not Random
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-right">Selector :</label>
            <div className="flex items-center gap-6 w-[220px]">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={selector === "email"}
                  onChange={() => setSelector("email")}
                />{" "}
                Email
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={selector === "both"}
                  onChange={() => setSelector("both")}
                />{" "}
                Email / MD5
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="bg-gray-100 border border-gray-500 px-8 py-1 font-bold shadow-sm hover:bg-gray-200 active:bg-gray-300 transition-colors uppercase text-[11px]"
            >
              {loading ? "Processing..." : "Download"}
            </button>
          </div>

          <div className="mt-8 flex justify-center w-full">
            <textarea
              readOnly
              value={generatedFilename || result}
              placeholder="Filename Will Be Generated Here...!"
              className="w-[850px] h-28 border border-gray-400 px-3 py-2 outline-none text-gray-500 resize-none font-mono text-[11px] bg-white italic"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDownload;
