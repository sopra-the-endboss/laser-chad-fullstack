import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  newProductReducer,
  detailReducer,
  // productReducer,
  // productDetailsReducer
} from "./reducers/productReducer";

const reducer = combineReducers({
  newProduct: newProductReducer,
  getDetails: detailReducer,
});

let initialState = {};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
