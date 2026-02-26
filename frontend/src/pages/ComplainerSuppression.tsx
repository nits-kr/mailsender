import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Mail,
  PlusCircle,
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [offersRes, groupedRes] = await Promise.all([
        axios.get("/api/offers"),
        axios.get("/api/suppression/complainers/grouped"),
      ]);
      setOffers(offersRes.data);
      setGroupedData(groupedRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddComplainers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer || !emailsRaw.trim()) return;

    setLoading(true);
    try {
      await axios.post("/api/suppression/complainers", {
        offer_id: selectedOffer,
        emails: emailsRaw,
      });
      setEmailsRaw("");
      setSelectedOffer("");
      await fetchInitialData();
      alert("Complainers added successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error adding complainers");
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
        const res = await axios.get(
          `/api/suppression/complainers/offer/${offer_id}`,
        );
        setOfferEmails((prev) => ({ ...prev, [offer_id]: res.data }));
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
      await axios.delete(`/api/suppression/complainers/${id}`);
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
    <div
      style={{
        backgroundColor: "#f0f8ff",
        minHeight: "100vh",
        padding: "20px",
        color: "black",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
      }}
    >
      <center>
        <h1
          style={{
            fontWeight: "bold",
            fontSize: "18px",
            color: "#333",
            marginBottom: "20px",
          }}
        >
          Complainer Suppression Email Management Portal
        </h1>
      </center>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* ADD COMPLAINER FORM */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid black",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "30px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <form onSubmit={handleAddComplainers}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <label
                  style={{
                    fontWeight: "bold",
                    width: "150px",
                    textAlign: "right",
                  }}
                >
                  Select Offer :
                </label>
                <select
                  value={selectedOffer}
                  onChange={(e) => setSelectedOffer(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "5px",
                    border: "1px solid #767676",
                    borderRadius: "2px",
                    backgroundColor: "#fff",
                  }}
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

              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label style={{ fontWeight: "bold", marginLeft: "165px" }}>
                  Complainer Email ID(s):
                </label>
                <div
                  style={{ display: "flex", gap: "15px", alignItems: "start" }}
                >
                  <div style={{ width: "150px" }} />
                  <textarea
                    value={emailsRaw}
                    onChange={(e) => setEmailsRaw(e.target.value)}
                    placeholder="Enter one or more email addresses, separated by comma or new line"
                    required
                    style={{
                      flex: 1,
                      height: "100px",
                      padding: "8px",
                      border: "1px solid #767676",
                      borderRadius: "2px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    fontWeight: "bold",
                    padding: "8px 40px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Add to Suppression List
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* SUPPRESSION LIST TABLE */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid black",
            padding: "15px",
            borderRadius: "4px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "15px",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
            }}
          >
            Suppression List
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#add8e6", color: "black" }}>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    width: "40px",
                  }}
                ></th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Affiliate
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Offer Name
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "100px",
                  }}
                >
                  Email Count
                </th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(groupedData) ? groupedData : []).map((row) => (
                <React.Fragment key={row.offer_id}>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => toggleRow(row.offer_id)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#007bff",
                        }}
                      >
                        {expandedRows[row.offer_id] ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      {row.affiliate}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      {row.offer_name}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {row.count}
                    </td>
                  </tr>
                  {expandedRows[row.offer_id] && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          border: "1px solid black",
                          padding: "0",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <div style={{ padding: "10px 40px" }}>
                          {fetchingEmails[row.offer_id] ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "10px",
                              }}
                            >
                              <Loader2 size={12} className="animate-spin" />{" "}
                              Loading emails...
                            </div>
                          ) : (
                            <div
                              style={{ maxHeight: "200px", overflowY: "auto" }}
                            >
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                }}
                              >
                                <tbody>
                                  {(Array.isArray(offerEmails[row.offer_id])
                                    ? offerEmails[row.offer_id]
                                    : []
                                  ).map((email) => (
                                    <tr
                                      key={email._id}
                                      style={{ borderBottom: "1px solid #eee" }}
                                    >
                                      <td
                                        style={{
                                          padding: "5px 0",
                                          fontSize: "12px",
                                        }}
                                      >
                                        {email.email_id}
                                      </td>
                                      <td
                                        style={{
                                          padding: "5px 0",
                                          textAlign: "right",
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            handleDeleteEmail(
                                              row.offer_id,
                                              email._id,
                                            )
                                          }
                                          style={{
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            color: "#dc3545",
                                          }}
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {(!offerEmails[row.offer_id] ||
                                    offerEmails[row.offer_id].length === 0) && (
                                    <tr>
                                      <td
                                        colSpan={2}
                                        style={{
                                          padding: "10px",
                                          textAlign: "center",
                                          color: "#666",
                                        }}
                                      >
                                        No emails found
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
                  <td
                    colSpan={4}
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    No suppression data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplainerSuppression;
