import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import TestidsScreen from "./pages/TestidsScreen";
import TestidsMailbox from "./pages/TestidsMailbox";
import TestIdsManagement from "./pages/TestIdsManagement";
import SmtpTester from "./pages/SmtpTester";
import SmtpDetails from "./pages/SmtpDetails";
import FsockManual from "./pages/FsockManual";
import { InterfaceNewPage } from "./pages/InterfaceNewPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <Router>
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
                  <ProtectedRoute>
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
                  <ProtectedRoute>
                    <Offers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppression"
                element={
                  <ProtectedRoute>
                    <Suppression />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complainer-suppression"
                element={
                  <ProtectedRoute>
                    <ComplainerSuppression />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-offers"
                element={
                  <ProtectedRoute>
                    <AllOffers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-links"
                element={
                  <ProtectedRoute>
                    <AllLinks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/image-portal"
                element={
                  <ProtectedRoute>
                    <ImagePortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-setup"
                element={
                  <ProtectedRoute>
                    <ServerSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-setup-ubuntu"
                element={
                  <ProtectedRoute>
                    <ServerSetupUbuntu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sending-ip-setup"
                element={
                  <ProtectedRoute>
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
                path="/data-download"
                element={
                  <ProtectedRoute>
                    <DataDownload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-upload"
                element={
                  <ProtectedRoute>
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
                  <ProtectedRoute>
                    <DataMerge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bounce-fetch"
                element={
                  <ProtectedRoute>
                    <BounceFetch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bounce-update"
                element={
                  <ProtectedRoute>
                    <BounceUpdate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complain-update"
                element={
                  <ProtectedRoute>
                    <ComplainUpdate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complain-fetch"
                element={
                  <ProtectedRoute>
                    <ComplainFetch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fetch-opener-clicker"
                element={
                  <ProtectedRoute>
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
                  <ProtectedRoute>
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
                  <ProtectedRoute>
                    <SmtpDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-datafile"
                element={
                  <ProtectedRoute>
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
