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

export default ({
  mode,
  markedDates,
  onCancel,
  onOk,
}: {
  markedDates: number[];
}) => {
  const [table, setTable] = useState<null | any>(null);
  const [selectedDate, setSelectedDate] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const now = useRef(new Date());

  useEffect(() => {
    renderItems();
  }, [markedDates, currentMonth]);

  function handleItemPress(item) {
    let newTable = JSON.parse(JSON.stringify(table));

    // manipulate table
    newTable[item.row][item.column].backgroundColor = "green";
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
          columnItems.push({
            row: row,
            column: column,
            display: currentDay,
          });
          if (currentDay >= totalDays) break;
          currentDay++;
        }
      }
      tableItems.push(columnItems);
      if (currentDay >= totalDays) break;
    }
    console.log("tableItems", startDayName, totalDays, tableItems);
    return tableItems;
  }

  function renderItems() {
    const tabl = generateTableItems();

    function getItem(obj: any, date: number) {
      let rowIndex = null;
      let columnIndex = null;
      for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < obj[i].length; j++) {
          if (obj[i][j].display === date) {
            rowIndex = i;
            columnIndex = j;
            break;
          }
        }
      }
      return obj[rowIndex][columnIndex];
    }

    for (const markedDate of markedDates) {
      let item = getItem(tabl, markedDate);
      item.backgroundColor = "red";
    }
    setTable(tabl);
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
                        backgroundColor: item.backgroundColor,
                      }}
                    >
                      {item.display}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            ))}
          <Pressable
            style={[{ padding: 10, opacity: 0.5 }]}
            onPress={() => setShowModal(false)}
          >
            <HStack spacing={10}>
              <Pressable onPress={onCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => onOk(selectedDate)}>
                <Text>Ok</Text>
              </Pressable>
            </HStack>
          </Pressable>
        </VStack>
      </View>
    </Modal>
  );
};
