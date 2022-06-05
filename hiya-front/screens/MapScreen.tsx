import React, { useEffect, useRef, useState } from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { RootTabScreenProps } from "../types";
import * as Location from "expo-location";
import { LocationSubscription } from "expo-location";
import MapView, { Marker } from "react-native-maps";
import {
  HiyaLocationUpdate,
  HiyaMessage,
  HiyaRoomAction,
  LatLng,
} from "../HiyaTypes";

const Map = () => {
  const DEFAULT_LOC = {
    coords: {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      altitude: 1,
      heading: 0,
      speed: 0,
      altitudeAccuracy: 0,
    },
    mocked: true,
    timestamp: 1,
  };
  const [location, setLocation] =
    useState<Location.LocationObject>(DEFAULT_LOC);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [loc, setLoc] = useState<Location.LocationObject>();
  const room = "testroom";
  const [locSub, setLocSub] = useState<LocationSubscription>();
  const [locations, setLocations] = useState<LatLng[]>([]);

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

  const parseData = (data: string) => {
    try {
      const message = JSON.parse(data);
      return message;
    } catch (e: any) {
      // console.log(e);
      return null;
    }
  };

  const joinChannel = () => {
    const ws = new WebSocket("ws://172.20.10.2:4000");

    ws.onerror = (evt) => {
      console.log("evt");
    };
    ws.onclose = (evt) => {
      console.log("closed");
      locSub?.remove();
    };

    ws.onmessage = (msg: { data: string }) => {
      const { data } = msg;
      const message: HiyaMessage = parseData(data);

      try {
        switch (message.type) {
          case "location-update-server":
            console.log("locationdata received from server");

            message.locations
              ? setLocations(message.locations)
              : ws.send("Missing property: locations");
        }
      } catch (e: any) {
        console.log(
          "Could not parse message into HiyaMessage. Message: ",
          message
        );
      }
    };

    ws.onopen = async () => {
      const joinRoom: HiyaRoomAction = {
        type: "room-action",
        action: "join",
        room: room,
      };
      ws.send(JSON.stringify(joinRoom));

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 0,
          timeInterval: 0,
        },
        (newloc) => {
          const locupdate: HiyaLocationUpdate = {
            type: "location-update-client",
            newLocation: [newloc.coords.latitude, newloc.coords.longitude],
            room: room,
          };
          ws.send(JSON.stringify(locupdate));
          console.log("sent loc to server");

          setLocation(newloc);
        }
      );

      setLocSub(locationSubscription);
    };
  };

  return (
    <>
      <MapView
        followsUserLocation={true}
        showsUserLocation={true}
        style={styles.map}
      >
        {locations.map((l, i) => {
          return (
            <Marker
              key={Math.random()}
              coordinate={{
                latitude: l[0],
                longitude: l[1],
              }}
            ></Marker>
          );
        })}
      </MapView>
      <View style={{ position: "absolute", top: 50, left: 50 }}>
        <Button title="Join testroom" onPress={joinChannel} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default Map;
