import React from "react";
import "react-native-gesture-handler";
import Todo from "./Todo";
import TodoDetails from "./TodoDetails";
import { Platform, UIManager } from "react-native";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createSharedElementStackNavigator();

const App = () => {
  return (
    <Stack.Navigator style={{ backgroundColor: "transparent" }}>
      <Stack.Screen
        style={{ backgroundColor: "transparent" }}
        name="TodoList"
        component={Todo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TodoDetails"
        component={TodoDetails}
        options={({ route }) => ({
          title: route.params.todo.text,
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default App;
