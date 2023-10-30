import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef } from "react";
import { Text, NativeModules } from "react-native";
import "react-native-gesture-handler";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";

import {
  Image,
  Platform,
  Easing,
  UIManager,
  ImageBackground,
} from "react-native";
import TodoScreen from "./src/screens/AppChild";
// import Sample from "./src/screens/Sample";
import Commitment from "./src/screens/Commitments";
import { Provider } from "react-redux";
import store from "./src/store";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { IconComponentProvider, Icon } from "@react-native-material/core";
// import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Provider as PaperProvider } from "react-native-paper";
import CustomMenu from "./src/components/CustomMenu";

const Tab = createBottomTabNavigator();
const MyModule = NativeModules.MyModuleName;

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
    MyModule.doSomething("Gu", 1000);
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
            <Tab.Navigator
              screenOptions={({ route, navigation }) => ({
                headerTitleStyle: { color: "white" },
                headerBackground: () => (
                  <BlurView
                    tint="light"
                    intensity={10}
                    style={StyleSheet.absoluteFill}
                  />
                ),
                tabBarBackground: () => (
                  <BlurView
                    tint="light"
                    intensity={10}
                    style={StyleSheet.absoluteFill}
                  />
                ),
                headerRight: () => (
                  <CustomMenu
                    menutext="Menu"
                    menustyle={{ marginRight: 14 }}
                    textStyle={{ color: "white" }}
                    navigation={navigation}
                    route={route}
                    isIcon={true}
                  />
                ),
              })}
            >
              <Tab.Screen
                name="Todo"
                component={TodoScreen}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Icon name="format-list-bulleted" size={24} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Commitment"
                component={Commitment}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Icon name="shopping-outline" size={24} color={color} />
                  ),
                }}
              />
              {/* <Tab.Screen
                name="Experimental"
                component={Experimental}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Icon name="shopping-outline" size={24} color={color} />
                  ),
                }}
              /> */}
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
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
      <PaperProvider>
        <App />
      </PaperProvider>
    </IconComponentProvider>
  </Provider>
);
