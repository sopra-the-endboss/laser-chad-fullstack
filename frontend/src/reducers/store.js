import {combineReducers, configureStore} from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import apigBaseUrlReducer from "./apigBaseUrl";

const persistConfig = {
  key: "root",
  storage,
};

//const persistedReducer = persistReducer(persistConfig, cartReducer);

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  apigBaseUrl: apigBaseUrlReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
});

export const persistor = persistStore(store);

export default store;
