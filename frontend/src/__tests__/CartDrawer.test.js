import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartDrawer from "../components/Cart/CartDrawer";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

// mock Redux and Router
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(), // creates mock function
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockStore = {
  cart: {
    cartItems: [],
  },
};

const renderWithProviders = (ui, { reduxState = mockStore } = {}) => {
  const store = {
    getState: () => reduxState,
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  };
  return render(<Provider store={store}>{ui}</Provider>, { wrapper: Router });
};

test('display "No items in cart." when cart is empty', () => {
  renderWithProviders(<CartDrawer isOpen={true} toggleCart={() => {}} />);
  expect(screen.getByText(/no items in cart/i)).toBeInTheDocument();
});

// test("displays items when cart contains items", () => {
//   const reduxStateWithItems = {
//     cart: {
//       cartItems: [
//         {
//           brand: "test brand",
//           product_id: "1",
//           title: "this is a test",
//           price: 10.0,
//           img: "test",
//           quantity: 1,
//         },
//       ],
//     },
//   };
//   renderWithProviders(<CartDrawer isOpen={true} toggleCart={() => {}} />, {
//     reduxState: reduxStateWithItems,
//   });
//   expect(screen.getByText(/this is a test/i)).toBeInTheDocument();
// });

// test('navigates to checkout when "Proceed to Checkout" is clicked', () => {
//   const reduxStateWithItems = {
//     cart: {
//       cartItems: [
//         {
//           brand: "test brand",
//           product_id: "1",
//           title: "this is a test",
//           price: 10.0,
//           img: "test",
//           quantity: 1,
//         },
//       ],
//     },
//   };
//   renderWithProviders(<CartDrawer isOpen={true} toggleCart={() => {}} />, {
//     reduxState: reduxStateWithItems,
//   });

//   userEvent.click(screen.getByText(/proceed to checkout/i));
//   expect(mockNavigate).toHaveBeenCalledWith("/checkout");
// });
