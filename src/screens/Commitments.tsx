import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, LayoutAnimation } from "react-native";
import useCachedResources from "../../hooks/useCachedResources";
import ActionProvider from "../components/ActionProvider";
import "react-native-gesture-handler";
import {
  FlatList,
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { ToastAndroid, StatusBar } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Commitment from "../components/CommitmentItemList";
import { add, update, remove } from "../manager/sqlite";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuid } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import CommitmentDetails from "./Commitment";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import {
  addcommitment,
  refreshCommitments,
  updateCommitment,
} from "../store/commitmentSlice";
import Box from "../components/Box";

export const setAnimation = () => {
  LayoutAnimation.configureNext({
    duration: 250,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      springDamping: 0.7,
    },
  });
  LayoutAnimation.configureNext({
    duration: 500,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
  });
};

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
  const [movables, setMovables] = useState<any[]>([]);
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

  useFocusEffect(
    useCallback(() => {
      // focusing
      retrieveCommitments();
      LayoutAnimation.configureNext(layoutAnimConfig);
    }, [])
  );

  useEffect(() => {
    console.log("useEffect commitments");

    const millisstart = new Date().getTime();

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

    const millisnow = new Date().getTime();
    console.log("movables", draggableItemT);
    console.log("massage speed:" + (millisnow - millisstart) + "ms");
    setAnimation();
    setMovables(draggableItemT);
  }, [commitments]);

  function deleteCommitment(commitm: any) {
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
    setMovables(newMovables);
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

  // async function updateTODOs(newTODOs) {
  //   try {
  //     setTODOs(newTODOs);
  //     // LayoutAnimation.configureNext(layoutAnimConfig);
  //     await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));
  //   } catch (error) {
  //     // Error saving data
  //   }
  // }

  async function addCommitment(newCommitment, TODOs) {
    newCommitment.time = new Date().toISOString();
    const id = await add("commitment", newCommitment);
    newCommitment.id = id;
    dispatch(addcommitment(newCommitment));
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
                setModalVisible(false);
                addCommitment(
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
                  data={movables}
                  onDragBegin={() => console.log("drag begin")}
                  onDragEnd={handleReposition}
                  keyExtractor={(item) => {
                    return item.id;
                  }}
                  renderItem={renderItem}
                  activationDistance={0}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
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
