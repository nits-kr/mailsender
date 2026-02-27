import React, { useState } from "react";
import {
  useGetOffersQuery,
  useGetServersManagementQuery,
  useCreateLinkMutation,
} from "../store/apiSlice";
import {
  Edit,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  Search,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AllOffers.css";

const AllOffers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: offers = [], isLoading: loading } = useGetOffersQuery();
  const { data: servers = [] } = useGetServersManagementQuery();
  const [createLink, { isLoading: creatingLink }] = useCreateLinkMutation();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [linkData, setLinkData] = useState({
    domain: "",
    link_type: "Sub",
    own_offerid: "",
    pattern: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const allIps = servers.flatMap((s: any) => {
    const serverIp = s.ip;
    const additionalIps = (s.ips || []).map((ipObj: any) => ipObj.ip);
    return [serverIp, ...additionalIps];
  });

  const generatePattern = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleOpenModal = (offer: any) => {
    setSelectedOffer(offer);
    const pattern = generatePattern();
    setLinkData({
      domain: allIps[0] || "",
      link_type: "Sub",
      own_offerid: `${offer.offer_id}-${pattern}`,
      pattern: pattern,
    });
    setModalOpen(true);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const getMainLink = () => {
    if (!selectedOffer) return "";
    switch (linkData.link_type) {
      case "Sub":
        return selectedOffer.sub_url;
      case "Unsub":
        return selectedOffer.unsub_url;
      case "Open":
        return selectedOffer.open_url;
      case "Opt-out":
        return selectedOffer.opt_out_url;
      default:
        return "";
    }
  };

  const handleCreateLink = async () => {
    if (!linkData.domain || !linkData.pattern || !linkData.own_offerid) {
      setErrorMsg("Please fill all required fields");
      return;
    }

    try {
      const main_link = getMainLink();
      const generated_link = `http://${linkData.domain}/${linkData.pattern}`;

      await createLink({
        offer_master_id: selectedOffer._id,
        domain: linkData.domain,
        link_type: linkData.link_type,
        own_offerid: linkData.own_offerid,
        pattern: linkData.pattern,
        main_link,
        generated_link,
      }).unwrap();

      setSuccessMsg("Link created successfully!");
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to create link");
    }
  };

  const filteredOffers = Array.isArray(offers)
    ? offers.filter(
        (offer) =>
          offer.offer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.offer_id?.toString().includes(searchTerm) ||
          offer.affiliate?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

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
        <div
          style={{
            backgroundColor: "#337ab7",
            color: "white",
            padding: "10px",
            borderRadius: "4px 4px 0 0",
            maxWidth: "1200px",
            border: "1px solid #2e6da4",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              fontFamily: "Lucida Console, Courier, monospace",
            }}
          >
            ALL OFFER PORTAL
          </h2>
        </div>
      </center>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          border: "1px solid #337ab7",
          padding: "15px",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "250px",
              }}
            />
          </div>
          <button
            onClick={() => navigate("/offers")}
            style={{
              backgroundColor: "#5cb85c",
              color: "white",
              border: "1px solid #4cae4c",
              padding: "5px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Plus size={14} /> ADD OFFER
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "cadetblue", color: "white" }}>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                O.M.ID
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                AFFILIATE
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                OFFER ID
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                OFFER NAME
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                PAYOUT
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                SENSITIVE
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                ACTION
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                CREATE LINK
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  <Loader2
                    className="animate-spin"
                    style={{ margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : filteredOffers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No offers found.
                </td>
              </tr>
            ) : (
              filteredOffers.map((offer, index) => (
                <tr
                  key={offer._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                  }}
                >
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {offer._id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {offer.affiliate}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {offer.offer_id}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {offer.offer_name}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ${offer.payout}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {offer.sensitive === "1" ? "Yes" : "No"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => navigate(`/offers?id=${offer._id}`)}
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#f0ad4e",
                        border: "1px solid #eea236",
                        color: "white",
                        cursor: "pointer",
                        borderRadius: "3px",
                      }}
                    >
                      Edit
                    </button>
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => handleOpenModal(offer)}
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#5cb85c",
                        border: "1px solid #4cae4c",
                        color: "white",
                        cursor: "pointer",
                        borderRadius: "3px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        margin: "0 auto",
                      }}
                    >
                      <LinkIcon size={12} /> Create Link
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphism">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <LinkIcon size={20} className="text-blue-400" />
                <h3>CREATE TRACKING LINK</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {successMsg && (
                <div className="alert-success">
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="alert-error">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <div className="offer-info-card">
                <div className="info-row">
                  <span className="label">Offer:</span>
                  <span className="value">{selectedOffer?.offer_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Offer ID:</span>
                  <span className="value">{selectedOffer?.offer_id}</span>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Domain</label>
                  <select
                    value={linkData.domain}
                    onChange={(e) =>
                      setLinkData({ ...linkData, domain: e.target.value })
                    }
                  >
                    {allIps.map((ip: string) => (
                      <option key={ip} value={ip}>
                        {ip}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Link Type</label>
                  <select
                    value={linkData.link_type}
                    onChange={(e) =>
                      setLinkData({ ...linkData, link_type: e.target.value })
                    }
                  >
                    <option value="Sub">Sub (Click)</option>
                    <option value="Unsub">Unsub</option>
                    <option value="Open">Open (Pixel)</option>
                    <option value="Opt-out">Opt-out</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Own OfferID (Unique Reference)</label>
                  <input
                    type="text"
                    value={linkData.own_offerid}
                    onChange={(e) =>
                      setLinkData({ ...linkData, own_offerid: e.target.value })
                    }
                    placeholder="e.g. OFFER1-XYZ"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Pattern (URL Slug)</label>
                  <div className="pattern-input-group">
                    <input
                      type="text"
                      value={linkData.pattern}
                      onChange={(e) =>
                        setLinkData({ ...linkData, pattern: e.target.value })
                      }
                      placeholder="e.g. x8j2kL"
                    />
                    <button
                      className="regen-btn"
                      onClick={() => {
                        const p = generatePattern();
                        setLinkData({
                          ...linkData,
                          pattern: p,
                          own_offerid: `${selectedOffer?.offer_id}-${p}`,
                        });
                      }}
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>

              <div className="preview-section">
                <label>Generated Link Preview</label>
                <div className="preview-box">
                  <code>{`http://${linkData.domain || "domain"}/${linkData.pattern || "pattern"}`}</code>
                </div>
                <p className="redirect-hint">
                  Will redirect to: <span>{getMainLink()}</span>
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                onClick={handleCreateLink}
                disabled={creatingLink}
              >
                {creatingLink ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Link"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOffers;
