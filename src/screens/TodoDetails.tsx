import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Slider,
  TouchableOpacity,
  Pressable,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getStringDuration } from "../../components/SwipeableButton";
import DatePicker from "../components/DatePicker";
import { HStack, Stack, VStack } from "@react-native-material/core";
import moment from "moment/moment";

import DateTimePicker from "@react-native-community/datetimepicker";

import { SharedElement } from "react-navigation-shared-element";
import { useDispatch, useSelector } from "react-redux";
import { updateTODOList } from "../store/todoSlice";

export const REPEAT = ["freeTime", "day", "weekDay", "month", "solatTime"];

export function resortTodo(todos, todo) {
  todos.sort(function (a, b) {
    return a.time - b.time;
  });
}

let count = 0;
const Details = ({ navigation, route: { params } }) => {
  const TODOs: any[] = useSelector((state) => state.todos);
  const [todo, setTodo] = useState(params.todo);
  const [duration, setDuration] = useState(params.todo.duration);
  const [date, setDate] = useState(new Date(params.todo.time));
  const [mode, setMode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [markedDates, setMarkedDates] = useState<number[]>([]);

  const d = useDispatch();

  useEffect(() => {
    updateMarkedDates();
  }, []);

  function updateMarkedDates() {
    let newMarkedDates: number[] = [];

    TODOs.map((TODO) => {
      const date = new Date(TODO.time);
      if (date.getMonth() === new Date().getMonth()) {
        console.log("should mark", date.getDate());
        newMarkedDates.push(date.getDate());
      }
    });

    setMarkedDates(newMarkedDates);
  }

  function setDBDuration(duration) {
    count += 1;
    updateTODO(todo.key, "duration", duration);
  }

  async function updateTODO(key, field, value) {
    let todosJSON = await AsyncStorage.getItem("TODOs");
    let todos = JSON.parse(todosJSON);
    let todo = todos.find((todo) => todo.key === key);

    todo[field] = value;

    if (field === "time") {
      resortTodo(todos, todo);
    }

    d(updateTODOList(todos));
    await AsyncStorage.setItem("TODOs", JSON.stringify(todos));
  }

  function getStringDate(unix) {
    return moment(unix).format("DD/MM/YYYY");
  }

  function getStringTime(unix) {
    return moment(unix).format("hh:mm a");
  }

  function nextRepeatType(type) {
    let currentIndex = REPEAT.findIndex((key) => key === type);
    let isLastIndex = currentIndex === REPEAT.length - 1;
    let nextIndex = isLastIndex ? 0 : currentIndex + 1;
    return REPEAT[nextIndex];
  }

  return (
    <SharedElement id={`${todo.text}_box`}>
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
          <SharedElement id={todo.text}>
            <Text
              style={{
                fontWeight: "500",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              {todo.text}
            </Text>
          </SharedElement>
          <Text
            style={{
              fontWeight: "500",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {`-`}
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
          <HStack>
            <TouchableOpacity onPress={() => setMode("date")}>
              <Text>{getStringDate(date.getTime())}</Text>
            </TouchableOpacity>
            <Text>{` `}</Text>
            <TouchableOpacity onPress={() => setMode("time")}>
              <Text>{getStringTime(date.getTime())}</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
        <DatePicker
          mode={mode}
          markedDates={markedDates}
          onCancel={() => setMode(null)}
          onOk={(d: any) => {
            date.setFullYear(d.year);
            date.setMonth(d.month);
            date.setDate(d.date);

            setDate(date);
            updateTODO(todo.key, "time", date.getTime());

            setMode(null);
          }}
        />
        {mode == "time" && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={(event, date: any) => {
              setMode(null);
              if (date) {
                setDate(date);
                updateTODO(todo.key, "time", date.getTime());
              }
            }}
          />
        )}
      </View>
    </SharedElement>
  );
};

Details.sharedElements = (navigation) => {
  let todo = navigation.params.todo;
  return [
    { id: `${todo.text}_box`, animation: "fade-in" },
    { id: todo.text, animation: "fade-in" },
  ];
};

export default Details;
