import React, { Component } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";

import { mapIndexToData, Item } from "../utils";
import RenderItem from './RenderItem';

const NUM_ITEMS = 20;

const initialData: Item[] = [...Array(NUM_ITEMS)].fill(0).map(mapIndexToData);

class Basic extends Component {

  state = {
    data: [{
      key: `item-0`,
      label: "Makan",
      backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${0 * 5}, ${132})`,
    },{
      key: `item-1`,
      label: "Solat",
      backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${1 * 5}, ${132})`,
    },{
      key: `item-2`,
      label: "Tidur",
      backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${2 * 5}, ${132})`,
    }]
  }

  renderItem(params) {
    return <RenderItem {...params} />
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `draggable-item-${item.key}`}
          scrollPercent={5}
          onMoveEnd={({ data }) => this.setState({ data })}
        />
      </View>
    )
  }
}

export default Basic