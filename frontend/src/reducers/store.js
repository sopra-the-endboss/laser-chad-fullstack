import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import apigBaseUrlReducer from "./apigBaseUrl";

/**
 * Configuration for redux-persist to handle storage mechanisms.
 *
 * It determines how the state should be persisted in the local storage of the browser.
 * The key 'root' is used as the storage key prefix for the persisted state.
 *
 * @type {Object}
 */

const persistConfig = {
  key: "root",
  storage,
};

/**
 * A persisted reducer for the cart slice.
 *
 * Using redux-persist, the cart slice's state is persisted across browser sessions.
 * This allows the cart's state to be rehydrated on app restarts, maintaining the cart contents.
 *
 * @type {Reducer}
 */

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  apigBaseUrl: apigBaseUrlReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configures and creates the Redux store.
 *
 * The store integrates different slices of the application state, applying middleware for side effects,
 * and sets up persistence for the cart slice. The auth, cart, and API base URL slices are combined here.
 *
 * The middleware is customized to disable serializable checks, which is useful for certain types of middleware/actions.
 *
 * @returns {Store} A Redux store configured with reducers, middleware, and persistence capabilities.
 */
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

/**
 * The persistor for the Redux store.
 *
 * It is responsible for initiating the rehydration process of the persisted state
 * from the local storage into the Redux store upon application startup.
 *
 * @type {Persistor}
 */
export const persistor = persistStore(store);

export default store;
