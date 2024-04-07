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
    //TODO: insert search items in backend.
    // returned products will be set and content will be generated accordingly
    // currently filtering is extremely strict, use levenstein distance or fuse.js to also account for misspells.
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

  const authState = useSelector((state) => state.auth);
  let isSeller = false;
  if (authState.groups) {
    isSeller = authState.groups.includes("seller");
  }

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
      route: "/pinned",
      location: "Pinned Products",
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
            <div className="flex-shrink-0 flex items-center">ICON</div>
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
                {/* TODO: style the same as the rest of the navbar */}
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
