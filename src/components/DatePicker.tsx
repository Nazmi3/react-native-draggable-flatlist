import React, { useEffect, useRef, useState } from "react";
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
import moment, { now } from "moment/moment";

import DateTimePicker from "@react-native-community/datetimepicker";

import { SharedElement } from "react-navigation-shared-element";
import { useDispatch, useSelector } from "react-redux";
import { updateTODOList } from "../store/todoSlice";
import { MarkedDatesType } from "../screens/TodoDetails";

export default ({
  mode,
  initialDate,
  markedDates,
  onCancel,
  onOk,
}: {
  initialDate: Date;
  markedDates: MarkedDatesType;
}) => {
  const [table, setTable] = useState<null | any>(null);
  const [selectedDate, setSelectedDate] = useState({});
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const now = useRef(new Date());

  useEffect(() => {
    if (mode === "date") renderItems();
  }, [mode, markedDates, currentMonth]);

  function handleItemPress(item) {
    let newTable = JSON.parse(JSON.stringify(table));

    // manipulate table
    newTable = newTable.map((tableRow) =>
      tableRow.map((tableItem) =>
        tableItem === newTable[item.row][item.column]
          ? { ...tableItem, selected: true }
          : { ...tableItem, selected: false }
      )
    );
    setSelectedDate({
      year: now.current.getFullYear(),
      month: currentMonth,
      date: item.display,
    });

    setTable(newTable);
  }

  function generateTableItems() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const maximumRow = 7;
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayName = new Date(currentYear, currentMonth, 1).getDay() - 1;
    let currentDay = 1;
    let tableItems = [];
    for (let row = 0; row < maximumRow; row++) {
      let columnItems = [];
      for (let column = 0; column < 7; column++) {
        if (row === 0 && column < startDayName) {
          columnItems.push({});
        } else {
          if (currentDay > totalDays) break;
          columnItems.push({
            row: row,
            column: column,
            display: currentDay,
          });
          currentDay++;
        }
      }
      tableItems.push(columnItems);
      if (currentDay > totalDays) break;
    }
    return tableItems;
  }

  function renderItems() {
    const tableItems = generateTableItems();

    function getCalendarItem(obj: any, date: Date) {
      let rowIndex = null;
      let columnIndex = null;
      for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < obj[i].length; j++) {
          if (obj[i][j].display === date.getDate()) {
            rowIndex = i;
            columnIndex = j;
            break;
          }
        }
      }
      return obj[rowIndex][columnIndex];
    }

    // mark current date
    if (currentMonth === initialDate.getMonth()) {
      let item = getCalendarItem(tableItems, initialDate);
      item.borderColor = "green";
    }
    // mark filled dates
    for (const markedDate of markedDates) {
      if (markedDate.date.getMonth() === currentMonth) {
        let item = getCalendarItem(tableItems, markedDate.date);
        item.backgroundColor = markedDate.color;
      }
    }
    setTable(tableItems);
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={mode === "date"}
      onRequestClose={() => {}}
    >
      <View style={{ backgroundColor: "white" }}>
        <VStack>
          <HStack>
            <Pressable onPress={() => setCurrentMonth(currentMonth - 1)}>
              <Text style={{ width: 30 }}>{"<"}</Text>
            </Pressable>

            <Text>{currentMonth + 1}</Text>
            <Pressable onPress={() => setCurrentMonth(currentMonth + 1)}>
              <Text style={{ width: 30 }}>{">"}</Text>
            </Pressable>
          </HStack>
          <HStack>
            <Text style={{ width: 20, marginLeft: 15 }}>M</Text>
            <Text style={{ width: 20, marginLeft: 30 }}>T</Text>
            <Text style={{ width: 20, marginLeft: 30 }}>W</Text>
            <Text style={{ width: 20, marginLeft: 30 }}>T</Text>
            <Text style={{ width: 20, marginLeft: 30 }}>F</Text>
            <Text style={{ width: 20, marginLeft: 30 }}>S</Text>
            <Text style={{ width: 20, marginLeft: 30 }}>S</Text>
          </HStack>
          {table &&
            table.map((row) => (
              <HStack>
                {row.map((item) => (
                  <Pressable onPress={() => handleItemPress(item)}>
                    <Text
                      style={{
                        width: 20,
                        marginLeft: 15,
                        marginRight: 15,
                        backgroundColor: item.selected
                          ? "green"
                          : item.backgroundColor,
                        borderColor: item.borderColor ?? "white",
                        borderWidth: 1,
                      }}
                    >
                      {item.display}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            ))}
          <HStack spacing={10}>
            <Pressable onPress={onCancel}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => onOk(selectedDate)}>
              <Text>Ok</Text>
            </Pressable>
          </HStack>
        </VStack>
      </View>
    </Modal>
  );
};
