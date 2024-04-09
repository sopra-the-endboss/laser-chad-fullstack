import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import ProductOverview from "./views/ProductOverview";
import Navigation from "./components/Navigation";
import {Provider} from "react-redux";
import store from "./reducers/store";
import useAuth from "./reducers/useAuth";
import Account from "./views/Account";
import {useDispatch} from 'react-redux';
import {useEffect, useState} from "react";
//import AllProductsNameMock from "./data/AllProductsNameMock.json";
import {ProductDetail} from "./views/ProductDetail";
import {Container, Grid} from "@mui/material";
import {Categories} from "./views/Categories";
import MyShop from "./views/MyShop";
import SellerGuard from "./components/Guards/SellerGuard";
import {Playground} from "./views/Playground";
import {useSelector} from 'react-redux';

function App() {
    const [data, setData] = useState([]);
    const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [AllProductsName, setAllProductsName] = useState([]);
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);
    const dispatch = useDispatch();

    useAuth();

    useEffect(() => {
        // filter data for category
        if (categoryFilter)
            setData(
                AllProductsName.filter(
                    (element) => element.category === categoryFilter
                )
            );
        else setData(AllProductsName);
    }, [categoryFilter, AllProductsName]);

    useEffect(() => {
        fetch('http://localhost:5000/apig_base_url')
            .then(response => response.text())
            .then(data => {
                dispatch({type: 'SET_APIG_BASE_URL', payload: data});
            });
    }, [dispatch]);


    useEffect(() => {
        if (apigBaseUrl) {
            fetch(`${apigBaseUrl}/product-microservice/product`)
                .then(response => response.json())
                .then(data => {
                    setAllProductsName(data);
                })
                .catch(error => console.error('Error:', error));
        }
    }, [apigBaseUrl]);

    return (
        <Provider store={store}>
            <div className="App">
                <BrowserRouter>
                    <Navigation
                        setData={setData}
                        searchQuerySubmitted={searchQuerySubmitted}
                        AllProductsName={AllProductsName}
                    />
                    <div style={{marginTop: "100px", marginBottom: "50px"}}>
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
                                    <Route path="/categories" element={<Categories/>}/>
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
                                        element={<ProductDetail/>}
                                    />
                                    <Route path="/account" element={<Account/>}/>
                                    <Route path="/playground" element={<Playground/>}/>
                                    <Route path="/my-shop" element={
                                        <SellerGuard>
                                            <MyShop/>
                                        </SellerGuard>
                                    }/>
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
