import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Credentials from "./pages/Credentials";
import DataCount from "./pages/DataCount";
import Interface from "./pages/Interface";
import Offers from "./pages/Offers";
import Suppression from "./pages/Suppression";
import ComplainerSuppression from "./pages/ComplainerSuppression";
import AllOffers from "./pages/AllOffers";
import AllLinks from "./pages/AllLinks";
import ImagePortal from "./pages/ImagePortal";
import ServerSetup from "./pages/ServerSetup";
import ServerSetupUbuntu from "./pages/ServerSetupUbuntu";
import SendingIpSetup from "./pages/SendingIpSetup";
import DataDownload from "./pages/DataDownload";
import DataUpload from "./pages/DataUpload";
import DataSplit from "./pages/DataSplit";
import DataMerge from "./pages/DataMerge";
import BounceFetch from "./pages/BounceFetch";
import BounceUpdate from "./pages/BounceUpdate";
import ComplainUpdate from "./pages/ComplainUpdate";
import ComplainFetch from "./pages/ComplainFetch";
import DataAnalytics from "./pages/DataAnalytics";
import DataDelete from "./pages/DataDelete";
import Screen from "./pages/Screen";
import ScreenLogPage from "./pages/ScreenLogPage";
import TestidsScreen from "./pages/TestidsScreen";
import TestidsMailbox from "./pages/TestidsMailbox";
import TestIdsManagement from "./pages/TestIdsManagement";
import SmtpTester from "./pages/SmtpTester";
import SmtpDetails from "./pages/SmtpDetails";
import FsockManual from "./pages/FsockManual";
import FsockHelp from "./pages/FsockHelp";
import { InterfaceNewPage } from "./pages/InterfaceNewPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Dashboard",
      "/login": "Login",
      "/credentials": "Credentials Management",
      "/data-count": "Data Count Detail",
      "/interface": "Mail Interface",
      "/offers": "Offers Management",
      "/suppression": "Suppression Management",
      "/complainer-suppression": "Complainer Suppression",
      "/all-offers": "All Offers View",
      "/all-links": "All Links View",
      "/image-portal": "Asset Management",
      "/server-setup": "Linux Server Setup",
      "/server-setup-ubuntu": "Ubuntu Server Setup",
      "/sending-ip-setup": "IP Configuration",
      "/screen": "Active Screens",
      "/data-download": "Data Downloader",
      "/data-upload": "Data Ingestion",
      "/data-split": "Data Segmentation",
      "/data-merge": "Data Aggregation",
      "/bounce-fetch": "Bounce Retrieval",
      "/bounce-update": "Bounce Processor",
      "/complain-update": "Complaint Processor",
      "/complain-fetch": "Complaint Retrieval",
      "/fetch-opener-clicker": "Behavioral Analytics",
      "/testids-screen": "TestID Monitor",
      "/testids-mailbox": "TestID Mailbox",
      "/testids-man": "TestID Management",
      "/smtp-tester": "SMTP Connectivity Tester",
      "/smtp": "SMTP Configuration",
      "/fsock-manual": "FSock Manual Send",
      "/fsock-help": "FSock Help Documentation",
      "/fsock-send-smtp": "ESP SMTP",
      "/fsock-send-smtp-auto": "Mail Interface (Auto)",
      "/interface-new": "Advanced Mailer",
    };

    const path = location.pathname;
    let title = routeTitles[path] || "Mailing Portal";

    // Handle dynamic routes like /screens/:id/logs
    if (path.startsWith("/screens/") && path.endsWith("/logs")) {
      title = "Campaign Monitoring";
    }

    document.title = `${title} | Mailing Portal`;
  }, [location]);

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <TitleUpdater />
        <div className="min-h-screen bg-[#1a1d21]">
          <Navbar />
          <main className="w-full">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credentials"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <Credentials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-count"
                element={
                  <ProtectedRoute>
                    <DataCount />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interface"
                element={
                  <ProtectedRoute>
                    <Interface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offers"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <Offers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppression"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <Suppression />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complainer-suppression"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <ComplainerSuppression />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-offers"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <AllOffers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-links"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <AllLinks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/image-portal"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <ImagePortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-setup"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <ServerSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-setup-ubuntu"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <ServerSetupUbuntu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sending-ip-setup"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <SendingIpSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screen"
                element={
                  <ProtectedRoute>
                    <Screen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screens/:id/logs"
                element={
                  <ProtectedRoute>
                    <ScreenLogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-download"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <DataDownload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-upload"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <DataUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-split"
                element={
                  <ProtectedRoute>
                    <DataSplit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-merge"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <DataMerge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bounce-fetch"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <BounceFetch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bounce-update"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <BounceUpdate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complain-update"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <ComplainUpdate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complain-fetch"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <ComplainFetch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fetch-opener-clicker"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <DataAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testids-screen"
                element={
                  <ProtectedRoute>
                    <TestidsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testids-mailbox"
                element={
                  <ProtectedRoute>
                    <TestidsMailbox />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testids-man"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <TestIdsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/smtp-tester"
                element={
                  <ProtectedRoute>
                    <SmtpTester />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/smtp"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <SmtpDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-datafile"
                element={
                  <ProtectedRoute requiredDesignation="Admin">
                    <DataDelete />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fsock-manual"
                element={
                  <ProtectedRoute>
                    <FsockManual />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fsock-send-smtp"
                element={
                  <ProtectedRoute>
                    <FsockManual />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fsock-send-smtp-auto"
                element={
                  <ProtectedRoute>
                    <FsockManual />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fsock-help"
                element={
                  <ProtectedRoute>
                    <FsockHelp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interface-new"
                element={
                  <ProtectedRoute>
                    <InterfaceNewPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
