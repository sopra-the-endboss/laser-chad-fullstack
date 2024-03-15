import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Navigation from "./components/Navigation";
import { useState } from "react";
import { Provider } from "react-redux";
import store from "./reducers/store";
import Account from "./views/Account";
import { getCurrentUser } from "aws-amplify/auth";

function App() {
  const [data, setData] = useState([]);
  const [isSearchQuerySubmitted, searchQuerySubmitted] = useState(false);

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
          <Navigation setData={setData} />
          <div style={{ marginTop: "80px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
