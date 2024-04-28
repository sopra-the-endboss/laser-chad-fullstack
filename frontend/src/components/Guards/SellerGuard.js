import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * A higher-order component that guards routes intended only for users with the 'seller' role.
 *
 * This component checks if the authenticated user's group includes 'seller'. If not, it redirects
 * the user to the home page. It utilizes the Redux state to check the user's groups by accessing
 * the `auth.groups` state. This component is useful for protecting routes that should only be
 * accessible to sellers.
 *
 * @component
 * @example
 * return (
 *   <SellerGuard>
 *     <SellerDashboard />
 *   </SellerGuard>
 * );
 *
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components that this guard wraps. These components are only rendered if the user is a seller.
 * @returns {React.ReactNode} - The `Navigate` component redirecting to the home page if the user is not a seller, or the child components if they are.
 */

const SellerGuard = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const isSeller = user ? user?.role === "Seller" : false;

  if (!isSeller) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SellerGuard;
