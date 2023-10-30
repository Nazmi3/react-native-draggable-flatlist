import React, { useEffect, useState, useCallback } from "react";
import ActionProvider from "../components/ActionProvider";
import "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { getDraggableItems, getIndexForTime } from "../utils/index";
import SwipeableButton from "../../components/SwipeableButton";
import { LayoutAnimation, Text, View, NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { setTODOs } from "../store/todoSlice";
import style from "../style";
import "react-native-gesture-handler";
import { v4 as uuid } from "uuid";
import { useDispatch } from "react-redux";
import { get } from "../manager/sqlite";

const { WidgetManager } = NativeModules;

const Todo = ({ navigation, route: { params } }) => {
  const defaultTODO = {
    id: 0,
    repeat: false,
  };

  const TODOs = useSelector((state) => state.todos);
  const [draggableItems, setDraggableItems] = useState([]);
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

  useFocusEffect(
    useCallback(() => {
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
    setDraggableItems(getDraggableItems(TODOs));
    if (TODOs[0])
      WidgetManager.setData(JSON.stringify({ title: TODOs[0].text }));
  }, [TODOs]);

  async function deleteTODO(todo: any) {
    console.log("delete todo", todo);
    let dbTODOs = JSON.parse(JSON.stringify(TODOs));
    // let dbTODOs = JSON.parse(JSON.stringify(TODOs.filter((item)=>item.type===)));
    const fromIndex = dbTODOs.findIndex((TODO) => TODO.key === todo.key);
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
      const TODO = dbTODOs.splice(fromIndex, 1)[0];
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

        toIndex = getIndexForTime(dbTODOs, newTime);
      } else {
        toIndex = getFreeIndexForDuration(dbTODOs, fromIndex, TODO.duration);
        if (nextTime && nextTime.type === "fixed") {
          newTime = new Date(TODO.time);
          newTime.setHours(nextTime.time, 0, 0, 0);
          newTime.setDate(newTime.getDate() + 1);
        } else {
          // set time to start of free time
          newTime =
            toIndex === 0
              ? new Date().getTime()
              : dbTODOs[toIndex - 1].time + dbTODOs[toIndex - 1].duration;
        }
      }
      TODO.time = newTime.getTime();

      dbTODOs.splice(toIndex, 0, TODO);
    } else dbTODOs.splice(fromIndex, 1);
    console.log("new todo", dbTODOs);
    updateTODOs(dbTODOs);
  }

  async function retrieveTODOs() {
    try {
      let todosJSON = await AsyncStorage.getItem("TODOs");
      let todosObject = todosJSON !== "null" ? JSON.parse(todosJSON) : [];
      let commitmentsObject = await get("commitment");

      // subtitute commitments
      commitmentsObject.map((commitment) => {
        let nowMillis = new Date().getTime();
        todosObject.push({
          id: 0,
          type: "commitment",
          duration: 1800000,
          key: commitment.text,
          repeat: false,
          text: `Bayar ${commitment.text}`,
          time: commitment.time
            ? new Date(commitment.time).getTime() + 1000 * 60 * 60 * 24 * 30
            : nowMillis,
        });
      });

      //sort
      todosObject.sort((todo1, todo2) => todo1.time - todo2.time);

      // migrate existing todos
      let foundWeird = true;
      while (foundWeird) {
        foundWeird = false;
        todosObject.map((newTODO, index) => {
          if (
            todosObject[index].text === "Bayar Transport: bulanan kereta" ||
            todosObject[index].text === "Bayar Takaful" ||
            todosObject[index].text === "Bayar Internet" ||
            todosObject[index].text ===
              "Bayar Transport: repair/upgrade kereta" ||
            todosObject[index].text === "Bayar Makan" ||
            todosObject[index].text === "Bayar Transport: my50" ||
            todosObject[index].text === "Bayar Duit mak ayah" ||
            todosObject[index].text === "Bayar Transport: insuran keret" ||
            todosObject[index].text === "Bayar Transport: bulanan axia" ||
            todosObject[index].text === "Bayar Insurans takaful" ||
            todosObject[index].text === "Bayar Ptptn"
          ) {
            foundWeird = true;
            todosObject.splice(index, 1);
          }
        });
      }
      await AsyncStorage.setItem("TODOs", JSON.stringify(todosObject));

      dispatch(setTODOs(todosObject ?? []));
    } catch (error) {}
  }

  const renderTodoItem = (params) => {
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
            <Text style={{ color: "white" }}>{draggableItem.label}</Text>
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
          data={draggableItems}
          onDragEnd={({ data }) => {
            updateTODOs(data.filter((item) => item.type === "todo"));
          }}
          keyExtractor={(item) => {
            return item.key;
          }}
          renderItem={renderTodoItem}
          activationDistance={0}
        />
      </View>
    </ActionProvider>
  );
};

export default Todo;
