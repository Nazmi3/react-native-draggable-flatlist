import * as React from "react";
import { View, Pressable, StyleProp, ViewStyle } from "react-native";
import "react-native-gesture-handler";
import { Menu, MenuItem } from "react-native-material-menu";
import { Icon } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastAndroid } from "react-native";

export default ({
  navigation,
  menustyle,
}: {
  navigation: any;
  menustyle: StyleProp<ViewStyle>;
}) => {
  const [visible, setVisible] = React.useState(false);
  let _menu = null;

  async function importData() {
    var RNFS = require("react-native-fs");
    const path = RNFS.DownloadDirectoryPath + "/todo_data.txt";
    RNFS.readFile(path, "utf8")
      .then(async (contents: string) => {
        console.log("contents", contents);
        await AsyncStorage.setItem("TODOs", contents);
        ToastAndroid.show("Data imported please restart the app", 1500);
      })
      .catch(() => {
        ToastAndroid.show(
          "todo_data.txt not found in download directory",
          1500
        );
      });
  }

  const downloadData = async () => {
    console.log("try to export data");
    // export data to a json file using react native library
    var RNFS = require("react-native-fs");
    var path = RNFS.DownloadDirectoryPath + "/todo_data.txt";
    const stringifiedJSON = await AsyncStorage.getItem("TODOs");
    RNFS.writeFile(path, stringifiedJSON, "utf8")
      .then(() => {
        console.log("FILE WRITTEN! to " + path);
        ToastAndroid.show("Data downloaded", 1500);
      })
      .catch((err: any) => {
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
            importData();
          }}
        >
          Import
        </MenuItem>
        <MenuItem
          onPress={() => {
            downloadData();
          }}
        >
          Export
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
