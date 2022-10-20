import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { View, Text, FlatList } from "react-native";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import HomeScreen from "./src/screens/HomeScreen";
import "react-native-gesture-handler";
import {
  GestureDetector,
  FlingGestureHandler,
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
  Directions,
  Gesture,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TodoDetails from "./src/screens/TodoDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useImperativeHandle, Children } from "react";
import { StyleSheet, ToastAndroid, StatusBar } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import { Item, getColor } from "./src/utils";
import SwipeableButton from "./components/SwipeableButton";
import Animated from "react-native-reanimated";
import { FadeOut } from "react-native-reanimated";

import { Image, Platform, Easing, Dimensions } from "react-native";

const data = {
  0: {
    image: "https://placekitten.com/200/240",
    text: "Chloe",
  },
  1: {
    image: "https://placekitten.com/200/201",
    text: "Jasper",
  },
  2: {
    image: "https://placekitten.com/200/202",
    text: "Pepper",
  },
  3: {
    image: "https://placekitten.com/200/203",
    text: "Oscar",
  },
  4: {
    image: "https://placekitten.com/200/204",
    text: "Dusty",
  },
  5: {
    image: "https://placekitten.com/200/205",
    text: "Spooky",
  },
  6: {
    image: "https://placekitten.com/200/210",
    text: "Kiki",
  },
  7: {
    image: "https://placekitten.com/200/215",
    text: "Smokey",
  },
  8: {
    image: "https://placekitten.com/200/220",
    text: "Gizmo",
  },
  9: {
    image: "https://placekitten.com/220/239",
    text: "Kitty",
  },
};

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

function App1({ navigation }) {
  const defaultTODO = {
    repeat: false,
  };
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const lastGestureRef = useRef({});
  const itemPinch = React.createRef();
  const tapHandler = React.createRef();
  const flingHandler = React.createRef();
  const pinchHandler = React.createRef();
  const draggableHandler = React.createRef();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTODO, setNewTODO] = useState(defaultTODO);
  const [TODOs, setTODOs] = useState([]);
  const [draggableItems, setDraggableItems] = useState([]);
  const [activationDistance, setActivationDistance] = useState(100);

  useEffect(() => {
    getTODOs();
  }, []);

  useEffect(() => {
    setDraggableItems(getDraggableItems(TODOs));
  }, [TODOs]);

  async function deleteTODO(todo: any) {
    let newTODOs = JSON.parse(JSON.stringify(TODOs));
    const fromIndex = newTODOs.findIndex((TODO) => TODO.key === todo.key);
    let recurrent = false;
    let nextTime = null;
    switch (todo.text) {
      case "Subuh":
        recurrent = true;
        nextTime = {
          type: "fixed",
          time: 6,
        };
      case "Qada":
        recurrent = true;
      case "Tidur":
        recurrent = true;
      case "Rehat":
        recurrent = true;
      case "Push Up":
        recurrent = true;
      default:
    }
    if (todo.repeat) {
      const TODO = newTODOs.splice(fromIndex, 1)[0];
      let toIndex;
      let newTime;
      if (TODO.repeat.every) {
        newTime = new Date(TODO.time);
        console.log("time", newTime);
        console.log("set month", TODO.repeat.date);
        if (TODO.repeat.every === "month") {
          console.log("set date", TODO.repeat.date);
          newTime.setMonth(newTime.getMonth() + 1);
          newTime.setDate(TODO.repeat.date);
        } else if (TODO.repeat.every === "day") {
          let moreDay = 1;
          while (newTime.getDate() + moreDay < new Date().getDate())
            moreDay += 1;
          newTime.setDate(newTime.getDate() + moreDay);
        } else if (TODO.repeat.every === "prayTime") {
          let nextPrayerTime = new Date();
          nextPrayerTime.setHours(nextPrayerTime.getHours() + 2);
          newTime.setTime(nextPrayerTime.getTime());
        } else if (TODO.repeat.every === "freeTime") {
          let freeTime = null;
          for (let x = fromIndex; x < TODOs.length - 1; x++) {
            if (TODOs[x + 1].time > TODOs[x].time + TODOs[x].duration)
              freeTime = TODOs[x].time + TODOs[x].duration;
          }
          let lastTODO = TODOs[TODOs.length - 1];
          newTime.setTime(freeTime ?? lastTODO.time + lastTODO.duration);
        } else throw "no date set";
        console.log("newtime", newTime);

        toIndex = getIndexForTime(newTODOs, newTime);
      } else {
        toIndex = getFreeIndexForDuration(newTODOs, fromIndex, TODO.duration);
        if (nextTime && nextTime.type === "fixed") {
          console.log("set next time");
          newTime = new Date(TODO.time);
          newTime.setHours(nextTime.time, 0, 0, 0);
          newTime.setDate(newTime.getDate() + 1);
        } else {
          // set time to start of free time
          newTime =
            toIndex === 0
              ? new Date().getTime()
              : newTODOs[toIndex - 1].time + newTODOs[toIndex - 1].duration;
        }
      }
      TODO.time = newTime.getTime();

      newTODOs.splice(toIndex, 0, TODO);
    } else newTODOs.splice(fromIndex, 1);
    updateTODOs(newTODOs);
  }

  function getDraggableItems(newTODOs) {
    let newDraggableItems = [];
    let lastTODODay = null;
    newTODOs.map((newTODO, index) => {
      let beginOfDay = new Date(newTODO.time).getDay() !== lastTODODay;

      let date = new Date(newTODO.time);
      let happenToday = date.getDate() === new Date().getDate();
      if (beginOfDay) {
        let label = new Date(newTODO.time).toDateString();
        if (date.getDate() === new Date().getDate() + 1) label = "Tomorrow";
        else if (happenToday) {
          label = "Today";
        }
        if (!(index === 0 && happenToday))
          newDraggableItems.push({
            isLabel: true,
            label: label,
          });
      }

      newDraggableItems.push(JSON.parse(JSON.stringify(newTODO)));
      lastTODODay = new Date(newTODO.time).getDay();
    });
    return newDraggableItems;
  }

  function getTodosFromDraggable(draggableItems) {
    draggableItems.map((draggableItem, index) => {
      if (draggableItem.isLabel) {
        draggableItems.splice(index, 1);
        return;
      }
    });
    return draggableItems;
  }

  async function getTODOs() {
    try {
      let todosJSON = await AsyncStorage.getItem("TODOs");
      let newTODOs = JSON.parse(todosJSON);

      // manipulate existing todos
      // newTODOs.map((newTODO, index) => {
      //   if (newTODO.key === "Tidur") {
      //     newTODO.duration = 1000 * 60 * 60 * 3;
      //     // if (newTODO.isLabel === true) {
      //     // newTODOs.splice(index, 1);
      //   }
      // });
      // await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));

      console.log("dbTODOS", newTODOs);
      setTODOs(newTODOs ?? []);
    } catch (error) {}
  }

  function handlePinchStart({ nativeEvent: currentGesture }) {
    console.log("pinch started");
    lastGestureRef.current[currentGesture.identifier] = currentGesture;
  }

  function findItem(draggableItems, index, direction) {
    if (direction === "front") {
      for (let i = index + 1; i < draggableItems.length; i++) {
        if (!draggableItems[i].isLabel) return draggableItems[i];
      }
    } else if (direction === "back") {
      for (let i = index - 1; i >= 0; i--) {
        if (!draggableItems[i].isLabel) return draggableItems[i];
      }
    }
    return null;
  }

  function handleReposition({ data: draggableItems, from, to }) {
    console.log("to", to);
    if (to > 0) {
      let preFrom = findItem(draggableItems, from, "back");
      console.log("prefrom", preFrom);
      let postFrom = findItem(draggableItems, from, "front");
      let preTo = findItem(draggableItems, to, "back");
      let postTo = findItem(draggableItems, to, "front");
      let preFromBad =
        preFrom === null
          ? false
          : preFrom.time + preFrom.duration > draggableItems[from].time;
      let postFromBad =
        from === draggableItems.length - 1
          ? false
          : postFrom.time <
            draggableItems[from].time + draggableItems[from].duration;
      let preToBad =
        preTo === null
          ? false
          : preTo.time + preTo.duration > draggableItems[to].time;
      let postToBad =
        to === draggableItems.length - 1
          ? false
          : postTo.time < draggableItems[to].time + draggableItems[to].duration;

      if (preFromBad || postFromBad || preToBad || postToBad) {
        // need reschedule
        if (preFromBad || postFromBad) {
          ToastAndroid.show("Bad original, rescheduling...", 1500);
          fixFromIndex(draggableItems, to);
        } else if (preToBad || postToBad) {
          ToastAndroid.show("Bad destination, rescheduling...", 1500);
          fixFromIndex(draggableItems, to);
        }
      }
    } else {
      console.log("p2", from, to, draggableItems[to]);
      if (to === 0) {
        // drag to top
        draggableItems[to].time = new Date().getTime();
        fixFromIndex(draggableItems, 1);
      }
    }
    updateTODOs(getTodosFromDraggable(draggableItems));
  }

  const renderItem = (params) => {
    let isLabel = params.item.isLabel;
    let draggableItem = params.item;
    return (
      <View key={params.item.time}>
        {!isLabel && (
          <SwipeableButton
            {...params}
            navigation={navigation}
            deleteTODO={deleteTODO}
          />
        )}
        {isLabel && (
          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text>{draggableItem.label}</Text>
          </View>
        )}
      </View>
    );
  };

  function getStateName(state) {
    switch (state) {
      case State.ACTIVE:
        return "active";
      case State.BEGAN:
        return "began";
      case State.CANCELLED:
        return "cancelled";
      case State.END:
        return "end";
      case State.FAILED:
        return "failed";
      case State.UNDETERMINED:
        return "undetermined";
    }
  }

  function prepareNewTODO() {
    setNewTODO(defaultTODO);
    setModalVisible(true);
  }

  function handlePinch({ nativeEvent }) {
    // console.log("handle gesture end", props.currentTarget)

    if (nativeEvent.scale > 1.5) {
      prepareNewTODO();
    } else {
    }
  }

  async function updateTODOs(newTODOs) {
    try {
      setTODOs(newTODOs);
      await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));
    } catch (error) {
      console.log("Error:", error);
      // Error saving data
    }
  }

  function addTODO(newTODO, TODOs) {
    let newTODOs = JSON.parse(JSON.stringify(TODOs));
    let index = newTODOs.length;
    for (var x = 0; x < newTODOs.length; x++) {
      if (newTODOs[x].time < new Date().getTime()) continue;
      let lastFinishTime =
        x === 0
          ? new Date().getTime()
          : newTODOs[x - 1].time + newTODOs[x - 1].duration;
      let now = new Date().getTime();
      let availableStartTime = lastFinishTime >= now ? lastFinishTime : now;
      if (newTODOs[x].time - newTODO.duration >= availableStartTime) {
        index = x;
        break;
      }
    }
    console.log("index", index);
    newTODO.time =
      index === 0
        ? new Date().getTime()
        : newTODOs[index - 1].time + newTODOs[index - 1].duration;

    newTODOs.splice(index, 0, newTODO);
    updateTODOs(newTODOs);
  }

  async function expandTODO(item) {
    console.log("expand todo");
    let newTODOs = JSON.parse(JSON.stringify(TODOs));
    let newTODO = newTODOs.find((newTODO) => newTODO.key === item.key);
    newTODO.duration += 1000 * 60 * 60;
    updateTODOs(newTODOs);
    ToastAndroid.show(item.text + " expanded", 1000);
  }

  function handleItemPinch(nativeEvent, item) {
    console.log("handle item pinch");
    if (nativeEvent.scale > 1) {
      expandTODO(item);
    }
  }

  function getFreeIndexForDuration(TODOs, currentIndex, duration) {
    for (let x = currentIndex + 1; x < TODOs.length; x++) {
      if (TODOs[x].time > TODOs[x - 1].time + TODOs[x - 1].duration) return x;
    }
    return TODOs.length;
  }

  function getIndexForTime(TODOs, time) {
    for (let x = 0; x < TODOs.length; x++) {
      if (TODOs[x].time > time) return x;
    }
    return TODOs.length;
  }

  function fixFromIndex(data, fromIndex) {
    for (let x = fromIndex; x < data.length; x++) {
      let item = data[x];
      if (item.isLabel) continue;
      let preItem = findItem(data, x, "back");
      let lastItemFinishTime = preItem.time + preItem.duration;
      if (item.time < lastItemFinishTime) item.time = lastItemFinishTime;
      else break;
    }
  }

  const pinch = Gesture.Pinch().onStart(() => {
    console.log("pinch 1 started");
  });

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <PinchGestureHandler
              ref={pinchHandler}
              simultaneousHandlers={[tapHandler, draggableHandler]}
              onEnded={() => prepareNewTODO()}
            >
              <TapGestureHandler
                ref={tapHandler}
                simultaneousHandlers={[pinchHandler, draggableHandler]}
                minPointers={2}
                onEnded={() => console.log("double tap happen")}
              >
                <View style={{ flex: 1 }}>
                  <StatusBar barStyle="dark-content" />
                  <View style={{ display: "flex", flex: 1 }}>
                    <HomeScreen
                      navigation={navigation}
                      modalVisible={modalVisible}
                      setModalVisible={setModalVisible}
                      newTODO={newTODO}
                      setNewTODO={setNewTODO}
                      addTODO={addTODO}
                      TODOs={TODOs}
                      pinchOutside={itemPinch}
                    >
                      <DraggableFlatList
                        ref={draggableHandler}
                        simultaneousHandlers={[tapHandler, pinchHandler]}
                        data={draggableItems}
                        onDragEnd={handleReposition}
                        keyExtractor={(item) => item.key}
                        renderItem={renderItem}
                        itemExitingAnimation={FadeOut.duration(3000)}
                        activationDistance={0}
                      />
                    </HomeScreen>
                  </View>
                </View>
              </TapGestureHandler>
            </PinchGestureHandler>
          </SafeAreaProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={App1} />
        <Stack.Screen
          name="Details"
          component={TodoDetails}
          options={({ route }) => ({ title: route.params.todo.text })}
        />
      </Stack.Navigator>
    </NavigationContainer>
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

export default App;
