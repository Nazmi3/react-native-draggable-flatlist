import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, LayoutAnimation } from "react-native";
import useCachedResources from "../../hooks/useCachedResources";
import useColorScheme from "../../hooks/useColorScheme";
import ActionProvider from "../components/ActionProvider";
import "react-native-gesture-handler";
import {
  FlatList,
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { StyleSheet, ToastAndroid, StatusBar } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Item, getColor, getDraggableItems } from "../utils/index";
import Commitment from "../components/CommitmentItemList";
import { add, get, update, remove, execute } from "../manager/sqlite";
import { FadeOut } from "react-native-reanimated";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment, { months } from "moment";
import { v4 as uuid } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import CommitmentDetails from "./CommitmentDetails";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import {
  addcommitment,
  refreshCommitments,
  updateCommitment,
} from "../store/commitmentSlice";
import styles from "../style";
import Box from "../components/Box";

const Stack = createSharedElementStackNavigator();

export default function Home({ navigation }) {
  const defaultTODO = {
    id: 0,
    repeat: false,
  };
  const isLoadingComplete = useCachedResources();
  const tapHandler = React.createRef();
  const pinchHandler = React.createRef();
  const draggableHandler = React.createRef<FlatList<any>>();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTODO, setNewTODO] = useState(defaultTODO);
  const [totalCommitment, setTotalCommitment] = useState(null);

  const commitments = useSelector((state) => state.commitments);
  const TODOs = useSelector((state) => state.todos);
  const [movable, setMovable] = useState<any[]>([]);
  const nextMonthIndex = useRef<null | number>(null);
  const dispatch = useDispatch();

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

  console.log("commitments", movable);

  useFocusEffect(
    useCallback(() => {
      // focusing
      retrieveCommitments();
      LayoutAnimation.configureNext(layoutAnimConfig);
    }, [])
  );

  useEffect(() => {
    let draggableItemT = [];

    // insert next month label
    let inserted = false;
    for (let commitm of commitments) {
      let time = new Date(commitm.time);
      let now = new Date();
      if (
        !inserted &&
        time.getFullYear() >= now.getFullYear() &&
        time.getMonth() > now.getMonth()
      ) {
        draggableItemT.push({
          id: "Next Month",
          isLabel: true,
          label: "Next Month",
        });
        inserted = true;
      }
      draggableItemT.push(commitm);
    }
    nextMonthIndex.current = draggableItemT.length - 1;

    // count total commitment
    let totalCommitment = 0;
    commitments.map((commitment) => (totalCommitment += commitment.cost));
    setTotalCommitment(totalCommitment);

    setMovable(draggableItemT);
  }, [commitments]);

  function setField(table, searchKey, searchValue, key, value) {
    switch (table) {
      case "commitment":
        setCommitment(
          commitments.map((c) => {
            if (c[searchKey] === searchValue) {
              c[key] = value;
              return c;
            } else {
              return c;
            }
          })
        );
        break;
      default:
    }
  }

  async function deleteCommitment(commitm: any) {
    dispatch(updateCommitment(commitments.filter((c) => c.id !== commitm.id)));
    remove("commitment", commitm.id);
  }

  async function retrieveCommitments() {
    console.log("retrieve comments");
    dispatch(refreshCommitments());
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

  function handleReposition({ data: newMovables, from, to }) {
    setMovable(newMovables);
    if (from < nextMonthIndex.current && to >= nextMonthIndex.current) {
      // moved to next month
      nextMonthIndex.current = nextMonthIndex.current - 1;
      moveMonth(newMovables[to], 1);
    } else if (from > nextMonthIndex.current && to <= nextMonthIndex.current) {
      // moved to current month
      nextMonthIndex.current = nextMonthIndex.current + 1;
      moveMonth(newMovables[to], -1);
    }
  }

  function moveMonth(item, month: number) {
    let nextMonth = item.time ? new Date(item.time) : new Date();
    let now = new Date();
    nextMonth.setFullYear(now.getFullYear());
    nextMonth.setMonth(nextMonth.getMonth() + month);
    item.time = nextMonth.toISOString();
    update("commitment", "time", item);
  }

  const renderItem = (params) => {
    let item = params.item;
    return (
      <View key={item.id}>
        {!item.isLabel && (
          <Commitment
            {...params}
            navigation={navigation}
            deleteCommitment={deleteCommitment}
          />
        )}
        {item.isLabel && (
          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text>{item.label}</Text>
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

  async function updateTODOs(newTODOs) {
    try {
      setTODOs(newTODOs);
      // LayoutAnimation.configureNext(layoutAnimConfig);
      await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));
    } catch (error) {
      // Error saving data
    }
  }

  function addTODO(newCommitment, TODOs) {
    newCommitment.time = new Date().toISOString();
    add("commitment", newCommitment);
    dispatch(addcommitment(newCommitment));
    // setCommitment([...commitments, newCommitment]);
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

  function CommitmentScreen() {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PinchGestureHandler
          ref={pinchHandler}
          waitFor={draggableHandler}
          simultaneousHandlers={[draggableHandler]}
          onCancelled={() => {
            console.log("cancelled pinch");
          }}
          onEnded={() => prepareNewTODO()}
        >
          <View style={{ flex: 1 }}>
            <StatusBar backgroundColor="#fe7d81" />
            <ActionProvider
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              newTODO={newTODO}
              setNewTODO={setNewTODO}
              onEndEdit={(e, textInput) => {
                console.log("on finish edit", e, "yo");
                setModalVisible(false);
                addTODO(
                  {
                    ...defaultTODO,
                    text: textInput,
                    key: textInput,
                    backgroundColor: "green",
                    height: 75,
                    time: new Date().getTime(),
                    duration: 1000 * 60 * 30,
                  },
                  TODOs
                );
              }}
              TODOs={TODOs}
              onPressFab={() => prepareNewTODO()}
            >
              <View style={{ paddingBottom: 70 }}>
                <DraggableFlatList
                  ref={draggableHandler}
                  simultaneousHandlers={[tapHandler, pinchHandler]}
                  data={movable}
                  onDragBegin={() => console.log("drag begin")}
                  onDragEnd={handleReposition}
                  keyExtractor={(item) => {
                    return item.key;
                  }}
                  renderItem={renderItem}
                  activationDistance={0}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  backgroundColor: "white",
                  position: "absolute",
                  bottom: 15,
                }}
              >
                <Box>
                  <Text
                    style={{ fontSize: 20 }}
                  >{`RM ${totalCommitment}`}</Text>
                </Box>
              </View>
            </ActionProvider>
          </View>
        </PinchGestureHandler>
      </GestureHandlerRootView>
    );
  }

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Stack.Navigator style={{ backgroundColor: "transparent" }}>
        <Stack.Screen
          style={{ backgroundColor: "transparent" }}
          name="Main"
          component={CommitmentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommitmentDetails"
          component={CommitmentDetails}
          options={({ route }) => ({
            title: route.params.commitment.text,
            headerShown: false,
          })}
        />
      </Stack.Navigator>
    );
  }
}
