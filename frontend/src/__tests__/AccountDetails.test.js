import React from "react";
import AccountDetails from "../views/AccountDetails";
import { render, screen } from "@testing-library/react";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

describe("AccountDetails", () => {
  const mockAuthState = {
    groups: "Seller",
    givenname: "John",
    familyname: "Doe",
    email: "johndoe@example.com",
    birthdate: "1990-01-01",
  };

  it('should display "User Account" in an h3', () => {
    require("react-redux").useSelector.mockReturnValue(mockAuthState);

    render(<AccountDetails />);

    const heading = screen.getByRole("heading", { name: "User Account" });
    expect(heading).toBeInTheDocument();
  });

  it("should display the user information", () => {
    require("react-redux").useSelector.mockReturnValue(mockAuthState);

    render(<AccountDetails />);

    expect(screen.getByText(/Seller/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/1990-01-01/i)).toBeInTheDocument();
  });
});
