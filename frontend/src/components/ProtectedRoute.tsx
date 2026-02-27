import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredDesignation?: string;
}

const ProtectedRoute = ({
  children,
  requiredDesignation,
}: ProtectedRouteProps): React.ReactElement | null => {
  const userInfoStr = localStorage.getItem("userInfo");
  if (!userInfoStr) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = JSON.parse(userInfoStr);
  if (requiredDesignation && userInfo.designation !== requiredDesignation) {
    // If user is logged in but doesn't have the required role, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
