import React, { useState } from "react";
import {
  Upload,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  Search,
  Loader2,
} from "lucide-react";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scheduleOffer, setScheduleOffer] = useState("");
  const [datafileName, setDatafileName] = useState("");
  const [newDatafileName, setNewDatafileName] = useState("");
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
  const [searchMappings, setSearchMappings] = useState("");
  const [searchQueue, setSearchQueue] = useState("");

  // RTK Query hooks
  const { data: offers = [] } = useGetOffersQuery();
  const { data: mappings = [], isLoading: mappingsLoading } =
    useGetSuppressionMappingsQuery();
  const { data: queue = [], isLoading: queueLoading } =
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
    if (!selectedFile || !uploadOffer) {
      alert("Please select a file and an offer.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const uploadData = await uploadSuppression(formData).unwrap();
      await createMapping({
        offer_id: uploadOffer,
        filename: uploadData.filename,
      }).unwrap();
      alert("Upload and mapping successful!");
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error: any) {
      alert("Upload failed: " + (error?.data?.message || "Unknown error"));
    }
  };

  const handleSchedule = async () => {
    if (!scheduleOffer || !datafileName) {
      alert("Please fill all schedule fields.");
      return;
    }
    try {
      await createQueue({
        offer_id: scheduleOffer,
        filename: datafileName,
        new_filename: newDatafileName,
      }).unwrap();
      alert("Scheduled successfully!");
    } catch {
      alert("Scheduling failed.");
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (window.confirm("Sure to Delete Mapping?")) {
      try {
        await deleteMapping(id).unwrap();
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const handleDeleteQueue = async (id: string) => {
    if (window.confirm("Sure to Delete from Queue?")) {
      try {
        await deleteQueue(id).unwrap();
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const showLog = (id: string) => {
    setLogQueryId(id);
    setLogModal({ open: true, content: "Loading logs...", id });
  };

  // Update modal content when log data arrives
  React.useEffect(() => {
    if (logData && logModal.open) {
      setLogModal((prev) => ({
        ...prev,
        content:
          typeof logData === "string" ? logData : JSON.stringify(logData),
      }));
    }
  }, [logData, logModal.open]);

  const filteredMappings = mappings.filter((m: any) =>
    Object.values(m).some((v) =>
      String(v).toLowerCase().includes(searchMappings.toLowerCase()),
    ),
  );
  const filteredQueue = queue.filter((q: any) =>
    Object.values(q).some((v) =>
      String(v).toLowerCase().includes(searchQueue.toLowerCase()),
    ),
  );

  return (
    <div className="dashboard-container">
      <h1 className="text-xl font-bold text-white uppercase mb-6 tracking-wider">
        Suppression Manager
      </h1>

      {/* Upload Section */}
      <div className="dash-card mb-6">
        <h3 className="section-title">Upload Suppression List</h3>
        <div className="flex gap-4 flex-wrap mt-4 items-end">
          <div className="form-group">
            <label>Offer</label>
            <select
              value={uploadOffer}
              onChange={(e) => setUploadOffer(e.target.value)}
            >
              <option value="">-- Select Offer --</option>
              {offers.map((o: any) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>File</label>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Upload size={14} />
            )}
            {uploading ? `Uploading ${uploadProgress}%` : "Upload"}
          </button>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="dash-card mb-6">
        <h3 className="section-title">Schedule Suppression</h3>
        <div className="flex gap-4 flex-wrap mt-4 items-end">
          <div className="form-group">
            <label>Offer</label>
            <select
              value={scheduleOffer}
              onChange={(e) => setScheduleOffer(e.target.value)}
            >
              <option value="">-- Select Offer --</option>
              {offers.map((o: any) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Data File Name</label>
            <input
              value={datafileName}
              onChange={(e) => setDatafileName(e.target.value)}
              placeholder="e.g. list.txt"
            />
          </div>
          <div className="form-group">
            <label>New File Name</label>
            <input
              value={newDatafileName}
              onChange={(e) => setNewDatafileName(e.target.value)}
              placeholder="e.g. cleaned.txt"
            />
          </div>
          <button
            onClick={handleSchedule}
            className="btn-primary flex items-center gap-2"
          >
            <Play size={14} /> Schedule
          </button>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="dash-card mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="section-title">Suppression Mappings</h3>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded outline-none"
              placeholder="Search..."
              value={searchMappings}
              onChange={(e) => setSearchMappings(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="legacy-table">
            <thead>
              <tr>
                <th>Offer</th>
                <th>File</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mappingsLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredMappings.map((m: any) => (
                  <tr key={m._id}>
                    <td>{m.offer_id}</td>
                    <td>{m.filename}</td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className="text-green-400 font-bold uppercase text-xs">
                        <CheckCircle size={10} className="inline mr-1" />
                        Active
                      </span>
                    </td>
                    <td className="flex gap-2 justify-center">
                      <button
                        onClick={() => showLog(m._id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMapping(m._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue Table */}
      <div className="dash-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="section-title">
            Suppression Queue{" "}
            <span className="text-xs text-gray-500 ml-2">
              (auto-refreshes every 10s)
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded outline-none"
              placeholder="Search..."
              value={searchQueue}
              onChange={(e) => setSearchQueue(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="legacy-table">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Data File</th>
                <th>New File</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queueLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredQueue.map((q: any) => (
                  <tr key={q._id}>
                    <td>{q.offer_id}</td>
                    <td>{q.filename}</td>
                    <td>{q.new_filename}</td>
                    <td>
                      {q.status === "pending" && (
                        <span className="text-yellow-400 flex items-center gap-1 text-xs">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                      {q.status === "done" && (
                        <span className="text-green-400 flex items-center gap-1 text-xs">
                          <CheckCircle size={10} />
                          Done
                        </span>
                      )}
                      {q.status === "failed" && (
                        <span className="text-red-400 flex items-center gap-1 text-xs">
                          <XCircle size={10} />
                          Failed
                        </span>
                      )}
                      {!q.status && (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="flex gap-2 justify-center">
                      <button
                        onClick={() => showLog(q._id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteQueue(q._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {logModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d21] border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <FileText size={14} /> Suppression Log
              </h3>
              <button
                onClick={() =>
                  setLogModal({ open: false, content: "", id: "" })
                }
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <pre className="p-4 text-green-400 text-xs font-mono overflow-auto flex-1 whitespace-pre-wrap">
              {logModal.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppression;
