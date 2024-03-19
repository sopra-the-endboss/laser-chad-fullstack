import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductOverview from "./views/ProductOverview";
import Navigation from "./components/Navigation";
import { Provider } from "react-redux";
import store from "./reducers/store";
import Account from "./views/Account";
import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import AllProductsNameMock from "./data/AllProductsNameMock.json";
import { ProductDetail } from "./views/ProductDetail";
import { Container, Grid } from "@mui/material";
import { Categories } from "./views/Categories";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // filter data for category
    if (categoryFilter)
      setData(
        AllProductsNameMock.filter(
          (element) => element.category === categoryFilter
        )
      );
    else setData(AllProductsNameMock);
  }, [categoryFilter]);

  async function currentAuthenticatedUser() {
    return await getCurrentUser();
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Navigation
          setData={setData}
          searchQuerySubmitted={searchQuerySubmitted}
        />
        <div style={{ marginTop: "100px" }}>
          <Container maxWidth="lg">
            <Grid container spacing={2}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProductOverview
                      isSearchQuerySubmitted={isSearchQuerySubmitted}
                      data={data}
                      setCategoryFilter={setCategoryFilter}
                    />
                  }
                />
                <Route path="/categories" element={<Categories />} />
                <Route
                  path="/categories/:categoryFilter"
                  element={
                    <ProductOverview
                      isSearchQuerySubmitted={isSearchQuerySubmitted}
                      data={data}
                      setCategoryFilter={setCategoryFilter}
                    />
                  }
                />
                <Route
                  path="/product/:product_id"
                  element={<ProductDetail />}
                />
                <Route path="/account" element={<Account />} />
              </Routes>
            </Grid>
          </Container>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
