import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ToastAndroid,
  FlatList,
  ImageBackground,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList from "react-native-draggable-flatlist";

import { Item, getColor } from "../utils";
import { SharedElement } from "react-navigation-shared-element";

const HomeScreen = (
  {
    modalVisible,
    setModalVisible,
    newTODO,
    setNewTODO,
    pinchOutside,
    navigation,
    children,
    addTODO,
    TODOs,
  },
  uppRef
) => {
  // return (<View></View>)
  const nameInputRef = useRef();

  function dragToNow() {
    ToastAndroid.show("Dragging up timeline...", 1500);
    let drag = TODOs[0].time - new Date().getTime();
    let newTODOs = JSON.parse(JSON.stringify(TODOs));
    for (let x = 0; x < newTODOs.length; x++) {
      newTODOs[x].time = newTODOs[x].time - drag;
    }
    updateTODOs(newTODOs);
  }

  useEffect(() => {
    if (modalVisible)
      // nameInputRef.current.focus()
      setTimeout(() => nameInputRef.current.focus(), 200);
  }, [modalVisible]);

  return (
    <View style={{ display: "flex", flex: 1 }}>
      <View style={{ padding: 10 }}>{children}</View>

      <Modal
        animationType="fade"
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
            }}
          >
            <TextInput
              style={{ fontSize: 20, minWidth: 100 }}
              ref={(ref) => {
                nameInputRef.current = ref;
              }}
              onChangeText={(t) => {
                setNewTODO({
                  ...newTODO,
                  text: t,
                  key: t,
                  backgroundColor: "green",
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
    </View>
  );
};

export default React.forwardRef(HomeScreen);
