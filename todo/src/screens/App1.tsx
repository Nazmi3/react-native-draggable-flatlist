import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, LayoutAnimation } from "react-native";
import useCachedResources from "../../hooks/useCachedResources";
import useColorScheme from "../../hooks/useColorScheme";
import HomeScreen from "./HomeScreen";
import "react-native-gesture-handler";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TodoDetails from "./TodoDetails";
import { useImperativeHandle, Children } from "react";
import { StyleSheet, ToastAndroid, StatusBar } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Item, getColor, getDraggableItems } from "../../src/utils";
import SwipeableButton from "../../components/SwipeableButton";
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
import moment from "moment";
import {
  createSharedElementStackNavigator,
  SharedElement,
} from "react-navigation-shared-element";
import { v4 as uuid } from "uuid";

export default function App1({ navigation }) {
  const defaultTODO = {
    id: 0,
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
  const layoutAnimConfig = {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    // delete: {
    //   duration: 100,
    //   type: LayoutAnimation.Types.easeInEaseOut,
    //   property: LayoutAnimation.Properties.opacity,
    // },
  };

  useFocusEffect(
    useCallback(() => {
      retrieveTODOs();
    }, [])
  );

  useEffect(() => {
    setDraggableItems(getDraggableItems(TODOs));
    LayoutAnimation.configureNext(layoutAnimConfig);
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
        if (TODO.repeat.every === "month") {
          newTime.setMonth(newTime.getMonth() + 1);
          if (TODO.repeat.date) newTime.setDate(TODO.repeat.date);
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
        } else if (TODO.repeat.every === "weekDay") {
          let daysToNextWorkingDay;
          // monday is 1
          let currentDay = newTime.getDay();
          daysToNextWorkingDay = currentDay === 5 ? 3 : 1;
          let dayMillis = 1000 * 60 * 60 * 24;
          newTime.setTime(newTime.getTime() + dayMillis * daysToNextWorkingDay);
        } else if (TODO.repeat.every === "solatTime") {
          newTime.setTime((await retrieveNextSolatTime()).valueOf());
        } else throw "no date set";

        toIndex = getIndexForTime(newTODOs, newTime);
      } else {
        toIndex = getFreeIndexForDuration(newTODOs, fromIndex, TODO.duration);
        if (nextTime && nextTime.type === "fixed") {
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

  function getTodosFromDraggable(draggableItems) {
    draggableItems.map((draggableItem, index) => {
      if (draggableItem.isLabel === true) {
        draggableItems.splice(index, 1);
        return;
      }
    });
    return draggableItems;
  }

  async function retrieveNextSolatTime() {
    try {
      let month = 11;
      let athanData = await storage.get("athanTimes");
      if (!athanData) {
        let resp = await axios.get(
          "http://api.aladhan.com/v1/calendar?latitude=3.080601&longitude=101.589644&month=" +
            month +
            "&year=2022&annual=false&school=0&timezonestring=Asia/Kuala_Lumpur",
          {
            // params: {
            // articleID: articleID
            // }
          }
        );
        athanData = {
          month: month,
          data: resp.data.data,
        };
        await storage.set("athanTimes", athanData);
      } else {
      }

      let timeDay0 = athanData.data[0];
      // timings Object {
      //   "Asr": "16:19 (+08)",
      //   "Dhuhr": "12:57 (+08)",
      //   "Fajr": "05:38 (+08)",
      //   "Firstthird": "22:57 (+08)",
      //   "Imsak": "05:28 (+08)",
      //   "Isha": "20:08 (+08)",
      //   "Lastthird": "02:57 (+08)",
      //   "Maghrib": "18:57 (+08)",
      //   "Midnight": "00:57 (+08)",
      //   "Sunrise": "06:57 (+08)",
      //   "Sunset": "18:57 (+08)",
      // }
      let date = timeDay0.date.gregorian.date;
      let isyakHour = timeDay0.timings.Isha.slice(0, 2);
      let isyakMinute = timeDay0.timings.Isha.slice(3, 5);
      let nextPrayTime;

      function getCurrentPray() {
        let currentTime = moment().valueOf();
        if (currentTime < getPrayTimeForToday("subuh").valueOf())
          return "isyak";
        else if (currentTime < getPrayTimeForToday("zohor").valueOf())
          return "subuh";
        else if (currentTime < getPrayTimeForToday("asar").valueOf())
          return "zohor";
        else if (currentTime < getPrayTimeForToday("maghrib").valueOf())
          return "asar";
        else if (currentTime < getPrayTimeForToday("isyak").valueOf())
          return "maghrib";
      }
      let currentPray = getCurrentPray();

      function prayMap(pray) {
        switch (pray) {
          case "subuh":
            return "Fajr";
          case "zohor":
            return "Dhuhr";
          case "asar":
            return "Asr";
          case "maghrib":
            return "Maghrib";
          case "isyak":
            return "Isha";
          default:
            throw "cannot return pray map";
        }
      }

      function getPrayTimeForToday(pray: string) {
        let prayHour = timeDay0.timings[prayMap(pray)].slice(0, 2);
        let prayMinute = timeDay0.timings[prayMap(pray)].slice(3, 5);
        return moment().hour(prayHour).minute(prayMinute).second(0);
      }
      switch (currentPray) {
        case "subuh":
          nextPrayTime = getPrayTimeForToday("zohor");
          break;
        case "zohor":
          nextPrayTime = getPrayTimeForToday("asar");
          break;
        case "asar":
          nextPrayTime = getPrayTimeForToday("maghrib");
          break;
        case "maghrib":
          nextPrayTime = getPrayTimeForToday("isyak");
          break;
        case "isyak":
          nextPrayTime = getPrayTimeForToday("subuh");
          let currentTime = moment();
          if (
            currentTime.hours() > nextPrayTime.hours() &&
            currentTime.minutes() > nextPrayTime.minutes()
          ) {
            nextPrayTime.add(1, "days");
          }
          break;
        default:
          throw "cannot generate next pray time";
      }

      return nextPrayTime;
    } catch (error) {
      console.log("error retrieve", error);
      throw error;
    }
  }

  async function retrieveTODOs() {
    try {
      let todosJSON = await AsyncStorage.getItem("TODOs");
      let newTODOs = JSON.parse(todosJSON);

      // migrate existing todos
      newTODOs.map((newTODO, index) => {
        // if (newTODO.key === "Tidur") {
        //   newTODO.duration = 1000 * 60 * 60 * 3;
        // }
        if (newTODO.isLabel === true) {
          newTODOs.splice(index, 1);
        }
      });
      await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));

      setTODOs(newTODOs ?? []);
    } catch (error) {}
  }

  function handlePinchStart({ nativeEvent: currentGesture }) {
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
    if (from === to) return;
    if (to > 0) {
      let preFrom = findItem(draggableItems, from, "back");
      let postFrom = findItem(draggableItems, from, "front");
      let preDragged = findItem(draggableItems, to, "back");
      let postTo = findItem(draggableItems, to, "front");

      let draggedItem = draggableItems[to];
      draggedItem.time = preDragged.time + preDragged.duration;

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
        preDragged === null
          ? false
          : preDragged.time + preDragged.duration > draggedItem.time;
      let postToBad =
        to === draggableItems.length - 1
          ? false
          : postTo.time < draggedItem.time + draggedItem.duration;

      if (preFromBad || postFromBad || preToBad || postToBad) {
        // need reschedule
        if (preFromBad || postFromBad) {
          ToastAndroid.show("Bad original, rescheduling...", 1500);
          fixFromIndex(draggableItems, to);
        } else if (preToBad || postToBad) {
          if (preToBad) {
            ToastAndroid.show("Bad preto, rescheduling...", 1500);

            fixFromIndex(draggableItems, to);
          } else {
            ToastAndroid.show("Bad posto, rescheduling...", 1500);

            fixFromIndex(draggableItems, to + 1);
          }
        }
      }
    } else {
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
      <View key={draggableItem.id}>
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
    setNewTODO({ ...defaultTODO, id: uuid() });
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
      // LayoutAnimation.configureNext(layoutAnimConfig);
      await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));
    } catch (error) {
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
    newTODO.time =
      index === 0
        ? new Date().getTime()
        : newTODOs[index - 1].time + newTODOs[index - 1].duration;

    newTODOs.splice(index, 0, newTODO);
    updateTODOs(newTODOs);
  }

  async function expandTODO(item) {
    let newTODOs = JSON.parse(JSON.stringify(TODOs));
    let newTODO = newTODOs.find((newTODO) => newTODO.key === item.key);
    newTODO.duration += 1000 * 60 * 60;
    updateTODOs(newTODOs);
    ToastAndroid.show(item.text + " expanded", 1000);
  }

  function handleItemPinch(nativeEvent, item) {
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

  function dragToNow() {
    let newTODOs = JSON.parse(JSON.stringify(TODOs));

    let now = new Date().getTime();
    if (newTODOs[0] && newTODOs[0].time > now) {
      ToastAndroid.show("Reschedule to now...", 1500);
      let dragMillis = newTODOs[0].time - now;
      newTODOs.map((newTODO, index) => {
        newTODO.time = newTODO.time - dragMillis;
      });
    } else {
      ToastAndroid.show("You have dued task", 1500);
    }

    updateTODOs(newTODOs);
  }

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PinchGestureHandler
          ref={pinchHandler}
          simultaneousHandlers={[tapHandler, draggableHandler]}
          onEnded={() => prepareNewTODO()}
        >
          <TapGestureHandler
            ref={tapHandler}
            simultaneousHandlers={[pinchHandler, draggableHandler]}
            minPointers={2}
            onEnded={dragToNow}
          >
            <View style={{ flex: 1 }}>
              <StatusBar backgroundColor="#fe7d81" />
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
                  keyExtractor={(item) => {
                    return item.id;
                  }}
                  renderItem={renderItem}
                  itemExitingAnimation={FadeOut.duration(3000)}
                  activationDistance={0}
                />
              </HomeScreen>
            </View>
          </TapGestureHandler>
        </PinchGestureHandler>
      </GestureHandlerRootView>
    );
  }
}
