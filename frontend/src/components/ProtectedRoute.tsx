import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authSlice";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredDesignation?: string;
}

const ProtectedRoute = ({
  children,
  requiredDesignation,
}: ProtectedRouteProps): React.ReactElement | null => {
  const userInfo = useSelector(selectCurrentUser);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (requiredDesignation && userInfo.designation !== requiredDesignation) {
    // If user is logged in but doesn't have the required role, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
