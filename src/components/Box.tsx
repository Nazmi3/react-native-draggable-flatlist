import React from "react";
import { View } from "react-native";
import styles from "../style";

export default function Box({ children }: { children: any }) {
  return (
    <View
      style={[
        styles.box,
        {
          alignSelf: "flex-start",
          backgroundColor: "white",
          borderRadius: 10,
          padding: 10,
        },
      ]}
    >
      {children}
    </View>
  );
}
