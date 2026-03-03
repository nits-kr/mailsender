import React, { useState, useMemo } from "react";
import {
  useGetTestIdsQuery,
  useAddTestIdMutation,
  useUpdateTestIdMutation,
  useDeleteTestIdMutation,
  useGetImapScreensQuery,
  useGetImapLogsQuery,
  useStopImapScreenMutation,
  useRestartImapScreenMutation,
  useDeleteImapScreenMutation,
  useCreateImapScreenMutation,
} from "../store/apiSlice";
import "./TestidsScreen.css";

/* ─── Types ───────────────────────────────────────────── */
interface TestIdForm {
  domain: string;
  email: string;
  password: string;
  inboxhostname: string;
  spamhostname: string;
  port: string;
  status: string;
  _id?: string;
}

const emptyForm: TestIdForm = {
  domain: "",
  email: "",
  password: "",
  inboxhostname: "",
  spamhostname: "",
  port: "",
  status: "A",
};

/* ─── Component ───────────────────────────────────────── */
const TestidsScreen = () => {
  /* RTK Query hooks */
  const { data: testIds = [], refetch: refetchTestIds } = useGetTestIdsQuery();
  const {
    data: imapScreens = [],
    refetch: refetchScreens,
    isLoading: screensLoading,
  } = useGetImapScreensQuery();
  const [addTestId] = useAddTestIdMutation();
  const [updateTestId] = useUpdateTestIdMutation();
  const [deleteTestId] = useDeleteTestIdMutation();
  const [stopScreen] = useStopImapScreenMutation();
  const [restartScreen] = useRestartImapScreenMutation();
  const [deleteScreen] = useDeleteImapScreenMutation();
  const [createScreen] = useCreateImapScreenMutation();

  /* ── Section 1: IMAP Screen Manager state ── */
  const [selectedTestId, setSelectedTestId] = useState("");
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [logScreenEmail, setLogScreenEmail] = useState<string | null>(null);
  const { data: logData } = useGetImapLogsQuery(logScreenEmail!, {
    skip: !logScreenEmail,
  });

  /* ── Section 2: Test IDs CRUD state ── */
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<TestIdForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ─── Searchable dropdown logic ──────────────────────── */
  const activeTestIds = Array.isArray(testIds)
    ? testIds.filter((t: any) => t.status === "A")
    : [];

  const filteredDropdown = activeTestIds.filter(
    (t: any) =>
      (t.email ?? "").toLowerCase().includes(dropdownSearch.toLowerCase()) ||
      (t.domain ?? "").toLowerCase().includes(dropdownSearch.toLowerCase()),
  );

  const selectedTestIdLabel = useMemo(() => {
    const found = activeTestIds.find((t: any) => t._id === selectedTestId);
    return found ? found.email : "Select Test Id to Create Screen";
  }, [selectedTestId, activeTestIds]);

  /* ─── IMAP Screen handlers ───────────────────────────── */
  const handleStart = async () => {
    if (!selectedTestId) return alert("Please select a Test ID");
    setStarting(true);
    try {
      const res = await createScreen({ sno: selectedTestId }).unwrap();
      alert(
        `✅ Screens started for ${res.email}!\nINBOX: ${res.sinboxname}\nSPAM: ${res.sspamname}`,
      );
      refetchScreens();
    } catch (err: any) {
      alert("Error: " + (err?.data?.message || err?.message));
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async (screenName: string) => {
    if (!window.confirm(`Stop process for screen "${screenName}"?`)) return;
    try {
      await stopScreen(screenName).unwrap();
      refetchScreens();
    } catch (err: any) {
      alert("Stop error: " + (err?.data?.message || err?.message));
    }
  };

  const handleRestart = async (screen: any) => {
    try {
      await restartScreen({
        name: screen.screen_name,
        type: screen.type,
        sno: screen.screen_name.split("_").pop() || "",
      }).unwrap();
      alert(`✅ Restart command sent to ${screen.screen_name}`);
      refetchScreens();
    } catch (err: any) {
      alert("Restart error: " + (err?.data?.message || err?.message));
    }
  };

  const handleDeleteScreen = async (screenName: string) => {
    if (!window.confirm(`Delete screen "${screenName}"?`)) return;
    try {
      await deleteScreen(screenName).unwrap();
      refetchScreens();
    } catch (err: any) {
      alert("Delete error: " + (err?.data?.message || err?.message));
    }
  };

  /* ─── Test ID CRUD handlers ──────────────────────────── */
  const openAdd = () => {
    setFormData(emptyForm);
    setShowModal(true);
  };
  const openEdit = (item: any) => {
    setFormData({
      domain: item.domain ?? "",
      email: item.email ?? "",
      password: item.password ?? "",
      inboxhostname: item.inboxhostname ?? "",
      spamhostname: item.spamhostname ?? "",
      port: item.port ?? "",
      status: item.status ?? "A",
      _id: item._id,
    });
    setShowModal(true);
  };
  const openView = (item: any) => {
    setSelectedItem(item);
    setViewModal(true);
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domain) return alert("Domain is required");
    if (!formData.email) return alert("Email is required");
    if (!formData.password) return alert("Password is required");
    if (!formData.inboxhostname) return alert("Inbox Hostname is required");
    if (!formData.spamhostname) return alert("Spam Hostname is required");
    if (!formData.port) return alert("Port is required");
    setIsSubmitting(true);
    try {
      if (formData._id) {
        await updateTestId({ id: formData._id, ...formData }).unwrap();
      } else {
        await addTestId(formData).unwrap();
      }
      setShowModal(false);
      setFormData(emptyForm);
    } catch (err: any) {
      alert("Error: " + (err?.data?.message || err?.message || "Unknown"));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteTestId = async (id: string, email: string) => {
    if (!window.confirm(`Delete Test ID for "${email}"?`)) return;
    try {
      await deleteTestId(id).unwrap();
    } catch (err: any) {
      alert("Error: " + (err?.data?.message || err?.message));
    }
  };

  const filteredTestIds = Array.isArray(testIds)
    ? testIds.filter(
        (t: any) =>
          (t.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.domain ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="tid-container">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — IMAP SCREEN MANAGER
          ══════════════════════════════════════════════════ */}
      <div className="tid-mainbox">
        <br />
        <h1 className="tid-title">
          <b>SCREEN MANAGEMENT</b>
        </h1>
        <div className="tid-blink-bar">
          <b>Delete Screen if not using…</b>
        </div>
        <br />

        <div className="tid-refresh-row">
          <button
            className="tid-refresh-btn"
            onClick={() => refetchScreens()}
            title="Refresh screens"
          >
            ↻
          </button>
        </div>
        <hr className="tid-hr" />

        {/* ─ Create new screen form ─ */}
        <details className="tid-details">
          <summary className="tid-btn-create-screen">
            ▼ CREATE NEW SCREEN
          </summary>
          <div className="tid-create-form">
            {/* Custom searchable dropdown */}
            <div className="tid-dropdown-wrap">
              <div
                className="tid-dropdown-trigger"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                <span className="tid-dropdown-label">
                  {selectedTestIdLabel}
                </span>
                <span className="tid-dropdown-arrow">▾</span>
              </div>
              {dropdownOpen && (
                <div className="tid-dropdown-menu">
                  <input
                    type="text"
                    className="tid-dropdown-search"
                    placeholder="Search Test Id to Create Screen"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    autoFocus
                  />
                  <ul className="tid-dropdown-list">
                    {filteredDropdown.length === 0 ? (
                      <li className="tid-dropdown-empty">No active test IDs</li>
                    ) : (
                      filteredDropdown.map((t: any) => (
                        <li
                          key={t._id}
                          className={`tid-dropdown-item${
                            selectedTestId === t._id ? " selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedTestId(t._id);
                            setDropdownOpen(false);
                            setDropdownSearch("");
                          }}
                        >
                          {t.email}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            <button
              className="tid-btn-start"
              onClick={handleStart}
              disabled={starting || !selectedTestId}
            >
              {starting ? "STARTING…" : "START"}
            </button>
          </div>
        </details>

        <br />

        {/* ─ Running screens table ─ */}
        <div className="tid-table-wrap">
          <table className="tid-table">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>Screen Id</th>
                <th style={{ width: "16%" }}>Screen Name</th>
                <th style={{ width: "8%" }}>Status</th>
                <th style={{ width: "8%" }}>CMD Id</th>
                <th style={{ width: "17%" }}>COMMAND</th>
                <th style={{ width: "15%" }}>DATAFILE NAME</th>
                <th style={{ width: "6%" }}>COUNT</th>
                <th style={{ width: "22%" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {screensLoading ? (
                <tr>
                  <td colSpan={8} className="tid-empty-td">
                    Loading screens…
                  </td>
                </tr>
              ) : Array.isArray(imapScreens) && imapScreens.length > 0 ? (
                imapScreens.map((s: any) => (
                  <tr key={s._id}>
                    <td>{s.screen_id}</td>
                    <td
                      className={
                        s.status === "active"
                          ? "tid-screen-active"
                          : "tid-screen-inactive"
                      }
                    >
                      {s.screen_name}
                    </td>
                    <td>
                      {s.status === "active" ? (
                        <span className="tid-badge-active">ACTIVE</span>
                      ) : (
                        <span className="tid-badge-inactive">INACTIVE</span>
                      )}
                    </td>
                    <td>{s.cmd_id}</td>
                    <td className="tid-cmd-cell">{s.command}</td>
                    <td className="tid-email-cell">{s.datafile_name}</td>
                    <td>
                      <span className="tid-count-badge">{s.count ?? 0}</span>
                    </td>
                    <td>
                      <button
                        className="tid-btn tid-btn-view"
                        onClick={() => setLogScreenEmail(s.datafile_name)}
                      >
                        LOG
                      </button>
                      {s.status === "active" ? (
                        <button
                          className="tid-btn tid-btn-stop"
                          onClick={() => handleStop(s.screen_name)}
                        >
                          STOP Process
                        </button>
                      ) : (
                        <button
                          className="tid-btn tid-btn-edit"
                          onClick={() => handleRestart(s)}
                        >
                          RESTART
                        </button>
                      )}
                      <button
                        className="tid-btn tid-btn-del"
                        onClick={() => handleDeleteScreen(s.screen_name)}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="tid-empty-td">
                    No running IMAP screens found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─ Log viewer ─ */}
        {logScreenEmail && (
          <div className="tid-log-area">
            <div className="tid-log-header">
              <h2 className="tid-log-title">{logScreenEmail}</h2>
              <button
                className="tid-log-back"
                onClick={() => setLogScreenEmail(null)}
              >
                ✕ Close Log
              </button>
            </div>
            <pre className="tid-log-pre">
              {logData?.logs || "Loading logs…"}
            </pre>
          </div>
        )}

        <br />
        <hr className="tid-hr" />
        <br />
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — TEST IDs CRUD MANAGEMENT
          ══════════════════════════════════════════════════ */}
      <div className="tid-mainbox" style={{ marginTop: 20 }}>
        <br />
        <h1 className="tid-title">
          <b>TEST IDs MANAGEMENT</b>
        </h1>

        <div className="tid-header-bar">
          <button className="tid-btn-add" onClick={openAdd}>
            ＋ ADD NEW TEST ID
          </button>
          <div className="tid-search-wrap">
            <label className="tid-search-label">Search:</label>
            <input
              type="text"
              className="tid-search-input"
              placeholder="Email / Domain…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="tid-refresh-btn"
            onClick={() => refetchTestIds()}
            title="Refresh test IDs"
            style={{ fontSize: 18 }}
          >
            ↻ Refresh
          </button>
        </div>

        <hr className="tid-hr" />

        <div className="tid-table-wrap">
          <table className="tid-table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "20%" }}>EMAIL</th>
                <th style={{ width: "13%" }}>DOMAIN</th>
                <th style={{ width: "8%" }}>STATUS</th>
                <th style={{ width: "17%" }}>INBOX FILE</th>
                <th style={{ width: "17%" }}>SPAM FILE</th>
                <th style={{ width: "6%" }}>PORT</th>
                <th style={{ width: "14%" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestIds.length > 0 ? (
                filteredTestIds.map((item: any, idx: number) => (
                  <tr key={item._id}>
                    <td>{idx + 1}</td>
                    <td className="tid-email-cell">{item.email}</td>
                    <td>{item.domain}</td>
                    <td>
                      {item.status === "A" ? (
                        <span className="tid-badge-active">ACTIVE</span>
                      ) : (
                        <span className="tid-badge-inactive">INACTIVE</span>
                      )}
                    </td>
                    <td className="tid-file-cell">
                      {item.filenameinbox || "—"}
                    </td>
                    <td className="tid-file-cell">
                      {item.filenamespam || "—"}
                    </td>
                    <td>{item.port}</td>
                    <td>
                      <button
                        className="tid-btn tid-btn-edit"
                        onClick={() => openEdit(item)}
                      >
                        EDIT
                      </button>
                      <button
                        className="tid-btn tid-btn-view"
                        onClick={() => openView(item)}
                      >
                        VIEW
                      </button>
                      <button
                        className="tid-btn tid-btn-del"
                        onClick={() => handleDeleteTestId(item._id, item.email)}
                      >
                        DEL
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="tid-empty-td">
                    {searchTerm
                      ? "No matching test IDs."
                      : "No test IDs in the database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="tid-count-bar">
          Total: <strong>{filteredTestIds.length}</strong> test ID
          {filteredTestIds.length !== 1 ? "s" : ""}
        </div>

        <br />
        <hr className="tid-hr" />
        <br />
      </div>

      {/* ─── Add / Edit Modal ───────────────────────────── */}
      {showModal && (
        <div
          className="tid-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="tid-modal">
            <div className="tid-modal-header">
              <h4>{formData._id ? "✏️ Edit Test ID" : "➕ Add Test ID"}</h4>
              <button
                className="tid-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="tid-modal-body">
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="tid-form-grid">
                  {(
                    [
                      ["domain", "Domain", "e.g. YAHOO"],
                      ["email", "Email ID", "user@yahoo.com"],
                      ["password", "Password", "App password"],
                      [
                        "inboxhostname",
                        "Inbox Hostname",
                        "{imap.mail.yahoo.com}",
                      ],
                      [
                        "spamhostname",
                        "Spam Hostname",
                        "{imap.mail.yahoo.com}",
                      ],
                      ["port", "Port", "993"],
                    ] as [string, string, string][]
                  ).map(([name, label, placeholder]) => (
                    <div className="tid-form-group" key={name}>
                      <label>{label}</label>
                      <input
                        type="text"
                        name={name}
                        className="tid-input"
                        placeholder={placeholder}
                        value={(formData as any)[name]}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                  <div className="tid-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      className="tid-input"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="A">Active</option>
                      <option value="D">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="tid-modal-actions">
                  <button
                    type="submit"
                    className="tid-btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving…"
                      : formData._id
                        ? "UPDATE"
                        : "INSERT"}
                  </button>
                  <button
                    type="button"
                    className="tid-btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ─────────────────────────────────── */}
      {viewModal && selectedItem && (
        <div
          className="tid-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModal(false);
          }}
        >
          <div className="tid-modal tid-modal-view">
            <div className="tid-modal-header">
              <h4>🔍 Test ID Details</h4>
              <button
                className="tid-modal-close"
                onClick={() => setViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="tid-modal-body">
              <table className="tid-view-table">
                <tbody>
                  {(
                    [
                      ["Domain", selectedItem.domain],
                      ["Email ID", selectedItem.email],
                      ["Password", selectedItem.password],
                      ["Inbox Hostname", selectedItem.inboxhostname],
                      ["Spam Hostname", selectedItem.spamhostname],
                      ["Port", selectedItem.port],
                      [
                        "Status",
                        selectedItem.status === "A" ? (
                          <span className="tid-badge-active">ACTIVE</span>
                        ) : (
                          <span className="tid-badge-inactive">INACTIVE</span>
                        ),
                      ],
                      ["Inbox File", selectedItem.filenameinbox || "—"],
                      ["Spam File", selectedItem.filenamespam || "—"],
                    ] as [string, React.ReactNode][]
                  ).map(([label, value]) => (
                    <tr key={String(label)}>
                      <td className="tid-view-label">{label}</td>
                      <td className="tid-view-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tid-modal-footer">
              <button
                className="tid-btn-cancel"
                onClick={() => setViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestidsScreen;
