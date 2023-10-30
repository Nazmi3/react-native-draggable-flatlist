import { createSlice } from "@reduxjs/toolkit";

export const todoSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    updateTODOList: (state, action) => {
      // return return array of commitments
      return action.payload;
    },
    setTODOs: (state, action) => {
      return action.payload;
    },
    deleteTodo: (state) => {
      state.value -= 1;
    },
    addTodo: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const {
  updateTODOList,
  setTODOs: setTODOs,
  deleteTodo,
  addTodo,
} = todoSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const addAsync = (amount) => (dispatch) => {
  setTimeout(() => {
    dispatch(addTodo(amount));
  }, 1000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectTodos = (state: { todos: any[] }) => state.todos.value;

export default todoSlice.reducer;
