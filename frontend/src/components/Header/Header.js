import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
function Header() {
  const root = {
    backgroundColor: "#4949e8",

    "&:hover": {
      backgroundColor: "#4949e8",
    },
  };
  return (
    <div>
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="flex flex-col p-4 mt-4 bg-gray-50 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:font-medium md:border-0 md:bg-white ">
              <li>
                <Link
                  to="/"
                  className="block py-2 pr-4 pl-3  rounded  text-blue-800 md:border-0  md:p-0 "
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="block py-2 pr-4 pl-3  rounded  text-blue-800 md:border-0  md:p-0 "
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="block py-2 pr-4 pl-3  rounded  text-blue-800 md:border-0  md:p-0 "
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="block py-2 pr-4 pl-3  rounded  text-blue-800 md:border-0  md:p-0 "
                >
                  Support
                </Link>
              </li>
              <li>
                <Link to="/account">
                  <Button sx={root} variant="contained">
                    Create Account
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
