import React from "react";
import {
  useGetIntelligenceStatsQuery,
  useGetIpHealthQuery,
  useGetDomainHealthQuery,
} from "../store/apiSlice";
import {
  Activity,
  ShieldCheck,
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Server,
} from "lucide-react";
import "./IntelligenceDashboard.css";

const IntelligenceDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } =
    useGetIntelligenceStatsQuery();
  const { data: ipHealth, isLoading: ipLoading } = useGetIpHealthQuery();
  const { data: domainHealth, isLoading: domainLoading } =
    useGetDomainHealthQuery();

  if (statsLoading || ipLoading || domainLoading) {
    return (
      <div className="intelligence-loading">
        Loading Intelligence Engine Data...
      </div>
    );
  }

  return (
    <div className="intelligence-container">
      <header className="intelligence-header">
        <div className="header-left">
          <h1>
            <Activity /> Inbox Intelligence Engine
          </h1>
          <p>
            Real-time delivery quality & infrastructure reputation monitoring
          </p>
        </div>
        <div className="engine-status healthy">
          <ShieldCheck /> Engine Active
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon inbox-rate">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <h3>Global Inbox Rate</h3>
            <span className="stat-value">
              {stats?.globalInboxRate || "0.00"}%
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total-tests">
            <Activity />
          </div>
          <div className="stat-info">
            <h3>Continuous Tests</h3>
            <span className="stat-value">{stats?.totalTests || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon risky-assets">
            <AlertTriangle />
          </div>
          <div className="stat-info">
            <h3>Risky Assets</h3>
            <span className="stat-value">{stats?.riskyAssets || 0}</span>
          </div>
        </div>
      </div>

      <div className="health-section">
        <div className="health-column">
          <div className="health-card">
            <h2>
              <Server /> IP Health Reputation
            </h2>
            <div className="health-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Inbox Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ipHealth?.length ? (
                    ipHealth.map((ip: any) => (
                      <tr key={ip.assetValue}>
                        <td>{ip.assetValue}</td>
                        <td>
                          <div className="score-bar-bg">
                            <div
                              className="score-bar-fill"
                              style={{ width: `${ip.inboxScore}%` }}
                            ></div>
                          </div>
                          <span className="score-text">
                            {ip.inboxScore.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${ip.status}`}>
                            {ip.status === "healthy" ? (
                              <CheckCircle />
                            ) : (
                              <AlertTriangle />
                            )}{" "}
                            {ip.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty-row">
                        No IP metrics available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="health-column">
          <div className="health-card">
            <h2>
              <Globe /> Domain Health Reputation
            </h2>
            <div className="health-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Inbox Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {domainHealth?.length ? (
                    domainHealth.map((dom: any) => (
                      <tr key={dom.assetValue}>
                        <td>{dom.assetValue}</td>
                        <td>
                          <div className="score-bar-bg">
                            <div
                              className="score-bar-fill"
                              style={{ width: `${dom.inboxScore}%` }}
                            ></div>
                          </div>
                          <span className="score-text">
                            {dom.inboxScore.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${dom.status}`}>
                            {dom.status === "healthy" ? (
                              <CheckCircle />
                            ) : (
                              <AlertTriangle />
                            )}{" "}
                            {dom.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty-row">
                        No domain metrics available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceDashboard;
