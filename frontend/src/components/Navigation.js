import React from "react";
import SearchIcon from "@mui/icons-material/Search";
// import AllProductsnameMock from "../data/AllProductsNameMock.json";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useState } from "react";
import CartDrawer from "./Cart/CartDrawer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import Badge from "@mui/material/Badge";
import { useSelector } from "react-redux";

/**
 * Renders the navigation bar for the application, including links, a search bar, and a shopping cart icon.
 *
 * This component is responsible for displaying the main navigation bar at the top of the application.
 * It includes dynamic navigation links, a search input for product search, and a badge indicating the
 * number of items in the cart. The search functionality filters products based on the input and navigates
 * the user to the homepage with the filtered results. The navigation bar also conditionally renders links
 * available to sellers if the authenticated user is identified as a seller.
 *
 *
 * @component
 * @example
 * const setData = (data) => console.log(data);
 * const searchQuerySubmitted = (submitted) => console.log(submitted);
 * const AllProductsName = [{ product: 'Example Product Name' }];
 *
 * return <Navbar setData={setData} searchQuerySubmitted={searchQuerySubmitted} AllProductsName={AllProductsName} />;
 *
 * @param {Object} props - Props for configuring the Navbar component.
 * @param {function} props.setData - Function to set the filtered data based on search results.
 * @param {function} props.searchQuerySubmitted - Callback function that indicates a search query has been submitted.
 * @param {Array<Object>} props.AllProductsName - Array of all product names used for the search filter.
 */

const Navbar = ({ setData, searchQuerySubmitted, AllProductsName }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  var badgeCount = cartItems.length;

  const toggleCart =
    (open) =>
    (event = {}) => {
      // Prevent the drawer from closing if the event is triggered by a keyboard event and the key is not Tab or Shift
      if (
        event.type === "keydown" &&
        (event.key === "Tab" || event.key === "Shift")
      ) {
        return;
      }
      setIsCartOpen(open);
    };
  const navigate = useNavigate();

  const searchWithinProducts = (event) => {
    const filtered = AllProductsName.filter((product) =>
      product["product"]
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );

    if (event.keyCode === 13 && event.target.value) {
      navigate("/");
      searchQuerySubmitted(true);
      setData(filtered);
    } else if (event.keyCode === 13) {
      searchQuerySubmitted(false);
      setData(filtered);
    }
  };

  const authState = useSelector((state) => state.auth.user);
  let isSeller = authState ? authState?.role === "Seller" : false;

  const inactive =
    "text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium";
  const active = "text-gray-800 px-3 py-2 rounded-md text-sm font-medium";

  const routes = [
    {
      route: "/",
      location: "Overview",
    },
    {
      route: "/categories",
      location: "Categories",
    },
    {
      route: "/account",
      location: "Account",
    },
    ...(isSeller
      ? [
          {
            route: "/my-shop",
            location: "My Shop",
          },
        ]
      : []),
  ];

  return (
    <nav
      className="bg-white shadow fixed top-0 left-0 w-full z-10"
      style={{ zIndex: 1001 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 mb-4">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {routes.map((route) => (
                  <Link
                    key={route.location}
                    to={route.route}
                    className={
                      route.route === window.location.pathname
                        ? active
                        : inactive
                    }
                  >
                    {route.location}
                  </Link>
                ))}

                <div>
                  <Button onClick={toggleCart(true)}>
                    <Badge badgeContent={badgeCount}>
                      <ShoppingCartIcon />
                    </Badge>
                  </Button>
                  <CartDrawer isOpen={isCartOpen} toggleCart={toggleCart} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="ml-3 relative flex items-center">
              <input
                type="text"
                className="h-10 pl-10 pr-2 rounded-md text-sm border-gray-300"
                placeholder="Search..."
                onKeyDown={(e) => searchWithinProducts(e)}
              />
              <SearchIcon className="absolute left-3 h-5 w-5 text-gray-500 pl-2" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
