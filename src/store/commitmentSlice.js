import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get } from "../manager/sqlite";

export const refreshCommitments = createAsyncThunk(
  "refreshCommitment",
  async (d, thunkApi) => {
    const c = await get("commitment");
    return c;
  }
);

export const commitmentSlice = createSlice({
  name: "commitments",
  initialState: [],
  reducers: {
    updateCommitment: (state, action) => {
      // return return array of commitments
      return action.payload;
    },
    deletecommitment: (state) => {
      state.value -= 1;
    },
    addcommitment: (state, action) => {
      return [...state, action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshCommitments.fulfilled, (state, action) => {
      console.log("p1", action.payload);
      return action.payload;
    });
  },
});

export const {
  updateCommitment,
  deletecommitment,
  addcommitment,
} = commitmentSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const addAsync = (amount) => (dispatch) => {
  setTimeout(() => {
    dispatch(addcommitment(amount));
  }, 1000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectcommitments = (state) => state.commitments.value;

export default commitmentSlice.reducer;
