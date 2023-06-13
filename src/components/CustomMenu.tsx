import * as React from "react";
import { View, Pressable } from "react-native";
import "react-native-gesture-handler";
import { Menu, MenuItem } from "react-native-material-menu";
import { Icon } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastAndroid } from "react-native";

export default ({ navigation, menustyle }) => {
  const [visible, setVisible] = React.useState(false);
  let _menu = null;

  const downloadData = async () => {
    console.log("try to export data");
    // export data to a json file using react native library
    var RNFS = require("react-native-fs");
    var path = RNFS.DownloadDirectoryPath + "/todo_data.txt";
    const stringifiedJSON = await AsyncStorage.getItem("TODOs");
    RNFS.writeFile(path, stringifiedJSON, "utf8")
      .then((success) => {
        console.log("FILE WRITTEN! to " + path);
        ToastAndroid.show("Data downloaded", 1500);
      })
      .catch((err) => {
        console.log(err.message);
      });

    // let shareHistoria = {
    //   title: "MyApp",
    //   message: "Historia",
    //   url: "file://" + path,
    //   type: "text/plain",
    //   subject: "Historia", //  for email
    // };

    // Share.open(shareHistoria);
  };

  return (
    <View style={menustyle}>
      <Menu
        ref={(ref) => (_menu = ref)}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        anchor={
          <Pressable onPress={() => setVisible(true)}>
            <Icon name="dots-vertical" size={24} />
          </Pressable>
        }
      >
        {/* <MenuItem onPress={() => {Alert.alert('PopUp Menu Button Clicked...')}}>
            Menu Item 1
          </MenuItem>
  
          <MenuItem disabled>Disabled Menu Item 2</MenuItem>
  
          <MenuDivider />
   */}
        <MenuItem
          onPress={() => {
            downloadData();
          }}
        >
          Download
        </MenuItem>
        <MenuItem
          onPress={() => {
            navigation.navigate("Experimental", {});
          }}
        >
          Experimental
        </MenuItem>
      </Menu>
    </View>
  );
};
