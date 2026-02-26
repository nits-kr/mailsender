import React, { useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  Globe,
  Layout,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useUploadImageMutation } from "../store/apiSlice";

const ImagePortal: React.FC = () => {
  const [domain, setDomain] = useState("");
  const [pattern, setPattern] = useState("/bottoms/of/the/link/");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [uploadImage, { isLoading: loading }] = useUploadImageMutation();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !pattern || !file) {
      setResult({
        type: "error",
        message: "Please provide domain, pattern, and select an image.",
      });
      return;
    }

    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("domain", domain);
    formData.append("pattern", pattern);

    try {
      const response = await uploadImage(formData).unwrap();
      setResult({
        type: "success",
        message: `Upload Successful! Link: ${response.imageLink}`,
      });
    } catch (error: any) {
      setResult({
        type: "error",
        message:
          error?.data?.message || error?.message || "Error uploading image",
      });
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
      }}
    >
      <center>
        <div
          style={{
            backgroundColor: "#337ab7",
            color: "white",
            padding: "10px",
            borderRadius: "4px 4px 0 0",
            maxWidth: "900px",
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
            IMAGE UPLOAD PORTAL (Sentora)
          </h2>
        </div>
      </center>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "white",
          border: "1px solid #337ab7",
          padding: "20px",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "5px",
                fontSize: "12px",
              }}
            >
              Domain
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
                placeholder="http://domain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
              >
                Pattern
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
                placeholder="/pattern/of/the/link/"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
              >
                Select Image
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "5px",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ fontSize: "12px" }}
                />
              </div>
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
                padding: "8px 25px",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              UPLOAD
            </button>
          </center>
        </form>

        {result && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor:
                result.type === "success" ? "#dff0d8" : "#f2dede",
              color: result.type === "success" ? "#3c763d" : "#a94442",
              border: `1px solid ${result.type === "success" ? "#d6e9c6" : "#ebccd1"}`,
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {result.type === "success" ? (
              <CheckCircle2
                size={16}
                style={{ verticalAlign: "middle", marginRight: "5px" }}
              />
            ) : (
              <AlertCircle
                size={16}
                style={{ verticalAlign: "middle", marginRight: "5px" }}
              />
            )}
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePortal;
