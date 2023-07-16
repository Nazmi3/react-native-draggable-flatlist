import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment/moment";
import { useDispatch } from "react-redux";
import { updateTODOList } from "../store/todoSlice";
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
  SensorData,
} from "react-native-sensors";
import { map, filter } from "rxjs/operators";
import { Subscription } from "rxjs";
import { LineChart } from "react-native-chart-kit";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import { mockData } from "../mock";
import RNSounds from "@gemedico/react-native-sounds";

setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

const Experimental = () => {
  const d = useDispatch();
  const times = useRef<string[]>([]);
  const timesGyro = useRef<string[]>([]);
  const xDatas = useRef<number[]>([]);
  const yDatas = useRef<number[]>([]);
  const zDatas = useRef<number[]>([]);
  const xDatasGyro = useRef<number[]>([]);
  const yDatasGyro = useRef<number[]>([]);
  const zDatasGyro = useRef<number[]>([]);
  const subscription = useRef<Subscription>();
  const subscriptionGyro = useRef<Subscription>();
  const gyroInterval = useRef<NodeJS.Timeout>();

  const [linedata1, setLineData1] = useState<LineChartData>({
    labels: times.current.length > 0 ? times.current : [""],
    datasets: [
      {
        data: xDatas.current.length > 0 ? xDatas.current : [0],
        strokeWidth: 2, // optional
      },
    ],
  });

  const [linedata2, setLineData2] = useState({
    labels: times.current.length > 0 ? times.current : [""],
    datasets: [
      {
        data: yDatas.current.length > 0 ? yDatas.current : [0],
        strokeWidth: 2, // optional
      },
    ],
  });
  const [linedata3, setLineData3] = useState({
    labels: times.current.length > 0 ? times.current : [""],
    datasets: [
      {
        data: zDatas.current.length > 0 ? zDatas.current : [0],
        strokeWidth: 2, // optional
      },
    ],
  });
  const [gyroX, setGyroX] = useState({
    labels: timesGyro.current.length > 0 ? timesGyro.current : [""],
    datasets: [
      {
        data: xDatasGyro.current.length > 0 ? xDatasGyro.current : [0],
        strokeWidth: 2, // optional
      },
    ],
  });
  const [gyroY, setGyroY] = useState({
    labels: timesGyro.current.length > 0 ? timesGyro.current : [""],
    datasets: [
      {
        data: yDatasGyro.current.length > 0 ? yDatasGyro.current : [0],
        strokeWidth: 2, // optional
      },
    ],
  });
  const [gyroZ, setGyroZ] = useState({
    labels: timesGyro.current.length > 0 ? timesGyro.current : [""],
    datasets: [
      {
        data: zDatasGyro.current.length > 0 ? zDatasGyro.current : [0],
        strokeWidth: 2, // optional
      },
    ],
  });
  useEffect(() => {
    RNSounds.beep();
    let mock = false;
    if (mock) {
      let index = 0;
      console.log("setting interval");
      gyroInterval.current = setInterval(() => {
        let rand = Math.random();
        console.log("math random", rand);
        processAccelero({
          x: rand,
          y: rand,
          z: rand,
          timestamp: rand,
        });
        index += 1;
      }, 500);
    } else {
      subscriptionGyro.current = gyroscope.subscribe(processGyro, (error) => {
        console.log("Gyro sensor is not available");
      });
      subscription.current = accelerometer.subscribe(
        processAccelero,
        (error) => {
          console.log("Accelero sensor is not available");
        }
      );
    }

    return () => {
      console.log("Unsubscribe..");
      subscription.current?.unsubscribe();
      if (mock) {
        if (gyroInterval.current) clearInterval(gyroInterval.current);
      } else subscriptionGyro.current?.unsubscribe();
    };
  }, []);

  const processAccelero = ({ x, y, z, timestamp }: SensorData) => {
    if (times.current.length >= 20) {
      times.current.shift();
      xDatas.current.shift();
      yDatas.current.shift();
      zDatas.current.shift();
    }

    times.current.push(timestamp.toString());
    xDatas.current.push(x);
    yDatas.current.push(y);
    zDatas.current.push(z);

    setLineData1({
      labels: times.current,
      datasets: [
        {
          data: xDatas.current,
          strokeWidth: 2, // optional
        },
      ],
    });
    setLineData2({
      labels: times.current,
      datasets: [
        {
          data: yDatas.current,
          strokeWidth: 2, // optional
        },
      ],
    });
    setLineData3({
      labels: times.current,
      datasets: [
        {
          data: zDatas.current,
          strokeWidth: 2, // optional
        },
      ],
    });
  };

  const processGyro = ({ x, y, z, timestamp }: SensorData) => {
    if (xDatasGyro.current.length >= 20) {
      timesGyro.current.shift();
      xDatasGyro.current.shift();
      yDatasGyro.current.shift();
      zDatasGyro.current.shift();
    }

    timesGyro.current.push(timestamp.toString());
    xDatasGyro.current.push(x);
    yDatasGyro.current.push(y);
    zDatasGyro.current.push(z);

    setGyroX({
      labels: timesGyro.current,
      datasets: [
        {
          data: xDatasGyro.current,
          strokeWidth: 2, // optional
        },
      ],
    });
    setGyroY({
      labels: timesGyro.current,
      datasets: [
        {
          data: yDatasGyro.current,
          strokeWidth: 2, // optional
        },
      ],
    });
    setGyroZ({
      labels: timesGyro.current,
      datasets: [
        {
          data: zDatasGyro.current,
          strokeWidth: 2, // optional
        },
      ],
    });
    if (
      detectPray(xDatasGyro.current, yDatasGyro.current, zDatasGyro.current)
    ) {
      console.log("pray detected");
      RNSounds.beep();
    }
  };

  function detectPray(xGyro: number[], yGyro: number[], zGyro: number[]) {
    const length = xGyro.length;
    // for (var index = 0; index < length; index++) {
    if (length > 0 && zGyro[length - 1] > 1) {
      return true;
    }
    // }
    return false;
  }

  return (
    <ScrollView>
      <LineChart
        data={linedata1}
        width={Dimensions.get("window").width} // from react-native
        height={110}
        yAxisLabel={"$"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <LineChart
        data={linedata2}
        width={Dimensions.get("window").width} // from react-native
        height={110}
        yAxisLabel={"$"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <LineChart
        data={linedata3}
        width={Dimensions.get("window").width} // from react-native
        height={110}
        yAxisLabel={"$"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <LineChart
        data={gyroX}
        width={Dimensions.get("window").width} // from react-native
        height={110}
        yAxisLabel={"$"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <LineChart
        data={gyroY}
        width={Dimensions.get("window").width} // from react-native
        height={110}
        yAxisLabel={"$"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <LineChart
        data={gyroZ}
        width={Dimensions.get("window").width} // from react-native
        height={110}
        yAxisLabel={"$"}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </ScrollView>
  );
};

export default Experimental;
