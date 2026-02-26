import React, { useState } from "react";
import {
  useGetLinksQuery,
  useToggleLinkStatusMutation,
  useUpdateMainLinkMutation,
} from "../store/apiSlice";
import {
  Loader2,
  Search,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const AllLinks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: links = [], isLoading: loading } = useGetLinksQuery();
  const [toggleLinkStatus] = useToggleLinkStatusMutation();
  const [updateMainLink] = useUpdateMainLinkMutation();

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleLinkStatus(id).unwrap();
    } catch (error) {
      console.error("Error toggling link status", error);
    }
  };

  const handleUpdateMainLink = async (id: string, newLink: string) => {
    try {
      await updateMainLink({ id, main_link: newLink }).unwrap();
      console.log("Main link updated successfully");
    } catch (error) {
      console.error("Error updating main link", error);
    }
  };

  const filteredLinks = Array.isArray(links)
    ? links.filter(
        (link) =>
          link.own_offerid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.pattern?.toLowerCase().includes(searchTerm.toLowerCase()),
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
            ALL LINK PORTAL
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
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Search size={14} />
          <input
            type="text"
            placeholder="Search links..."
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

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "cadetblue", color: "white" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>S-NO</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                OM-ID
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>O-ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                DOMAIN
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                LINK TYPE
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                PATTERN
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                REDIRECT LINK
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                GEN. LINK
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  <Loader2
                    className="animate-spin"
                    style={{ margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : filteredLinks.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No links found.
                </td>
              </tr>
            ) : (
              filteredLinks.map((link, index) => (
                <tr
                  key={link._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                  }}
                >
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {index + 1}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {link.offer_master_id?._id.slice(-6).toUpperCase() || "N/A"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {link.own_offerid}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {link.domain}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {link.link_type}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {link.pattern}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      defaultValue={link.main_link}
                      onBlur={(e) =>
                        handleUpdateMainLink(link._id, e.target.value)
                      }
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                      }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {link.generated_link}
                      </span>
                      <a
                        href={link.generated_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      onClick={() => handleToggleStatus(link._id)}
                      style={{
                        cursor: "pointer",
                        color: link.status === 1 ? "#5cb85c" : "#d9534f",
                      }}
                    >
                      {link.status === 1 ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllLinks;
