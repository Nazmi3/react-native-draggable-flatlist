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
import { Item, getColor } from "../utils";
import { Swipeable } from "react-native-gesture-handler";
import moment from "moment";
import { SharedElement } from "react-navigation-shared-element";
import styles from "../style";
import { HStack, Icon } from "@react-native-material/core";
import style from "../style";

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

const SwipeableButton = ({
  navigation,
  item,
  index,
  drag,
  isActive,
  deleteCommitment,
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
        style={[
          style.box,
          {
            marginTop: 2,
            marginBottom: 2,
            padding: 10,
            backgroundColor: "red",
            alignContent: "center",
            justifyContent: "center",
          },
        ]}
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
        deleteCommitment(item);
      }}
      ref={(ref) => (row[item.key] = ref)}
      leftThreshold={200}
    >
      <SharedElement id={`${item.text}_box`}>
        <View style={{ opacity: item.passed ? 0.45 : 1, margin: 5 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={drag}
            onPress={() => {
              console.log("button clicked", item.text);
              navigation.navigate("CommitmentDetails", {
                commitment: item,
              });
            }}
            delayLongPress={200}
            disabled={isActive}
            style={[
              styles.box,
              {
                backgroundColor: "white",
                borderRadius: 10,
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
                <HStack
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Icon name="drag" size={18} />
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={[styles.text]}>{item.text}</Text>
                  </View>
                  <Text
                    style={[
                      styles.text,
                      item.cost
                        ? {}
                        : {
                            color: "grey",
                          },
                    ]}
                  >
                    {`RM ${item.cost ?? "-"}`}
                  </Text>
                </HStack>
              </SharedElement>
            </View>
          </TouchableOpacity>
        </View>
      </SharedElement>
    </Swipeable>
  );
};

// const styles = StyleSheet.create({
//   rowItem: {

//   },
//   container: {
//     flex: 1,
//     paddingTop: 20,
//   },
//   listItem: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   leftSwipeItem: {
//     flex: 1,
//     alignItems: "flex-end",
//     justifyContent: "center",
//     paddingRight: 20,
//   },
//   rightSwipeItem: {
//     flex: 1,
//     justifyContent: "center",
//     paddingLeft: 20,
//   },
//   container: {
//     flex: 1,
//   },
//   row: {
//     flexDirection: "row",
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 15,
//   },
//   text: {
//     fontWeight: "500",
//   },
//   underlayRight: {
//     flex: 1,
//     backgroundColor: "teal",
//     justifyContent: "flex-start",
//   },
//   underlayLeft: {
//     flex: 1,
//     backgroundColor: "tomato",
//     justifyContent: "flex-end",
//   },
// });

export default SwipeableButton;
