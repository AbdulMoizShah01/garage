import { applyMiddleware, createStore } from "redux";
import { thunk } from "redux-thunk";
import { dataReducer, rootState } from "./reducer";

export const store = createStore(dataReducer, rootState, applyMiddleware(thunk));