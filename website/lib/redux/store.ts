import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "./features/auth.slice";
import storage from "./storage";
import { apiReducer } from "./services";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { twelvedataApi } from "./services/twelveData.api";
import yfinanceDataReducer from "./features/yfinanceData.slice";

const rootReducer = combineReducers({
  [apiReducer.reducerPath]: apiReducer.reducer,
  [twelvedataApi.reducerPath]: twelvedataApi.reducer,
  auth: authReducer,
  yfinanceDataReducer,
});

const persistConfig = {
  key: "lexer-website-root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(apiReducer.middleware, twelvedataApi.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
