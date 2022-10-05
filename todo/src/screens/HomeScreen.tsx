import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import {
  StyleSheet,
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList from "react-native-draggable-flatlist";

import { Item, getColor } from "../utils";
import SwipeableButton from "../../components/SwipeableButton";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

export default React.forwardRef(function Basic(
  {
    modalVisible,
    setModalVisible,
    newTODO,
    setNewTODO,
    pinchOutside,
    navigation,
  },
  ref
) {
  console.log("navigation", navigation);
  // return (<View></View>)
  const [TODOs, setTODOs] = useState([]);
  const nameInputRef = useRef();

  useImperativeHandle(ref, () => ({
    dragToNow() {
      dragToNow();
    },
  }));

  function dragToNow() {
    ToastAndroid.show("Dragging up timeline...", 1500);
    let drag = TODOs[0].time - new Date().getTime();
    let newTODOs = JSON.parse(JSON.stringify(TODOs));
    for (let x = 0; x < newTODOs.length; x++) {
      newTODOs[x].time = newTODOs[x].time - drag;
    }
    updateTODOs(newTODOs);
  }

  async function getTODOs() {
    try {
      let todosJSON = await AsyncStorage.getItem("TODOs");
      console.log("todoJSON", todosJSON);
      let newTODOs = JSON.parse(todosJSON);
      console.log("newTODOS", newTODOs);

      // newTODOs = newTODOs.map((newTODO)=>{
      //   newTODO.duration = 1000 * 60 * 30
      //   return newTODO
      // })
      // console.log("new TODOS", newTODOs)
      // updateTODOs(newTODOs)

      setTODOs(newTODOs ?? []);
      // setTODOs([...JSON.parse(todosJSON),
      //   {
      //     text: `Kerja`,
      //     key: `kerja`,
      //     backgroundColor: getColor(3, 5),
      //     height: 75,
      //   }])
    } catch (error) {}
  }

  useEffect(() => {
    getTODOs();
  }, []);

  useEffect(() => {
    if (modalVisible)
      // nameInputRef.current.focus()
      setTimeout(() => nameInputRef.current.focus(), 100);
  }, [modalVisible]);

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
    if (recurrent) {
      const TODO = newTODOs.splice(fromIndex, 1)[0];
      const toIndex = getFreeIndexForDuration(
        newTODOs,
        fromIndex,
        TODO.duration
      );
      if (nextTime && nextTime.type === "fixed") {
        console.log("set next time");
        let newTime = new Date(TODO.time);
        newTime.setHours(nextTime.time, 0, 0, 0);
        newTime.setDate(newTime.getDate() + 1);
        TODO.time = newTime.getTime();
      } else {
        // set time to start of free time
        TODO.time =
          toIndex === 0
            ? new Date().getTime()
            : newTODOs[toIndex - 1].time + newTODOs[toIndex - 1].duration;
      }

      newTODOs.splice(toIndex, 0, TODO);
    } else newTODOs.splice(fromIndex, 1);
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

  function fixComparePrevious(data, fromIndex) {
    for (let x = fromIndex; x < data.length; x++) {
      if (data[x].time < data[x - 1].time + data[x - 1].duration)
        data[x].time = data[x - 1].time + data[x - 1].duration;
      else break;
    }
  }
  function handleReposition({ data, from, to }) {
    if (to > 0) {
      // data[to].time = data[to - 1].time + data[to - 1].duration;
      let preFromBad =
        from === 0
          ? false
          : data[from - 1].time + data[from - 1].duration > data[from].time;
      let postFromBad =
        from === data.length - 1
          ? false
          : data[from + 1].time < data[from].time + data[from].duration;
      let preToBad =
        to === 0
          ? false
          : data[to - 1].time + data[to - 1].duration > data[to].time;
      let postToBad =
        to === data.length - 1
          ? false
          : data[to + 1].time < data[to].time + data[to].duration;
      if (preFromBad || postFromBad || preToBad || postToBad) {
        // need reschedule
        if (preFromBad || postFromBad) {
          ToastAndroid.show("Bad original, rescheduling...", 1500);
          fixComparePrevious(data, to);
        } else {
          ToastAndroid.show("Bad destination, rescheduling...", 1500);
          fixComparePrevious(data, to);
        }
      }
    }
    updateTODOs(data);
  }

  const renderItem = (params) => {
    return (
      <PinchGestureHandler
        simultaneousHandlers={pinchOutside}
        onEnded={({ nativeEvent }) => handleItemPinch(nativeEvent, params.item)}
      >
        <View>
          <SwipeableButton
            {...params}
            navigation={navigation}
            deleteTODO={deleteTODO}
          />
        </View>
      </PinchGestureHandler>
    );
  };

  return (
    <>
      <View style={{ height: 10 }}></View>
      <DraggableFlatList
        data={TODOs}
        onDragEnd={handleReposition}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log("Modal has been closed.");
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 10,
              elevation: 2,
            }}
          >
            <TextInput
              style={{ fontSize: 20 }}
              ref={(ref) => {
                nameInputRef.current = ref;
              }}
              onChangeText={(t) => {
                setNewTODO({
                  text: t,
                  key: t,
                  backgroundColor: getColor(TODOs.length, 50),
                  height: 75,
                  time: new Date().getTime(),
                  duration: 1000 * 60 * 30,
                });
              }}
              onEndEditing={() => {
                console.log("on finish edit");
                setModalVisible(false);
                addTODO(newTODO, TODOs);
              }}
              placeholder="Name"
              value={newTODO.text}
            />
            <Pressable onPress={() => setModalVisible(false)}>
              <Text>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  rowItem: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});
