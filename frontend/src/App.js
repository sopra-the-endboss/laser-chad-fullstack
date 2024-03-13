import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Login from "./views/Login";
import SignUp from "./views/SignUp";
import Navigation from "./components/Navigation";
import { useState } from "react";
import { Provider } from "react-redux";
import store from "./reducers/store";
import Loggedin_temp from "./views/Loggedin_temp";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);

  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <Navigation setData={setData} />
          <div style={{ marginTop: "80px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/logged_in" element={<Loggedin_temp />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
