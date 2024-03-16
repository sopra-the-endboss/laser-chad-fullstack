import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import ProductOverview from "./views/ProductOverview";
import Navigation from "./components/Navigation";
import { Provider } from "react-redux";
import store from "./reducers/store";
import Account from "./views/Account";
import { getCurrentUser } from "aws-amplify/auth";
import {useEffect, useState} from "react";
import AllProductsnameMock from "./data/AllProductsNameMock.json"
import {ProductDetail} from "./views/ProductDetail";
import {Container, Grid} from "@mui/material";
import {Categories} from "./views/Categories";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);

    const [data, setData] = useState([]);
    const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        // filter data for category
        if(categoryFilter)
            setData(AllProductsnameMock.filter(element => element.category === categoryFilter));
        else
            setData(AllProductsnameMock);
    }, [categoryFilter]);

  async function currentAuthenticatedUser() {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      console.log(`The username: ${username}`);
      console.log(`The userId: ${userId}`);
      console.log(`The signInDetails: ${signInDetails}`);
    } catch (err) {
      console.log(err);
    }
  }
  currentAuthenticatedUser();
  return (
    <Provider store={store}>
      <div className="App">
          <BrowserRouter>
              <Navigation setData={setData} searchQuerySubmitted={searchQuerySubmitted}/>
              <div style={{marginTop: "100px"}}>
                  <Container maxWidth="lg">
                      <Grid container spacing={2}>

                          <Routes>
                              <Routes>
                                  <Route path="/"
                                         element={<ProductOverview isSearchQuerySubmitted={isSearchQuerySubmitted} data={data} setCategoryFilter={setCategoryFilter} />}/>
                                  <Route path="/categories" element={<Categories />}/>
                                  <Route path="/categories/:categoryFilter"
                                         element={<ProductOverview isSearchQuerySubmitted={isSearchQuerySubmitted} data={data} setCategoryFilter={setCategoryFilter} />}/>
                                  <Route path="/product/:product_id" element={<ProductDetail />}/>
                                  <Route path="/account" element={<Account />} />
                              </Routes>
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
