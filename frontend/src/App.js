import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductOverview from "./views/ProductOverview";
import Navigation from "./components/Navigation";
import { Provider } from "react-redux";
import store from "./reducers/store";
import Account from "./views/Account";
import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import AllProductsnameMock from "./data/AllProductsNameMock.json";
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
        AllProductsnameMock.filter(
          (element) => element.category === categoryFilter
        )
      );
    else setData(AllProductsnameMock);
  }, [categoryFilter]);

  useEffect(() => {
    currentAuthenticatedUser()
      .then((res) => {
        console.log(res);
        setIsAuthenticated(true); // if the user is authenticated, set the state to true
      })
      .catch((err) => {
        console.log(err);
        setIsAuthenticated(false); // if the user is not authenticated, set the state to false
      });
  }, []);

  async function currentAuthenticatedUser() {
    return await getCurrentUser();
  }

  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <Navigation
            setData={setData}
            searchQuerySubmitted={searchQuerySubmitted}
            isAuthenticated={isAuthenticated}
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
                  <Route
                    path="/shopping-cart"
                    element={<div>Shopping Cart</div>}
                  />
                </Routes>
              </Grid>
            </Container>
          </div>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
