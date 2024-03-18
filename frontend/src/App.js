import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductOverview from "./views/ProductOverview";
import Navigation from "./components/Navigation";
import { Provider } from "react-redux";
import store from "./reducers/store";
import Account from "./views/Account";
import { useEffect, useState } from "react";
import AllProductsNameMock from "./data/AllProductsNameMock.json";
import { ProductDetail } from "./views/ProductDetail";
import { Container, Grid } from "@mui/material";
import { Categories } from "./views/Categories";
import { useSelector, useDispatch } from "react-redux";
import { Hub } from "aws-amplify/utils";
import { setUserLoggedIn, setUserLoggedOut } from "./reducers/slices/authSlice";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  // test output of state
  useEffect(() => {
    console.log("Current auth state:", authState);
  }, [authState]);

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

  useEffect(() => {
    const removeListener = Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signedIn":
          dispatch(setUserLoggedIn());
          break;
        case "signedOut":
          dispatch(setUserLoggedOut());
          break;
        default:
          break;
      }
      console.log(data);
    });
    return () => {
      removeListener(); // Cleanup listener on component unmount
    };
  }, [dispatch]);

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
