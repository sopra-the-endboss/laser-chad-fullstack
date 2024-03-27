import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductOverview from "./views/ProductOverview";
import Navigation from "./components/Navigation";
import { Provider } from "react-redux";
import store from "./reducers/store";
import useAuth from "./reducers/useAuth";
import Account from "./views/Account";
import { useEffect, useState } from "react";
import AllProductsNameMock from "./data/AllProductsNameMock.json";
import { ProductDetail } from "./views/ProductDetail";
import { Container, Grid } from "@mui/material";
import { Categories } from "./views/Categories";
import SellProduct from "./components/ProductManagement/SellProduct";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  useAuth();

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

  return (
    <Provider store={store}>
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
                  <Route path="/sell-product" element={<SellProduct />} />
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
