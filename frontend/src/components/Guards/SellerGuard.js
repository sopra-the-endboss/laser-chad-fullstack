import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const SellerGuard = ({ children }) => {
    const userGroups = useSelector(state => state.auth.groups);

    const isSeller = userGroups?.includes('seller');

    if (!isSeller) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default SellerGuard;
