import React from "react";
import { useSelector } from "react-redux";
import "../App.css";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { updateUserAttributes } from "aws-amplify/auth";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../reducers/slices/authSlice";

const AccountDetails = () => {
  const authState = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(authState);
  const dispatch = useDispatch();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditState(authState);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const { givenname, familyname, email, birthdate, groups } = editState;

    try {
      updateUserAttributes({
        userAttributes: {
          given_name: givenname,
          family_name: familyname,
          email: email,
          birthdate: birthdate,
          // groups: groups,
        },
      });
      dispatch(setUserLoggedIn(editState));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user attributes", error);
    }
  };

  return (
    // TODO: Add user image
    <div class="bg-white overflow-hidden shadow rounded-lg border">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          User Account
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Account Type: {authState.groups}
        </p>
      </div>

      <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          {isEditing ? (
            <div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Givenname</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    class="border border-gray-300 rounded-md"
                    name="givenname"
                    value={editState.givenname || ""}
                    onChange={handleInputChange}
                  />
                </dd>
              </div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Familyname</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    class="border border-gray-300 rounded-md"
                    name="familyname"
                    value={editState.familyname || ""}
                    onChange={handleInputChange}
                  />
                </dd>
              </div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Birthdate</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="date"
                    class="border border-gray-300 rounded-md"
                    name="birthdate"
                    value={editState.birthdate || ""}
                    onChange={handleInputChange}
                  />
                </dd>
              </div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Account Type</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    class="border border-gray-300 rounded-md"
                    name="group"
                    value={editState.groups || ""}
                    onChange={handleInputChange}
                  />
                </dd>
              </div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    class="border border-gray-300 rounded-md"
                    name="email"
                    value={editState.email || ""}
                    onChange={handleInputChange}
                  />
                </dd>
              </div>
              <button onClick={handleUpdate}>Save</button>
            </div>
          ) : (
            <div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Full name</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {authState.givenname + " " + authState.familyname}
                </dd>
              </div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Email address</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {authState.email}
                </dd>
              </div>
              <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Birthdate</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {authState.birthdate}
                </dd>
                <button onClick={handleEditToggle}>
                  <EditIcon fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default AccountDetails;
