import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps): React.ReactElement | null => {
  const userInfo = localStorage.getItem("userInfo");
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
