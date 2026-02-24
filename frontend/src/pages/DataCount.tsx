import React from "react";
import { Database, RefreshCw, Send } from "lucide-react";
import { useGetDataCountQuery } from "../store/apiSlice";

const DataCount = () => {
  const { data: dataFiles = [], isFetching, refetch } = useGetDataCountQuery();

  return (
    <div className="dashboard-container">
      <header className="flex justify-between items-center mb-8 bg-dark-2 p-4 border border-light rounded">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">
            Data File Repository
          </h1>
          <p className="text-gray-400 text-10px italic">
            Monitor and manage email data files in /var/www/data/
          </p>
        </div>
        <button
          onClick={refetch}
          className="bg-primary flex items-center gap-2 px-5 py-2 rounded text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg text-xs"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </header>

      <div className="grid grid-cols-1 lg-grid-cols-3 gap-6">
        {dataFiles.map((file, index) => (
          <div
            key={index}
            className="bg-dark-3 p-6 rounded border border-light hover:border-blue-500 transition-colors shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-10 rounded-lg">
                <Database className="text-primary w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-9px uppercase font-bold tracking-widest">
                  Row Count
                </p>
                <p className="text-2xl font-bold text-white font-mono">
                  {file.count.toLocaleString()}
                </p>
              </div>
            </div>
            <h3
              className="text-xs font-bold text-gray-200 mb-2 truncate bg-dark-1 p-2 rounded border border-gray-800"
              title={file.file}
            >
              {file.file}
            </h3>
            <p className="text-gray-500 text-9px font-bold uppercase mb-6 flex justify-between">
              <span>Date: {file.date}</span>
              <span>Time: {file.time}</span>
            </p>

            <button className="w-full py-2 bg-primary-20 hover:bg-primary text-white text-10px font-bold rounded transition-all flex items-center justify-center gap-2 border border-primary-30 uppercase tracking-tighter">
              Transfer to Server
              <Send size={12} />
            </button>
          </div>
        ))}
      </div>

      {dataFiles.length === 0 && !isFetching && (
        <div className="p-20 text-center bg-[#25282c] rounded border border-gray-800 shadow-xl">
          <Database className="mx-auto w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-bold italic text-sm">
            No data files found in the specified directory.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataCount;
