import React from "react";
import { useSelector } from "react-redux";
import "../App.css";

const AccountDetails = () => {
  const authState = useSelector((state) => state.auth);

  return (
    <div className="account-container">
      <div className="profile-header">
        <h1>User Account</h1>
        <h2>Account Details</h2>
      </div>
      <div className="profile-section">
        <div className="profile-image">
          <img src="profile.png" alt="profile" />
          <button className="edit-icon">✎</button>
        </div>
        <div className="profile-details">
          <div className="personal-info">
            <h3>Personal Information</h3>
            <p>{authState.givenname + " " + authState.familyname}</p>
            <p>{authState.email}</p>
            <p>{authState.birthdate}</p>
          </div>
          <div className="group-info">
            <h3>Group Information</h3>
            <p>{authState.groups}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
