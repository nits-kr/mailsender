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
import {
  UploadCloud,
  Calendar,
  Database,
  Trash2,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlusCircle,
  Info,
  Clock,
  PlayCircle,
  XCircle,
  History,
  Activity,
} from "lucide-react";

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

  const [uploadSuppression, { isLoading: isUploading }] =
    useUploadSuppressionMutation();
  const [createMapping, { isLoading: isMapping }] =
    useCreateSuppressionMappingMutation();
  const [createQueue, { isLoading: isScheduling }] =
    useCreateSuppressionQueueMutation();
  const [deleteMapping, { isLoading: isDeletingMapping }] =
    useDeleteSuppressionMappingMutation();
  const [deleteQueue, { isLoading: isDeletingQueue }] =
    useDeleteSuppressionQueueMutation();

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
      // Backend returns { log: string, status: number } from MongoDB
      const rawLog =
        typeof logData === "string"
          ? logData
          : ((logData as any).log ?? JSON.stringify(logData));
      const logLines = rawLog.split("\n");
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
        return (
          <span className="supp-status-queued">
            <Clock size={12} /> Queued
          </span>
        );
      case 1:
        return (
          <span className="supp-status-completed">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 2:
        return (
          <span className="supp-status-running">
            <PlayCircle size={12} /> Running
          </span>
        );
      case 3:
        return (
          <span className="supp-status-error">
            <XCircle size={12} /> Error
          </span>
        );
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
            <UploadCloud size={20} className="text-blue-500" />
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
              <UploadCloud size={14} /> Upload File
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
            <span
              style={{
                marginLeft: "10px",
                fontWeight: "600",
                color: "#64748b",
              }}
            >
              {selectedFile ? `${selectedFile.name} (100%)` : ""}
            </span>
          </div>
          <button
            className="supp-save-btn"
            onClick={handleUpload}
            disabled={isUploading || isMapping}
          >
            {isUploading || isMapping ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <PlusCircle size={18} />
            )}
            {isUploading || isMapping ? "Saving..." : "Save Data"}
          </button>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <span
              style={{
                color: statusMessage.includes("Error") ? "#dc2626" : "#059669",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {statusMessage &&
                (statusMessage.includes("Error") ? (
                  <AlertCircle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                ))}
              {statusMessage}
            </span>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="supp-section">
          <h2>
            <Calendar size={20} className="text-orange-500" />
            <u>SUPPRESSION SCHEDULER</u>
          </h2>
          <div className="supp-form-group">
            <b>Choose Offer :</b>{" "}
            <select
              value={scheduleOffer}
              onChange={(e) => setScheduleOffer(e.target.value)}
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
            style={{
              textAlign: "center",
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              padding: "0 20px",
            }}
          >
            <input
              type="text"
              className="supp-data-input"
              style={{ flex: 1 }}
              placeholder="DATAFILE NAME"
              value={datafileName}
              onChange={(e) => setDatafileName(e.target.value)}
            />
            <input
              type="text"
              className="supp-data-input"
              style={{ flex: 1 }}
              placeholder="NEW DATAFILE NAME"
              value={newDatafileName}
              onChange={(e) => setNewDatafileName(e.target.value)}
            />
          </div>
          <button
            className="supp-schedule-btn"
            onClick={handleSchedule}
            disabled={isScheduling}
          >
            {isScheduling ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Clock size={18} />
            )}
            {isScheduling ? "Processing..." : "Schedule"}
          </button>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <span
              style={{
                color: queueMessage.includes("failed") ? "#dc2626" : "#059669",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {queueMessage &&
                (queueMessage.includes("failed") ? (
                  <AlertCircle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                ))}
              {queueMessage}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Mappings and Queue */}
      <div className="supp-row2">
        {/* Mappings Table */}
        <div className="supp-section">
          <h2>
            <Database size={18} className="text-slate-600" />
            <u>OFFER WISE SUPPRESSION DETAILS</u>
            <div style={{ flex: 1 }}></div>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
              <input
                type="text"
                className="supp-search-input"
                style={{ paddingLeft: "28px" }}
                placeholder="Search.."
                value={searchMappings}
                onChange={(e) => setSearchMappings(e.target.value)}
              />
            </div>
          </h2>
          <div className="supp-table-container">
            <table className="supp-table">
              <thead>
                <tr>
                  <th>Affiliate</th>
                  <th>Offer Name</th>
                  <th>Supp File Name</th>
                  <th>Uploaded At</th>
                  <th style={{ textAlign: "center" }}>Action</th>
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
                        disabled={isDeletingMapping}
                      >
                        {isDeletingMapping ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Trash2 size={11} />
                        )}
                        <span style={{ marginLeft: "4px" }}>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Queue Table */}
        <div className="supp-section">
          <h2>
            <History size={18} className="text-slate-600" />
            <u>SUPPRESSION QUEUE</u>
            <div style={{ flex: 1 }}></div>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
              <input
                type="text"
                className="supp-search-input"
                style={{ paddingLeft: "28px" }}
                placeholder="Search.."
                value={searchQueue}
                onChange={(e) => setSearchQueue(e.target.value)}
              />
            </div>
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
                  <th style={{ textAlign: "center" }}>Action</th>
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
                          disabled={isDeletingQueue}
                        >
                          {isDeletingQueue ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Trash2 size={11} />
                          )}
                          <span style={{ marginLeft: "4px" }}>Delete</span>
                        </button>
                      ) : (
                        <button
                          className="supp-log-btn"
                          onClick={() => showLog(q._id)}
                        >
                          <Activity size={11} />
                          <span style={{ marginLeft: "4px" }}>Log</span>
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
              <Info size={20} style={{ float: "left", marginTop: "10px" }} />
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
