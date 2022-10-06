import React, { useState, useRef, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  LayoutAnimation,
  TouchableOpacity,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import SwipeableItem, {
  useSwipeableItemParams,
} from "react-native-swipeable-item";
import { mapIndexToData, Item } from "../utils";

    <View style={styles.container}>
      <DraggableFlatList
        keyExtractor={(item) => item.key}
        data={data}
        renderItem={renderItem}
        onDragEnd={({ data }) => setData(data)}
      />
    </View>
