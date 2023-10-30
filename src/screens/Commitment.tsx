import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";

import { getStringDuration } from "../../components/SwipeableButton";
import { HStack, VStack } from "@react-native-material/core";
import moment from "moment/moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SharedElement } from "react-navigation-shared-element";
import { TextInput } from "react-native-gesture-handler";

import { update } from "../manager/sqlite";
import { useDispatch } from "react-redux";
import { refreshCommitments } from "../store/commitmentSlice";
import { CheckBox } from "react-native-elements";

export const REPEAT = ["freeTime", "day", "weekDay", "month", "solatTime"];

export function resortTodo(todos, todo) {
  todos.sort(function (a, b) {
    return a.time - b.time;
  });
}

let count = 0;
const Details = ({ navigation, route: { params } }) => {
  const [commitment, setCommitment] = useState(params.commitment);
  const [duration, setDuration] = useState(params.commitment.duration);
  const [paidDate, setPaidDate] = useState(new Date(params.commitment.time));
  const [pickerMode, setPickerMode] = useState<string | null>(null);
  const [inTodos, setInTodos] = useState(params.commitment.inTodos);

  const d = useDispatch();

  useEffect(() => {
    console.log("commitment", commitment);
  }, [commitment]);

  function getStringDate(unix) {
    return moment(unix).format("DD/MM/YYYY");
  }

  return (
    <SharedElement id={`${commitment.text}_box`}>
      <View
        style={{
          backgroundColor: "white",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      >
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          <SharedElement id={commitment.text}>
            <Text
              style={{
                fontWeight: "500",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              {commitment.text}
            </Text>
          </SharedElement>
        </View>
        <VStack p={20} spacing={10}>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{getStringDuration(duration)}</Text>
          </View>

          {commitment.repeat && (
            <HStack>
              <Text>{` `}</Text>
            </HStack>
          )}
          {!commitment.repeat && (
            <HStack
              style={{
                alignItems: "center",
              }}
            >
              <Text>RM </Text>
              <TextInput
                style={{ minWidth: 100 }}
                keyboardType={"phone-pad"}
                defaultValue={commitment.cost?.toString()}
                onSubmitEditing={({ nativeEvent: { text } }) => {
                  let newCommitment = { ...commitment, cost: text };
                  setCommitment(newCommitment);
                  update("commitment", "cost", newCommitment);
                  d(refreshCommitments());
                }}
              />
            </HStack>
          )}
          <HStack
            spacing={0}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text>Include in todo</Text>
            <CheckBox
              checked={inTodos}
              size={18}
              onPress={() => {
                setInTodos(!inTodos);
                let newCommitment = { ...commitment, inTodos: !inTodos };
                update("commitment", "inTodos", newCommitment);
              }}
            />
          </HStack>
          <Pressable onPress={() => setPickerMode("date")}>
            <Text>{`Last paid: ${getStringDate(commitment.time)}`}</Text>
          </Pressable>
        </VStack>
        {pickerMode && (
          <DateTimePicker
            testID="dateTimePicker"
            value={paidDate}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={(event, date: any) => {
              setPickerMode(null);
              if (date) {
                let newCommitment = { ...commitment, time: date.getTime() };
                setCommitment(newCommitment);
                update("commitment", "time", newCommitment);
                d(refreshCommitments());
              }
            }}
          />
        )}
      </View>
    </SharedElement>
  );
};

Details.sharedElements = (navigation) => {
  let todo = navigation.params.commitment;
  return [
    { id: `${todo.text}_box`, animation: "fade-in" },
    { id: todo.text, animation: "fade-in" },
  ];
};

export default Details;
