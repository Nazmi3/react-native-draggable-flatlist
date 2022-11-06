import React, { useEffect, useState } from "react";
import { Modal, View, Text, Slider, TouchableOpacity } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getStringDuration } from "../../components/SwipeableButton";
import { HStack, VStack } from "@react-native-material/core";
import moment from "moment/moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SharedElement } from "react-navigation-shared-element";

export const REPEAT = ["freeTime", "day", "weekDay", "month", "solatTime"];

export function resortTodo(todos, todo) {
  todos.sort(function (a, b) {
    return a.time - b.time;
  });
  console.log("resort todo", todos);
}

export async function updateTODO(key, field, value) {
  let todosJSON = await AsyncStorage.getItem("TODOs");
  let todos = JSON.parse(todosJSON);
  let todo = todos.find((todo) => todo.key === key);

  todo[field] = value;
  console.log("field", field);

  if (field === "time") {
    resortTodo(todos, todo);
  }

  await AsyncStorage.setItem("TODOs", JSON.stringify(todos));
}

let count = 0;
const Details = ({ navigation, route: { params } }) => {
  const [todo, setTodo] = useState(params.todo);
  const [duration, setDuration] = useState(params.todo.duration);
  const [date, setDate] = useState(new Date(params.todo.time));
  const [open, setOpen] = useState(false);

  function setDBDuration(duration) {
    count += 1;
    updateTODO(todo.key, "duration", duration);
  }

  function getStringDate(unix) {
    return moment(unix).format("DD/MM/YYYY");
  }

  function nextRepeatType(type) {
    let currentIndex = REPEAT.findIndex((key) => key === type);
    let isLastIndex = currentIndex === REPEAT.length - 1;
    let nextIndex = isLastIndex ? 0 : currentIndex + 1;
    return REPEAT[nextIndex];
  }
  return (
    <SharedElement id={todo.text}>
      <View style={{ backgroundColor: "white", borderRadius: 10 }}>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Text
            style={{
              fontWeight: "500",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {todo.text}
          </Text>
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
          <Slider
            style={{ height: 40 }}
            minimumValue={1000 * 60 * 15}
            maximumValue={1000 * 60 * 60 * 10}
            step={1000 * 60 * 15}
            value={duration}
            onValueChange={(value) => setDuration(value)}
            onSlidingComplete={setDBDuration}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#FFFFFF"
          />

          {todo.repeat && (
            <HStack>
              <TouchableOpacity
                onPress={() => {
                  setTodo({
                    ...todo,
                    repeat: false,
                  });
                  updateTODO(todo.key, "repeat", false);
                }}
              >
                <Text>{`Every`}</Text>
              </TouchableOpacity>
              <Text>{` `}</Text>
              <TouchableOpacity
                onPress={() => {
                  setTodo({
                    ...todo,
                    repeat: { every: nextRepeatType(todo.repeat.every) },
                  });
                  updateTODO(todo.key, "repeat", {
                    every: nextRepeatType(todo.repeat.every),
                  });
                }}
              >
                <Text>
                  {`${todo.repeat.every}${
                    todo.repeat.date ? " at " + todo.repeat.date + "th" : ""
                  }`}
                </Text>
              </TouchableOpacity>
            </HStack>
          )}
          {!todo.repeat && (
            <TouchableOpacity
              onPress={() => {
                setTodo({ ...todo, repeat: { every: "freeTime" } });
                updateTODO(todo.key, "repeat", { every: "freeTime" });
              }}
            >
              <Text>Once</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setOpen(true)}>
            <Text>{getStringDate(date.getTime())}</Text>
          </TouchableOpacity>
        </VStack>
        {open && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={(event, date: any) => {
              setOpen(false);
              console.log("date confirmed", date, date.getTime());
              setDate(date);
              updateTODO(todo.key, "time", date.getTime());
            }}
          />
        )}
      </View>
    </SharedElement>
  );
};

Details.sharedElements = (navigation) => {
  let todo = navigation.params.todo;
  console.log("navigation", todo.time);
  return [{ id: todo.text, animation: "fade" }];
};

export default Details;
