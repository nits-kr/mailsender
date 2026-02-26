import React, { useState, useEffect } from "react";
import {
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
} from "../store/apiSlice";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editId = query.get("id");

  const [formData, setFormData] = useState({
    affiliate: "Choose...",
    offer_name: "",
    offer_id: "",
    payout: "",
    sub_url: "",
    unsub_url: "",
    open_url: "",
    opt_out_url: "",
    sensitive: "Choose...",
    from_name: "",
    subject: "",
    restrictions: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: offers = [] } = useGetOffersQuery();
  const [createOffer] = useCreateOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();

  useEffect(() => {
    if (editId && offers.length > 0) {
      const offerToEdit = offers.find((o: any) => o._id === editId);
      if (offerToEdit) {
        setFormData({
          affiliate: offerToEdit.affiliate,
          offer_name: offerToEdit.offer_name,
          offer_id: offerToEdit.offer_id,
          payout: offerToEdit.payout,
          sub_url: offerToEdit.sub_url,
          unsub_url: offerToEdit.unsub_url,
          open_url: offerToEdit.open_url,
          opt_out_url: offerToEdit.opt_out_url,
          sensitive: offerToEdit.sensitive || "Choose...",
          from_name: offerToEdit.from_name,
          subject: offerToEdit.subject,
          restrictions: offerToEdit.restrictions,
        });
      }
    }
  }, [editId, offers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.affiliate === "Choose...") return setError("Select Affiliate");
    if (formData.sensitive === "Choose...")
      return setError("Select Sensitivity");

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      if (editId) {
        await updateOffer({ id: editId, ...formData }).unwrap();
        setSuccess("Offer updated successfully!");
      } else {
        await createOffer(formData).unwrap();
        setSuccess("Offer added successfully!");
        setFormData({
          affiliate: "Choose...",
          offer_name: "",
          offer_id: "",
          payout: "",
          sub_url: "",
          unsub_url: "",
          open_url: "",
          opt_out_url: "",
          sensitive: "Choose...",
          from_name: "",
          subject: "",
          restrictions: "",
        });
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Error processing offer");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
    fontSize: "12px",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "12px",
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f8ff",
        minHeight: "100vh",
        padding: "20px",
        color: "black",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <center>
        <div
          style={{
            backgroundColor: "#337ab7",
            color: "white",
            padding: "10px",
            borderRadius: "4px 4px 0 0",
            maxWidth: "1000px",
            border: "1px solid #2e6da4",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <button
            onClick={() => navigate("/all-offers")}
            style={{
              position: "absolute",
              left: "15px",
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
            }}
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              fontFamily: "Lucida Console, Courier, monospace",
            }}
          >
            OFFER {editId ? "UPDATE" : "ADD"} PORTAL
          </h2>
        </div>
      </center>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: "white",
          border: "1px solid #337ab7",
          padding: "25px",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Row 1: Affiliate */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Affiliate Name</label>
            <select
              name="affiliate"
              value={formData.affiliate}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Choose...">Choose...</option>
              <option value="OB MEDIA">OB MEDIA</option>
              <option value="HASTRAFFIC">HASTRAFFIC</option>
              <option value="SKENZO">SKENZO</option>
              <option value="INSTAR">INSTAR</option>
              <option value="W4">W4</option>
              <option value="GWM">GWM</option>
              <option value="MADRIO">MADRIO</option>
              <option value="B2D">B2D</option>
              <option value="MINT GLOBAL">MINT GLOBAL</option>
              <option value="CONCISE">CONCISE</option>
              <option value="AC">AC</option>
              <option value="IDRIVE">IDRIVE</option>
              <option value="AD1">AD1</option>
              <option value="PUD">PureAds</option>
            </select>
          </div>

          {/* Row 2: Name, ID, Payout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>Affiliate Offer Name</label>
              <input
                type="text"
                name="offer_name"
                value={formData.offer_name}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Name Of Offer"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer ID</label>
              <input
                type="text"
                name="offer_id"
                value={formData.offer_id}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Affiliate Offer id"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer Payout</label>
              <input
                type="text"
                name="payout"
                value={formData.payout}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Affiliate payout"
              />
            </div>
          </div>

          {/* Row 3: Sub URL, Unsub URL */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>Affiliate Offer Sub URL</label>
              <input
                type="text"
                name="sub_url"
                value={formData.sub_url}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Affiliate Sub Url"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer Unsub URL</label>
              <input
                type="text"
                name="unsub_url"
                value={formData.unsub_url}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Affiliate UnSub Url"
              />
            </div>
          </div>

          {/* Row 4: Open URL, Opt Out, Sensitive */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>Affiliate Offer Open URL</label>
              <input
                type="text"
                name="open_url"
                value={formData.open_url}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Affiliate Open Url"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer Opt Out URL</label>
              <input
                type="text"
                name="opt_out_url"
                value={formData.opt_out_url}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Affiliate Opt Out Url"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer Sensitive</label>
              <select
                name="sensitive"
                value={formData.sensitive}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Choose...">Choose...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          {/* Row 5: Textareas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div>
              <label style={labelStyle}>Affiliate Offer From names</label>
              <textarea
                name="from_name"
                value={formData.from_name}
                onChange={handleChange}
                style={{ ...inputStyle, height: "150px" }}
                placeholder="Affiliate Offer From Names"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer Subject Lines</label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{ ...inputStyle, height: "150px" }}
                placeholder="Affiliate Offer Subjects"
              />
            </div>
            <div>
              <label style={labelStyle}>Affiliate Offer Restrictions</label>
              <textarea
                name="restrictions"
                value={formData.restrictions}
                onChange={handleChange}
                style={{ ...inputStyle, height: "150px" }}
                placeholder="Affiliate Offer Restrictions"
              />
            </div>
          </div>

          <center>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#337ab7",
                color: "white",
                border: "1px solid #2e6da4",
                padding: "10px 40px",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {editId ? "UPDATE OFFER" : "ADD OFFER"}
            </button>
            <div style={{ marginTop: "15px" }}>
              {success && (
                <div
                  style={{
                    color: "#3c763d",
                    backgroundColor: "#dff0d8",
                    border: "1px solid #d6e9c6",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                >
                  {success}
                </div>
              )}
              {error && (
                <div
                  style={{
                    color: "#a94442",
                    backgroundColor: "#f2dede",
                    border: "1px solid #ebccd1",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </center>
        </form>
      </div>
    </div>
  );
};

export default Offers;
