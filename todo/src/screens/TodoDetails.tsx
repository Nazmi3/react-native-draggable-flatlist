import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import {
  Modal,
  View,
  Text,
  Slider,
  TextInput,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList from "react-native-draggable-flatlist";

import SwipeableButton, {
  getStringDuration,
} from "../../components/SwipeableButton";
import { PinchGestureHandler } from "react-native-gesture-handler";
import { SharedElement } from "react-navigation-shared-element";
// import Slider from "@react-native-community/slider";

const Details = ({
  navigation,
  route: {
    params: { todo },
  },
}) => {
  return (
    <>
      <SharedElement id={todo.time}>
        <View style={{ padding: 20 }}>
          <Text>{getStringDuration(todo.duration)}</Text>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
          <Text>
            {todo.repeat
              ? `Every ${todo.repeat.every}${
                  todo.repeat.date ? " at " + todo.repeat.date + "th" : ""
                }`
              : ""}
          </Text>
        </View>
      </SharedElement>
    </>
  );
};

Details.sharedElements = (route) => {
  const { todo } = route.params;
  console.log("item");
  return [
    {
      id: todo.time,
      animation: "move",
      resize: "clip",
    },
  ];
};

export default Details;
