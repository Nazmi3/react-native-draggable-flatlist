import React, { useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Pressable,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Item, getColor } from "../src/utils";
import { Swipeable } from "react-native-gesture-handler";
import moment from "moment";
import { SharedElement } from "react-navigation-shared-element";

export function getStringDuration(duration) {
  let hours = 0;
  let minutes = duration / (1000 * 60);
  let space = "";
  if (duration / (1000 * 60) > 60) {
    hours = Math.floor(duration / (1000 * 60) / 60);
    minutes = minutes - hours * 60;
    space = minutes > 0 ? " " : "";
  }
  return (
    (hours > 0 ? hours + " hr" : "") +
    space +
    (minutes > 0 ? minutes + " m" : "")
  );
}

let row: Array<any> = [];
let index = 0;
let lastTime = 0;
let rate = 3;

function getBackgroundColor(item) {
  return getColor(item.duration / (1000 * 60 * 90), 9);
  let colors = ["teal", "tomato", "thistle"];
  let newDay =
    lastTime === 0
      ? false
      : new Date(item.time).getDate() !== new Date(lastTime).getDate();
  console.log("new Day", new Date(item.time).getDate(), newDay);
  if (newDay) {
    if (index < colors.length - 1) index += 1;
    else index = 0;
  }
  lastTime = item.time;
  return colors[index];
}

const SwipeableButton = ({
  navigation,
  item,
  index,
  drag,
  isActive,
  deleteTODO,
}: RenderItemParams<Item>) => {
  const closeRow = () => {
    console.log("closerow");
    // if (pr OpenedRow && prevOpenedRow !== row[item.key]) {
    row[item.key].close();
    // }
    // prevOpenedRow = row[item.key];
  };

  const renderRightActions = (progress, dragX, onClick) => {
    return (
      <View
        style={{
          marginTop: 2,
          marginBottom: 2,
          padding: 10,
          backgroundColor: "red",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <Pressable onPress={onClick}>
          <Text style={{ color: "white", fontWeight: "bold" }}>DELETE</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={(progress, dragX) =>
        renderRightActions(progress, dragX, () => console.log("on click"))
      }
      onSwipeableWillOpen={() => {
        console.log("on swipeable will open", item);
        deleteTODO(item);
        closeRow();
      }}
      ref={(ref) => (row[item.key] = ref)}
      leftThreshold={200}
    >
      <View style={{ opacity: item.passed ? 0.45 : 1 }}>
        <SharedElement id={`${item.text}_box`}>
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={drag}
            onPress={() => {
              console.log("button clicked");
              navigation.navigate("Details", {
                todo: item,
              });
            }}
            delayLongPress={200}
            disabled={isActive}
            style={[
              styles.rowItem,
              {
                borderTopLeftRadius: item.topOfDay ? 10 : 0,
                borderTopRightRadius: item.topOfDay ? 10 : 0,
                borderBottomLeftRadius: item.bottomOfDay ? 10 : 0,
                borderBottomRightRadius: item.bottomOfDay ? 10 : 0,
                padding: 10,
              },
            ]}
          >
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SharedElement id={item.text}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: (rate / (index + rate)) * 30,
                      textAlign: "center",
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </SharedElement>

              <Text
                style={{
                  textAlign: "center",
                }}
              >
                {item.time
                  ? moment(item.time).format("YYYY-MM-DD hh:mm a")
                  : undefined}
              </Text>
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                {getStringDuration(item.duration)}
              </Text>
            </View>
          </TouchableOpacity>
        </SharedElement>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rowItem: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  listItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  leftSwipeItem: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 20,
  },
  rightSwipeItem: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 20,
  },
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  text: {
    fontWeight: "500",
  },
  underlayRight: {
    flex: 1,
    backgroundColor: "teal",
    justifyContent: "flex-start",
  },
  underlayLeft: {
    flex: 1,
    backgroundColor: "tomato",
    justifyContent: "flex-end",
  },
});

export default SwipeableButton;
