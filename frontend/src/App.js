import "./App.css";
import Header from "./components/Header/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Navigation from "./components/Navigation";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
          <div style={{marginTop: "80px"}}>
              <Routes>
                  <Route path="/" element={<Home />} />
                  {/* Add your routes here */}
              </Routes>
          </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
