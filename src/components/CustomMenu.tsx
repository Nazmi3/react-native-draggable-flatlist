import * as React from "react";
import {
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  PermissionsAndroid,
} from "react-native";
import "react-native-gesture-handler";
import { Menu, MenuItem } from "react-native-material-menu";
import { Icon } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastAndroid } from "react-native";
import { add, addFull, get } from "../manager/sqlite";
import { Dirs, FileSystem } from "react-native-file-access";
import DocumentPicker from "react-native-document-picker";

export default ({
  navigation,
  menustyle,
}: {
  navigation: any;
  menustyle: StyleProp<ViewStyle>;
}) => {
  const [visible, setVisible] = React.useState(false);
  let _menu = null;

  async function importData(name) {
    var RNFS = require("react-native-fs");
    const path = RNFS.DownloadDirectoryPath + `/${name}_data.txt`;

    const response = await DocumentPicker.pick({
      presentationStyle: "fullScreen",
    });

    console.log("response", response);

    RNFS.readFile(response[0].uri, "utf8")
      .then(async (jsonString: string) => {
        console.log("contents", jsonString);
        try {
          if (name === "commitment") {
            let jsonObject = JSON.parse(jsonString);
            for (var row of jsonObject) {
              console.log("c", row);
              addFull(name, row);
            }
          } else if (name === "todo") {
            await AsyncStorage.setItem("TODOs", jsonString);
          }

          ToastAndroid.show(`${name} imported. Please restart the app`, 1500);
        } catch (error) {
          ToastAndroid.show("Error importing data", 1500);
        }
      })
      .catch((e) => {
        ToastAndroid.show(
          `${name}_data.txt not found in Downloads:` + JSON.stringify(e),
          1500
        );
      });
  }

  const exportData = async (name) => {
    console.log(`export ${name}`);

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);

    console.log("granted", granted);

    let jsonString = null;
    if (name === "commitment") {
      const jsonObject = await get(name);
      jsonString = JSON.stringify(jsonObject);
    } else if (name === "todo") {
      jsonString = await AsyncStorage.getItem("TODOs");
    }

    console.log("dataJSON", jsonString);
    // export data to a json file using react native library
    var RNFS = require("react-native-fs");
    const targetName = `${name}_data.txt`;
    var path = RNFS.TemporaryDirectoryPath + targetName;
    RNFS.writeFile(path, jsonString, "utf8")
      .then(() => {
        console.log("FILE WRITTEN! to " + path);
        FileSystem.cpExternal(path, `/${targetName}`, "downloads");
        ToastAndroid.show(`${targetName} exported`, 1500);
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
        <MenuItem
          onPress={() => {
            importData("todo");
          }}
        >
          Import Todo
        </MenuItem>
        <MenuItem
          onPress={() => {
            importData("commitment");
          }}
        >
          Import Commitment
        </MenuItem>
        <MenuItem
          onPress={() => {
            exportData("todo");
            exportData("commitment");
          }}
        >
          Export
        </MenuItem>
        {/* <MenuItem
          onPress={() => {
            navigation.navigate("Experimental", {});
          }}
        >
          Experimental
        </MenuItem> */}
      </Menu>
    </View>
  );
};
