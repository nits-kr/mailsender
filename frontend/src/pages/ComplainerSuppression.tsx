import React, { useState, useEffect } from "react";
import {
  useGetOffersQuery,
  useGetSuppressionComplainersGroupedQuery,
  useUploadSuppressionMutation, // Assuming these might be needed if shared
  useCreateSuppressionComplainerMutation,
  useDeleteSuppressionComplainerMutation,
} from "../store/apiSlice";
import API_BASE_URL from "../config/api";
import "./ComplainerSuppression.css";
import {
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Mail,
  PlusCircle,
  ShieldAlert,
  UserPlus,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";

interface Offer {
  _id: string;
  offer_id: string;
  offer_name: string;
  affiliate: string;
}

interface GroupedComplainer {
  offer_id: string;
  count: number;
  offer_name: string;
  affiliate: string;
  offer_id_label: string;
}

interface IndividualComplainer {
  _id: string;
  email_id: string;
  date_inserted: string;
}

const ComplainerSuppression: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedComplainer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [offerEmails, setOfferEmails] = useState<
    Record<string, IndividualComplainer[]>
  >({});
  const [fetchingEmails, setFetchingEmails] = useState<Record<string, boolean>>(
    {},
  );

  const { data: offersData = [] } = useGetOffersQuery();
  const { data: groupedDataRes = [], refetch: refetchGrouped } =
    useGetSuppressionComplainersGroupedQuery();

  const [createSuppressionComplainer] =
    useCreateSuppressionComplainerMutation();
  const [deleteSuppressionComplainer] =
    useDeleteSuppressionComplainerMutation();

  useEffect(() => {
    setOffers(offersData);
    setGroupedData(groupedDataRes);
  }, [offersData, groupedDataRes]);

  const handleAddComplainers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer || !emailsRaw.trim()) return;

    setLoading(true);
    try {
      await createSuppressionComplainer({
        offer_id: selectedOffer,
        emails: emailsRaw,
      }).unwrap();
      setEmailsRaw("");
      setSelectedOffer("");
      await refetchGrouped();
      alert("Complainers added successfully");
    } catch (error: any) {
      alert(
        error?.data?.message || error?.message || "Error adding complainers",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = async (offer_id: string) => {
    const isExpanded = !!expandedRows[offer_id];
    setExpandedRows((prev) => ({ ...prev, [offer_id]: !isExpanded }));

    if (!isExpanded && !offerEmails[offer_id]) {
      setFetchingEmails((prev) => ({ ...prev, [offer_id]: true }));
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/suppression/complainers/offer/${offer_id}`,
        );
        const data = await res.json();
        setOfferEmails((prev) => ({ ...prev, [offer_id]: data }));
      } catch (error) {
        console.error("Error fetching offer emails:", error);
      } finally {
        setFetchingEmails((prev) => ({ ...prev, [offer_id]: false }));
      }
    }
  };

  const handleDeleteEmail = async (offer_id: string, id: string) => {
    if (!window.confirm("Are you sure you want to remove this email?")) return;

    try {
      await deleteSuppressionComplainer(id).unwrap();
      setOfferEmails((prev) => ({
        ...prev,
        [offer_id]: (Array.isArray(prev[offer_id])
          ? prev[offer_id]
          : []
        ).filter((e) => e._id !== id),
      }));
      // Update grouped count locally
      setGroupedData((prev) =>
        prev.map((item) =>
          item.offer_id === offer_id
            ? { ...item, count: item.count - 1 }
            : item,
        ),
      );
    } catch (error) {
      alert("Error deleting email");
    }
  };

  return (
    <div className="cs-container">
      <div className="cs-header">
        <h1>
          <ShieldAlert size={28} className="text-blue-600" />
          Complainer Suppression Email Management Portal
        </h1>
      </div>

      <div className="cs-main-content">
        {/* ADD COMPLAINER FORM */}
        <div className="cs-section">
          <h2>
            <UserPlus size={18} />
            Add New Complainers
          </h2>
          <form onSubmit={handleAddComplainers} className="cs-form">
            <div className="cs-form-group">
              <label className="cs-label">Select Offer :</label>
              <select
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
                required
                className="cs-select"
              >
                <option value="">-- Select Offer --</option>
                {Array.isArray(offers) &&
                  offers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.affiliate} | {o.offer_id} | {o.offer_name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="cs-form-group">
              <label className="cs-label">Complainer Email ID(s):</label>
              <textarea
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                placeholder="Enter one or more email addresses, separated by comma or new line"
                required
                className="cs-textarea"
              />
            </div>

            <div className="cs-submit-container">
              <button
                type="submit"
                disabled={loading}
                className="cs-submit-btn"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Activity size={18} />
                )}
                {loading ? "Adding to List..." : "Add to Suppression List"}
              </button>
            </div>
          </form>
        </div>

        {/* SUPPRESSION LIST TABLE */}
        <div className="cs-section">
          <h2>
            <Database size={18} />
            Suppression History
          </h2>
          <div className="cs-table-wrapper">
            <table className="cs-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}></th>
                  <th>Affiliate</th>
                  <th>Offer Name</th>
                  <th style={{ width: "120px", textAlign: "center" }}>
                    Email Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(groupedData) ? groupedData : []).map((row) => (
                  <React.Fragment key={row.offer_id}>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => toggleRow(row.offer_id)}
                          className="cs-expand-btn"
                        >
                          {expandedRows[row.offer_id] ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                      </td>
                      <td>
                        <span style={{ color: "#64748b", fontWeight: "600" }}>
                          {row.affiliate}
                        </span>
                      </td>
                      <td style={{ fontWeight: "700", color: "#0f172a" }}>
                        {row.offer_name}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            backgroundColor: "#f1f5f9",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#334155",
                          }}
                        >
                          {row.count}
                        </span>
                      </td>
                    </tr>
                    {expandedRows[row.offer_id] && (
                      <tr className="cs-email-row">
                        <td colSpan={4}>
                          <div className="cs-nested-content">
                            {fetchingEmails[row.offer_id] ? (
                              <div className="cs-loader">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Fetching emails...</span>
                              </div>
                            ) : (
                              <div
                                style={{
                                  maxHeight: "300px",
                                  overflowY: "auto",
                                }}
                              >
                                <table className="cs-email-table">
                                  <tbody>
                                    {(Array.isArray(offerEmails[row.offer_id])
                                      ? offerEmails[row.offer_id]
                                      : []
                                    ).map((email, idx) => (
                                      <tr
                                        key={email._id}
                                        className="cs-email-item"
                                      >
                                        <td>
                                          <Mail
                                            size={14}
                                            style={{
                                              marginRight: "10px",
                                              verticalAlign: "middle",
                                              color: "#94a3b8",
                                            }}
                                          />
                                          {email.email_id}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          <button
                                            onClick={() =>
                                              handleDeleteEmail(
                                                row.offer_id,
                                                email._id,
                                              )
                                            }
                                            className="cs-delete-btn"
                                            title="Delete email"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    {(!offerEmails[row.offer_id] ||
                                      offerEmails[row.offer_id].length ===
                                        0) && (
                                      <tr>
                                        <td colSpan={2} className="cs-empty">
                                          No emails found for this offer
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {(Array.isArray(groupedData)
                  ? groupedData.length === 0
                  : true) && (
                  <tr>
                    <td colSpan={4} className="cs-empty">
                      No suppression data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplainerSuppression;
