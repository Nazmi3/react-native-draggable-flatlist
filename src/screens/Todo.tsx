import React, { useEffect, useState, useCallback } from "react";
import ActionProvider from "../components/ActionProvider";
import "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { getDraggableItems, getIndexForTime } from "../utils/index";
import SwipeableButton from "../../components/SwipeableButton";
import { LayoutAnimation, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { setTODOs } from "../store/todoSlice";
import style from "../style";
import "react-native-gesture-handler";
import { v4 as uuid } from "uuid";
import { useDispatch } from "react-redux";

const Todo = ({ navigation, route: { params } }) => {
  const defaultTODO = {
    id: 0,
    repeat: false,
  };

  const TODOs = useSelector((state) => state.todos);
  const [draggableItems3, setDraggableItems3] = useState([]);
  const draggableHandler = React.createRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTODO, setNewTODO] = useState(defaultTODO);
  const dispatch = useDispatch();
  const setAnimation = () => {
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
  function prepareNewTODO() {
    setNewTODO({ ...defaultTODO, id: uuid() });
    setModalVisible(true);
  }

  console.log("draggableItems", draggableItems3);

  useFocusEffect(
    useCallback(() => {
      console.log("focus 1");
      retrieveTODOs();
    }, [])
  );

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

  function modifyTODO(newTODO, TODOs) {
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

  async function updateTODOs(newTODOs) {
    try {
      dispatch(setTODOs(newTODOs));
      await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));
    } catch (error) {
      // Error saving data
    }
  }

  useEffect(() => {
    setAnimation();
    setDraggableItems3(getDraggableItems(TODOs));
  }, [TODOs]);

  async function deleteTODO(todo: any) {
    console.log("delete todo", todo);
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
        } else if (TODO.repeat.every === "solatTime") {
          let nextPrayerTime = new Date(TODO.time);
          console.log("hourse", nextPrayerTime.getHours());
          switch (nextPrayerTime.getHours()) {
            case 6:
              nextPrayerTime.setHours(13);
              break;
            case 13:
              nextPrayerTime.setHours(16);
              break;
            case 16:
              nextPrayerTime.setHours(19);
              break;
            case 19:
              nextPrayerTime.setHours(20);
              break;
            case 20:
              nextPrayerTime.setTime(
                nextPrayerTime.getTime() + 1000 * 60 * 60 * 24
              );
              nextPrayerTime.setHours(6);
              break;
            default:
          }
          console.log("hourse 2", nextPrayerTime.getHours());
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

  async function retrieveTODOs() {
    try {
      let todosJSON = await AsyncStorage.getItem("TODOs");
      let newTODOs = todosJSON !== "null" ? JSON.parse(todosJSON) : [];

      // migrate existing todos
      newTODOs.map((newTODO, index) => {
        // if (newTODO.key === "Tidur") {
        //   newTODO.duration = 1000 * 60 * 60 * 3;
        // }
        if (newTODO.type === "label") {
          newTODOs.splice(index, 1);
        }
      });
      console.log("new todo", newTODOs);
      await AsyncStorage.setItem("TODOs", JSON.stringify(newTODOs));
      dispatch(setTODOs(newTODOs ?? []));
    } catch (error) {}
  }

  const renderTodoBox = (params) => {
    let type = params.item.type;
    let draggableItem = params.item;
    return (
      <View key={draggableItem.key}>
        {type === "todo" && (
          <SwipeableButton
            {...params}
            navigation={navigation}
            deleteTODO={deleteTODO}
          />
        )}
        {type === "label" && (
          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text>{draggableItem.label}</Text>
          </View>
        )}
        {type === "padding" && (
          <View
            style={[
              style.padder,
              {
                display: "flex",
                alignItems: "center",
                borderTopLeftRadius: draggableItem.topOfDay ? 10 : 0,
                borderTopRightRadius: draggableItem.topOfDay ? 10 : 0,
                borderBottomLeftRadius: draggableItem.bottomOfDay ? 10 : 0,
                borderBottomRightRadius: draggableItem.bottomOfDay ? 10 : 0,
                padding: 10,
              },
            ]}
          ></View>
        )}
      </View>
    );
  };

  return (
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
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          ref={draggableHandler}
          data={draggableItems3}
          onDragEnd={({ data }) => {
            updateTODOs(data.filter((item) => item.type === "todo"));
          }}
          keyExtractor={(item) => {
            return item.key;
          }}
          renderItem={renderTodoBox}
          activationDistance={0}
        />
      </View>
    </ActionProvider>
  );
};

export default Todo;
