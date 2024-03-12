import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./views/Home";
import Login from "./views/Login";
import Navigation from "./components/Navigation";
import {useState} from "react";

function App() {

    const [data, setData] = useState([]);
    const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);

    return (
        <div className="App">
            <BrowserRouter>
                <Navigation setData={setData} />
                <div style={{marginTop: "80px"}}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                    </Routes>
                </div>
            </BrowserRouter>
        </div>
    );
}

export default App;
