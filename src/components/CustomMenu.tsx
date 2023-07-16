import * as React from "react";
import { View, Pressable, StyleProp, ViewStyle } from "react-native";
import "react-native-gesture-handler";
import { Menu, MenuItem } from "react-native-material-menu";
import { Icon } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastAndroid } from "react-native";
import { add, addFull, get } from "../manager/sqlite";
import RNFS from "react-native-fs";

export default ({
  navigation,
  menustyle,
}: {
  navigation: any;
  menustyle: StyleProp<ViewStyle>;
}) => {
  const [visible, setVisible] = React.useState(false);
  let _menu = null;

  async function importCommitment() {
    var RNFS = require("react-native-fs");
    const path = RNFS.DownloadDirectoryPath + "/commitment_data.txt";
    RNFS.readFile(path, "utf8")
      .then(async (contents: string) => {
        console.log("contents", contents);
        let commitments = JSON.parse(contents);
        try {
          for (var commitment of commitments) {
            console.log("c", commitment);
            addFull("commitment", commitment);
          }
          ToastAndroid.show("Data imported. Please restart the app", 1500);
        } catch (error) {
          ToastAndroid.show("Error importing data", 1500);
        }
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
  };

  const exportCommitment = async () => {
    console.log("export commitment");
    let commitmentJSON = await get("commitment");
    console.log("commitmentJSON", commitmentJSON);
    // export data to a json file using react native library
    var RNFS = require("react-native-fs");
    var path = RNFS.DownloadDirectoryPath + "/commitment_data.txt";
    RNFS.writeFile(path, JSON.stringify(commitmentJSON), "utf8")
      .then(() => {
        console.log("FILE WRITTEN! to " + path);
        ToastAndroid.show("Data exported", 1500);
      })
      .catch((err: any) => {
        console.log(err.message);
      });
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
            importCommitment();
          }}
        >
          Import
        </MenuItem>
        <MenuItem
          onPress={() => {
            exportCommitment();
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
