import React, { useState } from "react";
import "./Suppression.css";
import {
  useGetOffersQuery,
  useGetSuppressionMappingsQuery,
  useGetSuppressionQueueQuery,
  useUploadSuppressionMutation,
  useCreateSuppressionMappingMutation,
  useCreateSuppressionQueueMutation,
  useDeleteSuppressionMappingMutation,
  useDeleteSuppressionQueueMutation,
  useGetSuppressionLogQuery,
} from "../store/apiSlice";

const Suppression = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadOffer, setUploadOffer] = useState("");
  const [scheduleOffer, setScheduleOffer] = useState("");
  const [datafileName, setDatafileName] = useState("");
  const [newDatafileName, setNewDatafileName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [queueMessage, setQueueMessage] = useState("");
  const [searchMappings, setSearchMappings] = useState("");
  const [searchQueue, setSearchQueue] = useState("");
  const [logModal, setLogModal] = useState<{
    open: boolean;
    content: string;
    id: string;
  }>({
    open: false,
    content: "",
    id: "",
  });
  const [logQueryId, setLogQueryId] = useState<string | null>(null);

  // RTK Query hooks
  const { data: offers = [] } = useGetOffersQuery();
  const { data: mappings = [], refetch: refetchMappings } =
    useGetSuppressionMappingsQuery();
  const { data: queue = [], refetch: refetchQueue } =
    useGetSuppressionQueueQuery(undefined, {
      pollingInterval: 10000,
    });
  const { data: logData } = useGetSuppressionLogQuery(logQueryId!, {
    skip: !logQueryId,
  });

  const [uploadSuppression, { isLoading: uploading }] =
    useUploadSuppressionMutation();
  const [createMapping] = useCreateSuppressionMappingMutation();
  const [createQueue] = useCreateSuppressionQueueMutation();
  const [deleteMapping] = useDeleteSuppressionMappingMutation();
  const [deleteQueue] = useDeleteSuppressionQueueMutation();

  const handleUpload = async () => {
    if (!uploadOffer) {
      alert("Choose Offer...!");
      return;
    }
    if (!selectedFile) {
      alert("Upload Needed..!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setStatusMessage("Processing..!");
    try {
      const uploadData = await uploadSuppression(formData).unwrap();
      await createMapping({
        offer_id: uploadOffer,
        filename: uploadData.filename,
      }).unwrap();
      setStatusMessage("Saved Successfully!");
      setSelectedFile(null);
      refetchMappings();
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error: any) {
      setStatusMessage("Error uploading file.");
    }
  };

  const handleSchedule = async () => {
    if (!scheduleOffer) {
      alert("Choose Offer...!");
      return;
    }
    if (!datafileName) {
      alert("Data File Name Required..!");
      return;
    }
    if (!newDatafileName) {
      alert("New Data File Name Required..!");
      return;
    }

    setQueueMessage("Processing..!");
    try {
      await createQueue({
        offer_id: scheduleOffer,
        filename: datafileName,
        new_filename: newDatafileName,
      }).unwrap();
      setQueueMessage("Scheduled Successfully!");
      refetchQueue();
      setTimeout(() => setQueueMessage(""), 5000);
    } catch {
      setQueueMessage("Scheduling failed.");
    }
  };

  const handleDeleteMapping = async (id: string, offerId: string) => {
    if (window.confirm("Heads Up.. Sure to Delete ..?")) {
      try {
        await deleteMapping(id).unwrap();
        alert("Mapping deleted successfully.");
        refetchMappings();
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const handleDeleteQueue = async (id: string) => {
    if (window.confirm("Heads Up.. Sure to Delete ..?")) {
      try {
        await deleteQueue(id).unwrap();
        alert("Queue item deleted successfully.");
        refetchQueue();
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const showLog = (id: string) => {
    setLogQueryId(id);
    setLogModal({ open: true, content: "Loading logs...", id });
  };

  React.useEffect(() => {
    if (logData && logModal.open) {
      const logLines = (
        typeof logData === "string" ? logData : JSON.stringify(logData)
      ).split("\n");
      const reversedLog = logLines.reverse().join("\n");
      setLogModal((prev) => ({ ...prev, content: reversedLog }));
    }
  }, [logData, logModal.open]);

  const filteredMappings = Array.isArray(mappings)
    ? mappings.filter(
        (m: any) =>
          (m.Affiliate || "")
            .toLowerCase()
            .includes(searchMappings.toLowerCase()) ||
          (m.offer_name || m.offer_id?.name || "")
            .toLowerCase()
            .includes(searchMappings.toLowerCase()) ||
          (m.filename || "")
            .toLowerCase()
            .includes(searchMappings.toLowerCase()),
      )
    : [];

  const filteredQueue = Array.isArray(queue)
    ? queue.filter(
        (q: any) =>
          (q.Affiliate || "")
            .toLowerCase()
            .includes(searchQueue.toLowerCase()) ||
          (q.offer_name || q.offer_id?.name || "")
            .toLowerCase()
            .includes(searchQueue.toLowerCase()) ||
          (q.new_filename || "")
            .toLowerCase()
            .includes(searchQueue.toLowerCase()),
      )
    : [];

  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 0:
        return <span className="supp-status-queued">Queued</span>;
      case 1:
        return <span className="supp-status-completed">Completed</span>;
      case 2:
        return <span className="supp-status-running">Running</span>;
      case 3:
        return <span className="supp-status-error">Error</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  return (
    <div className="supp-container">
      {/* Row 1: Upload and Schedule */}
      <div className="supp-row1">
        {/* Upload Section */}
        <div className="supp-section">
          <h2>
            <u>UPLOAD SUPPRESSION SECTION</u>
          </h2>
          <div className="supp-form-group">
            <b>Choose Offer :</b>{" "}
            <select
              value={uploadOffer}
              onChange={(e) => setUploadOffer(e.target.value)}
            >
              <option value="">Select Any</option>
              {Array.isArray(offers) &&
                offers.map((o: any) => (
                  <option key={o._id} value={o._id}>
                    {o.id} | {o.affiliate} | {o.name}
                  </option>
                ))}
            </select>
          </div>
          <div
            className="supp-form-group"
            style={{ display: "flex", alignItems: "center" }}
          >
            <b>Vendor Suppression File :</b>{" "}
            <label className="supp-upload-btn" style={{ marginLeft: "10px" }}>
              Upload File
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
            <span style={{ marginLeft: "10px" }}>
              {selectedFile ? `${selectedFile.name} (100%)` : ""}
            </span>
          </div>
          <button className="supp-save-btn" onClick={handleUpload}>
            Save Data
          </button>
          <div style={{ textAlign: "center", marginTop: "5px" }}>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {statusMessage}
            </span>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="supp-section">
          <h2>
            <u>SUPPRESSION SCHEDULER</u>
          </h2>
          <div className="supp-form-group">
            <b>Choose Offer :</b>{" "}
            <select
              value={scheduleOffer}
              onChange={(e) => setScheduleOffer(e.target.value)}
            >
              <option value="">Select Any</option>
              {(Array.isArray(mappings) ? mappings : []).map((m: any) => (
                <option
                  key={m.offer_id?._id || m._id}
                  value={m.offer_id?._id || m.offer_id}
                >
                  {m.offer_id?.id || "N/A"} | {m.offer_id?.affiliate || "N/A"} |{" "}
                  {m.offer_id?.name || "N/A"}
                </option>
              ))}
            </select>
          </div>
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <input
              type="text"
              className="supp-data-input"
              placeholder="DATAFILE NAME"
              value={datafileName}
              onChange={(e) => setDatafileName(e.target.value)}
            />
            <input
              type="text"
              className="supp-data-input"
              placeholder="NEW DATAFILE NAME"
              style={{ marginLeft: "10px" }}
              value={newDatafileName}
              onChange={(e) => setNewDatafileName(e.target.value)}
            />
          </div>
          <button className="supp-schedule-btn" onClick={handleSchedule}>
            Schedule
          </button>
          <div style={{ textAlign: "center", marginTop: "5px" }}>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {queueMessage}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Mappings and Queue */}
      <div className="supp-row2">
        {/* Mappings Table */}
        <div className="supp-section" style={{ flex: 1 }}>
          <h2>
            <u>OFFER WISE SUPPRESSION DETAILS</u>
            <input
              type="text"
              className="supp-search-input"
              placeholder="Search.."
              value={searchMappings}
              onChange={(e) => setSearchMappings(e.target.value)}
            />
          </h2>
          <div className="supp-table-container">
            <table className="supp-table">
              <thead>
                <tr>
                  <th>Affiliate</th>
                  <th>Offer Name</th>
                  <th>Supp File Name</th>
                  <th>Uploaded At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((m: any) => (
                  <tr key={m._id}>
                    <td>{m.offer_id?.affiliate || m.affiliate}</td>
                    <td>{m.offer_id?.name || m.offer_name}</td>
                    <td>{m.filename}</td>
                    <td>
                      {new Date(m.upload_at || m.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="supp-delete-btn"
                        onClick={() =>
                          handleDeleteMapping(
                            m._id,
                            m.offer_id?._id || m.offer_id,
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Queue Table */}
        <div className="supp-section" style={{ flex: 1.5 }}>
          <h2>
            <u>SUPPRESSION QUEUE</u>
            <input
              type="text"
              className="supp-search-input"
              placeholder="Search.."
              value={searchQueue}
              onChange={(e) => setSearchQueue(e.target.value)}
            />
          </h2>
          <div className="supp-table-container">
            <table className="supp-table">
              <thead>
                <tr>
                  <th>Affiliate</th>
                  <th>Offer Name</th>
                  <th>New Supp DataFile</th>
                  <th>Status</th>
                  <th>O.C.</th>
                  <th>F.C.</th>
                  <th>S.C.</th>
                  <th>Date Queued</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((q: any) => (
                  <tr key={q._id}>
                    <td>{q.offer_id?.affiliate || q.affiliate}</td>
                    <td>{q.offer_id?.name || q.offer_name}</td>
                    <td>{q.new_filename}</td>
                    <td>{getStatusDisplay(q.status)}</td>
                    <td>{q.initial_file_count || 0}</td>
                    <td>{q.final_file_count || 0}</td>
                    <td>{q.suppressed_file_count || 0}</td>
                    <td>
                      {new Date(q.createdAt || q.date_queued).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {q.status === 0 ? (
                        <button
                          className="supp-delete-btn"
                          onClick={() => handleDeleteQueue(q._id)}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          className="supp-log-btn"
                          onClick={() => showLog(q._id)}
                        >
                          Log
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {logModal.open && (
        <div className="supp-modal">
          <div className="supp-modal-content">
            <span
              className="supp-modal-close"
              onClick={() => setLogModal({ ...logModal, open: false })}
            >
              &times;
            </span>
            <div className="supp-log-content">
              <pre>{logModal.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppression;
