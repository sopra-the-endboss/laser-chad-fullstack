import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./views/Home";
import Navigation from "./components/Navigation";
import {useState} from "react";
import AllProductsnameMock from "./data/AllProductsNameMock.json"

function App() {

    const [data, setData] = useState(AllProductsnameMock);
    const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);

    return (
        <div className="App">
            <BrowserRouter>
                <Navigation setData={setData} searchQuerySubmitted={searchQuerySubmitted} />
                <div style={{marginTop: "80px"}}>
                    <Routes>
                        <Route path="/" element={<Home isSearchQuerySubmitted={isSearchQuerySubmitted} data={data} />}/>
                        {/* Browse Products */}
                    </Routes>
                </div>
            </BrowserRouter>
        </div>
    );
}

export default App;
