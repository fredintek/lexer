import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, useAppSelector } from "../store";

interface YfinanceDataState {
  activeSymbol: string;
  activeName: string;
  exchange: string;
}

const initialState: YfinanceDataState = {
  activeSymbol: "THYAO",
  activeName: "Türk Hava Yolları",
  exchange: "BIST",
};

const yfinanceDataSlice = createSlice({
  name: "yfinanceData",
  initialState,
  reducers: {
    setActiveAsset: (
      state,
      action: PayloadAction<{ symbol: string; name: string; exchange: string }>,
    ) => {
      state.activeSymbol = action.payload.symbol;
      state.activeName = action.payload.name;
      state.exchange = action.payload.exchange;
    },
  },
});

export const { setActiveAsset } = yfinanceDataSlice.actions;
export const selectActiveAsset = (state: RootState) =>
  state.yfinanceDataReducer;
export default yfinanceDataSlice.reducer;
