import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import { View, Text } from "react-native";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import BasicScreen from "./screens/BasicScreen";
import BasicScreen1 from "./screens/BasicScreen1";
import "react-native-gesture-handler";
import {
  FlingGestureHandler,
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
  Directions,
} from "react-native-gesture-handler";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const lastGestureRef = useRef({});
  const basicRef = useRef({});
  const [shouldStartResponder, setShouldStartResponder] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTODO, setNewTODO] = useState({});

  function handleGestureStart({ nativeEvent: currentGesture }) {
    console.log("on gesture start");
    lastGestureRef.current[currentGesture.identifier] = currentGesture;
  }

  function prepareNewTODO() {
    setNewTODO({});
    setModalVisible(true);
  }

  function handlePinch({ nativeEvent }) {
    // console.log("handle gesture end", props.currentTarget)
    console.log("handle pinch", nativeEvent);

    if (nativeEvent.scale > 1.5) {
      prepareNewTODO();
    } else {
    }
  }

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <FlingGestureHandler
              direction={Directions.UP}
              numberOfPointers={2}
              onEnded={({ nativeEvent }) => basicRef.current.dragToNow()}
            >
              <PinchGestureHandler
                onEnded={handlePinch}
                onFinalize={() => {
                  console.log("on filnalize");
                }}
              >
                <View style={{ display: "flex", flex: 1 }}>
                  <BasicScreen
                    ref={basicRef}
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    newTODO={newTODO}
                    setNewTODO={setNewTODO}
                  />
                  {/* <BasicScreen1/> */}
                </View>
              </PinchGestureHandler>
            </FlingGestureHandler>
            {/* </View> */}
          </SafeAreaProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
}
