import React, {useRef} from 'react'
import { StyleSheet, TouchableOpacity, Text, View, Button } from 'react-native'
import SwipeableItem, {
    useSwipeableItemParams,
  } from "react-native-swipeable-item";
  import Animated, { useAnimatedStyle } from "react-native-reanimated";
  import Swipeable from 'react-native-swipeable';

const OVERSWIPE_DIST = 20;


const UnderlayLeft = ({
    onPressDelete,
  }) => {
    const { item, percentOpen } = useSwipeableItemParams();
    const animStyle = useAnimatedStyle(
      () => ({
        opacity: percentOpen.value,
      }),
      [percentOpen]
    );
  
    return (
      <Animated.View
        style={[styles.row, styles.underlayLeft, animStyle]} // Fade in on open
      >
        <TouchableOpacity onPress={onPressDelete}>
          <Text style={styles.text}>{`[delete]`}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  function UnderlayRight() {
    const { close } = useSwipeableItemParams();
    return (
      <Animated.View style={[styles.row, styles.underlayRight]}>
        <TouchableOpacity onPressOut={close}>
          <Text style={styles.text}>CLOSE</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  let row= [];

export default function RenderItem({ item, index, move, moveEnd, isActive }) {
    const itemRefs = useRef(new Map())


    const closeRow = (index) => {
        console.log('closerow');
        if (prevOpenedRow && prevOpenedRow !== row[index]) {
          prevOpenedRow.close();
        }
        prevOpenedRow = row[index];
      };

    const renderRightActions = (progress, dragX, onClick) => {
        return (
          <View
            style={{
              margin: 0,
              alignContent: 'center',
              justifyContent: 'center',
              width: 70,
            }}>
            <Button color="red" onPress={onClick} title="DELETE"></Button>
          </View>
        );
      };
 
  return (
    <>
          <TouchableOpacity
      style={{ 
        height: 100, 
        backgroundColor: isActive ? 'blue' : item.backgroundColor,
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
      onLongPress={move}
      onPressOut={moveEnd}>
      <Text style={{ 
        fontWeight: 'bold', 
        color: 'white',
        fontSize: 32,
      }}>{item.label}</Text>
    </TouchableOpacity>
    {/* <Swipeable
      leftContent={(
        <View style={[styles.leftSwipeItem, {backgroundColor: 'lightskyblue'}]}>
          <Text>Pull action</Text>
        </View>
      )}
      rightButtons={[
        <TouchableOpacity style={[styles.rightSwipeItem, {backgroundColor: 'lightseagreen'}]}>
          <Text>1</Text>
        </TouchableOpacity>,
        <TouchableOpacity style={[styles.rightSwipeItem, {backgroundColor: 'orchid'}]}>
          <Text>2</Text>
        </TouchableOpacity>
      ]}
      onRightButtonsOpenRelease={(event, gestureState, swipeable)=>console.log("on open")}
      onRightButtonsCloseRelease={()=>console.log("on close")}
    >
      <TouchableOpacity
      style={{ 
        height: 100, 
        backgroundColor: isActive ? 'blue' : item.backgroundColor,
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
      onLongPress={move}
      onPressOut={moveEnd}>
      <Text style={{ 
        fontWeight: 'bold', 
        color: 'white',
        fontSize: 32,
      }}>{item.label}</Text>
    </TouchableOpacity>
    </Swipeable> */}
          {/* <SwipeableItem
      key={item.key}
      item={item}
      ref={(ref) => {
        if (ref && !itemRefs.current.get(item.key)) {
          itemRefs.current.set(item.key, ref);
        }
      }}
      onChange={({ open }) => {
        if (open) {
          // Close all other open items
          [...itemRefs.current.entries()].forEach(([key, ref]) => {
            if (key !== item.key && ref) ref.close();
          });
        }
      }}
      overSwipe={OVERSWIPE_DIST}
      renderUnderlayLeft={() => (
        <UnderlayLeft onPressDelete={()=>console.log("on press delete")} />
      )}
      renderUnderlayRight={() => <UnderlayRight />}
      snapPointsLeft={[150]}
    >

    </SwipeableItem> */}
    
    </>
    
  )
}


