import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// To get user auth state from redux (boolean)
// import { useSelector } from "react-redux";
// const authState = useSelector((state) => state.auth);
// useEffect(() => {
//   console.log("Current auth state:", authState);
// }, [authState]);

export default store;
