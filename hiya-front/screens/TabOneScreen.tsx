import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import * as Location from "expo-location";
import { HiyaLocationUpdate, HiyaMessage, LatLng } from "../HiyaTypes";
import { LocationSubscription } from "expo-location";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [loc, setLoc] = useState<Location.LocationObject>();

  const room = "testroom";
  const [locSub, setLocSub] = useState<LocationSubscription>();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const joinChannel = () => {
    const ws = new WebSocket("ws://172.20.10.2:4000");
    console.log("ws");

    ws.onerror = (evt) => {
      console.log(evt);
    };
    ws.onclose = (evt) => {
      console.log("closed");
      locSub?.remove();
    };

    ws.onmessage = (msg) => {
      console.log(msg);
    };

    ws.onopen = async () => {
      const joinRoom: HiyaMessage = {
        action: "join",
        room: room,
      };
      ws.send(JSON.stringify(joinRoom));

      const l = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 0,
        },
        (newloc) => {
          console.log(
            "---",
            newloc.coords.latitude,
            "-------",
            newloc.coords.longitude
          );
          const locupdate: HiyaLocationUpdate = {
            action: "locationUpdate",
            location: [newloc.coords.latitude, newloc.coords.longitude],
            room: room,
          };
          ws.send(JSON.stringify(locupdate));
          console.log("sent loc to server");

          setLocation(newloc);
        }
      );

      setLocSub(l);
    };
  };

  return (
    <View>
      <View>
        <Button title={"Join Channel"} onPress={joinChannel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
