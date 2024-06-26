import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

// Views
import ProductOverview from "./views/ProductOverview";
import { ProductDetail } from "./views/ProductDetail";
import Account from "./views/Account";
import { Categories } from "./views/Categories";
import MyShop from "./views/MyShop";
import { Playground } from "./views/Playground";
import Checkout from "./views/Checkout";

// Components
import Navigation from "./components/Navigation";
import SellerGuard from "./components/Guards/SellerGuard";

// Utils
import store from "./reducers/store";
import useAuth from "./hooks/useAuth";
import { Container, Grid } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { useFetchAllProducts, useFetchAPIGURL } from "./utils/apiCalls";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [AllProductsName, setAllProductsName] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetching functions modularized
  const fetchAPIGURL = useFetchAPIGURL();
  const fetchAllProducts = useFetchAllProducts(setAllProductsName, setLoading);
  const [apiGURLFetched, setApiGURLFetched] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(false);
  useAuth();

  useEffect(() => {
    // filter data for category
    if (categoryFilter)
      setData(
        AllProductsName.filter((element) => element.category === categoryFilter)
      );
    else setData(AllProductsName);
  }, [categoryFilter, AllProductsName]);

  useEffect(() => {
    fetchAPIGURL().then(() => {
      setApiGURLFetched(true);
    });
  }, [fetchAPIGURL]);

  useEffect(() => {
    if (apiGURLFetched) {
      fetchAllProducts();
    }
    // adding fetchAllProducts into the dependencies leads to infinite calls. we dont do that here
    // eslint-disable-next-line
  }, [setAllProductsName, setLoading, apiGURLFetched, refreshProducts]);

  return (
    <Provider store={store}>
      <div className="App">
        <SnackbarProvider maxSnack={3}>
          <BrowserRouter>
            <Navigation
              setData={setData}
              searchQuerySubmitted={searchQuerySubmitted}
              AllProductsName={AllProductsName}
            />
            <div style={{ marginTop: "100px", marginBottom: "50px" }}>
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
                          loading={loading}
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
                          loading={loading}
                        />
                      }
                    />
                    <Route
                      path="/product/:product_id"
                      element={<ProductDetail />}
                    />
                    <Route path="/account" element={<Account />} />
                    <Route path="/playground" element={<Playground />} />
                    <Route
                      path="/my-shop"
                      element={
                        <SellerGuard>
                          <MyShop
                            setRefresh={setRefreshProducts}
                            refresh={refreshProducts}
                          />
                        </SellerGuard>
                      }
                    />
                    <Route path="/checkout" element={<Checkout />} />
                  </Routes>
                </Grid>
              </Container>
            </div>
          </BrowserRouter>
        </SnackbarProvider>
      </div>
    </Provider>
  );
}

export default App;
