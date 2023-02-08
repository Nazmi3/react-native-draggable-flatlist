import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef } from "react";
import { Text, NativeModules } from "react-native";
import "react-native-gesture-handler";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TodoDetails from "./src/screens/TodoDetails";
import { useImperativeHandle, Children } from "react";
import { StyleSheet, ToastAndroid, StatusBar } from "react-native";
import Animated from "react-native-reanimated";
import { FadeOut } from "react-native-reanimated";
import {
  Image,
  Platform,
  Easing,
  UIManager,
  ImageBackground,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TodoScreen from "./src/screens/Todo";
import Commitment from "./src/screens/Commitment";
import { Provider } from "react-redux";
import store from "./src/store";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { IconComponentProvider, Icon } from "@react-native-material/core";
// import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Provider as PaperProvider } from 'react-native-paper';

const Tab = createBottomTabNavigator();
const MyModule = NativeModules.MyModuleName;

let storage = {
  async set(key: string, value: any) {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async get(key: string) {
    try {
      let stringData = await AsyncStorage.getItem(key);
      return JSON.parse(stringData ?? "");
    } catch (error) {
      throw error;
    }
  },
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function Row(props) {
  const { active, data } = props;
  const activeAnim = useRef(new Animated.Value(0));
  const style = {
    transform: [
      {
        scale: 1,
      },
    ],
  };
  useEffect(() => {
    Animated.timing(activeAnim.current, {
      duration: 300,
      easing: Easing.bounce,
      toValue: Number(active),
      useNativeDriver: true,
    }).start();
  }, [active]);

  return (
    // <Animated.View style={[styles.row]}>
    <Animated.View style={[styles.row, style]}>
      <Image source={{ uri: data.image }} style={[styles.image]} />
      <Text>{data.text}</Text>
    </Animated.View>
  );
}

// const Stack = createSharedElementStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

function App() {
  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require("./assets/images/background.jpg")}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <SafeAreaProvider style={{ backgroundColor: "transparent" }}>
          <NavigationContainer theme={navTheme}>
            <Tab.Navigator>
              <Tab.Screen
                name="Todo"
                component={TodoScreen}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Icon name="list" size={24} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Commitment"
                component={Commitment}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Icon name="shopping-cart" size={24} color={color} />
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },
  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: "#999999",
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    width: window.width,
    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },
      android: {
        paddingHorizontal: 0,
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    height: 80,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 4,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 30,
    borderRadius: 25,
  },
  text: {
    fontSize: 24,
    color: "#222222",
  },
});

export default () => (
  <Provider store={store}>
    <IconComponentProvider IconComponent={Entypo}>
      <PaperProvider>
        <App />
      </PaperProvider>
    </IconComponentProvider>
  </Provider>
);
