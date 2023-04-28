import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./todoSlice";
import commitmentReducer from "./commitmentSlice";

export default configureStore({
  reducer: {
    todos: todoReducer,
    commitments: commitmentReducer,
  },
});
