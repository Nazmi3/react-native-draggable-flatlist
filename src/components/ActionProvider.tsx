import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
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
  NativeSyntheticEvent,
  TextInputEndEditingEventData,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList from "react-native-draggable-flatlist";

import { Item, getColor } from "../utils";
import { FAB } from "react-native-paper";
import { StyleSheet } from "react-native";
import { Icon, VStack } from "@react-native-material/core";
import { defaultTODO } from "../screens/AppChild";
import style from "../style";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

const ActionProvider = (
  {
    modalVisible,
    setModalVisible,
    newTODO,
    children,
    onEndEdit,
    TODOs,
    onPressFab,
  }: {
    onEndEdit: (
      e: NativeSyntheticEvent<TextInputEndEditingEventData>,
      textInput: any
    ) => void;
  },
  uppRef
) => {
  const nameInputRef = useRef();

  const [textInput, setTextInput] = useState("");

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
    <View style={{ flex: 1, position: "relative" }}>
      <FAB
        icon={({ size, color }) => <Icon name="plus" size={24} color={color} />}
        style={styles.fab}
        onPress={onPressFab}
        accessibilityLabelledBy={undefined}
        accessibilityLanguage={undefined}
        onPointerEnter={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeave={undefined}
        onPointerLeaveCapture={undefined}
        onPointerMove={undefined}
        onPointerMoveCapture={undefined}
        onPointerCancel={undefined}
        onPointerCancelCapture={undefined}
        onPointerDown={undefined}
        onPointerDownCapture={undefined}
        onPointerUp={undefined}
        onPointerUpCapture={undefined}
      />
      <View style={{ padding: 10, flex: 1, justifyContent: "space-between" }}>
        {children}
      </View>

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
          <VStack
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 10,
            }}
            spacing={10}
          >
            <TextInput
              style={{ fontSize: 20, minWidth: 100 }}
              ref={(ref) => {
                nameInputRef.current = ref;
              }}
              onChangeText={(t) => {
                setTextInput(t);
              }}
              onEndEditing={(
                e: NativeSyntheticEvent<TextInputEndEditingEventData>
              ) => onEndEdit(e, textInput)}
              placeholder="Name"
              value={newTODO.text}
            />
            <Pressable
              style={[{ padding: 10, opacity: 0.5 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text>Close</Text>
            </Pressable>
          </VStack>
        </View>
      </Modal>
    </View>
  );
};

export default React.forwardRef(ActionProvider);
