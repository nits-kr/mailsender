import React, { useMemo, useState } from "react";
import { useGetDataCountQuery } from "../store/apiSlice";

const DataCount = () => {
  const { data: dataFiles = [], isFetching } = useGetDataCountQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return dataFiles;
    const lowerSearch = searchTerm.toLowerCase();
    return dataFiles.filter(
      (file: any) =>
        String(file.file).toLowerCase().includes(lowerSearch) ||
        String(file.date).toLowerCase().includes(lowerSearch) ||
        String(file.time).toLowerCase().includes(lowerSearch) ||
        String(file.count).toLowerCase().includes(lowerSearch),
    );
  }, [dataFiles, searchTerm]);

  // Compute total
  const totalCount = useMemo(() => {
    return filteredData.reduce(
      (acc: number, file: any) => acc + (Number(file.count) || 0),
      0,
    );
  }, [filteredData]);

  const handleTransfer = (fileName: string) => {
    // Basic transfer alert to match legacy JS behavior before it opens full functionality
    if (window.confirm("Are you sure you want to transfer this file?")) {
      // Logic for choosing IP would normally go here
      alert(`Transfer initialized for ${fileName}`);
    }
  };

  return (
    <div style={{ padding: "0" }}>
      <style>{`
        .dc-mainbox {
          padding: 10px;
          width: 95%;
          margin: 30px auto;
          background-color: white;
          color: black;
          font-family: Arial, "Trebuchet MS", verdana;
          border: 1px solid #ddd;
          -webkit-box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
          -moz-box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
          box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
        }

        .dc-header {
          text-align: center;
          background: #1abc9c;
          color: white;
          font-size: 30px;
          margin: 0 0 20px 0;
          padding: 10px;
          font-weight: bold;
        }

        .dc-data-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
        }

        .dc-data-table th, .dc-data-table td {
          border: 1px solid #dee2e6;
        }

        .dc-data-table thead th, .dc-data-table tfoot th {
          vertical-align: bottom;
          text-align: center;
          background-color: #60D6FF;
          font-weight: bold;
          font-size: 14px;
          padding: 8px;
        }

        .dc-data-table tbody td {
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          padding: 8px;
        }

        .dc-data-table tbody tr:nth-of-type(odd) {
          background-color: #f9f9f9;
        }
        .dc-data-table tbody tr:nth-of-type(even) {
          background-color: transparent;
        }

        .dc-btn-primary {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
          display: inline-block;
          font-weight: 400;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          user-select: none;
          border: 1px solid transparent;
          padding: .375rem .75rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: .25rem;
          cursor: pointer;
        }
        .dc-btn-primary:hover {
          background-color: #0069d9;
          border-color: #0062cc;
        }
      `}</style>

      <div className="dc-mainbox">
        <h1 className="dc-header">Data File Panel </h1>
        <div
          style={{
            textAlign: "right",
            marginBottom: "10px",
            paddingRight: "10px",
          }}
        >
          <label style={{ fontWeight: "bold", color: "red", fontSize: "14px" }}>
            Search:{" "}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "1px solid #ccc",
              padding: "3px",
              width: "200px",
              borderRadius: "3px",
            }}
          />
        </div>
        <table className="dc-data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th align="center">CREATED DATE</th>
              <th align="center">CREATED TIME</th>
              <th align="center">DATAFILE NAME</th>
              <th align="center">CURRENT COUNT</th>
              <th align="center">TRANSFER</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((file: any, index: number) => (
              <tr key={index}>
                <td align="center">
                  <b>{file.date}</b>
                </td>
                <td align="center">
                  <b>{file.time}</b>
                </td>
                <td align="center">
                  <b>{file.file}</b>
                </td>
                <td align="center">
                  <b>{file.count}</b>
                </td>
                <td align="center">
                  <button
                    className="dc-btn-primary"
                    onClick={() => handleTransfer(file.file)}
                  >
                    Transfer
                  </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && !isFetching && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    fontWeight: "normal",
                    padding: "20px",
                  }}
                >
                  No data files found.
                </td>
              </tr>
            )}
            {isFetching && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    fontWeight: "normal",
                    padding: "20px",
                  }}
                >
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3} style={{ textAlign: "center" }}>
                Total
              </th>
              <th align="center">{totalCount}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DataCount;
