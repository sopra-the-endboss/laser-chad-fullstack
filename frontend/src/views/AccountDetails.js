import React from "react";
import { useSelector } from "react-redux";
import "../App.css";

const AccountDetails = () => {
  const authState = useSelector((state) => state.auth);

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
          </div>
        </dl>
      </div>
    </div>
  );
};

export default AccountDetails;
