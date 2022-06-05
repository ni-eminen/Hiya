import React, { useEffect, useRef, useState } from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { RootTabScreenProps } from "../types";
import * as Location from "expo-location";
import { LocationSubscription } from "expo-location";
import MapView, { Marker } from "react-native-maps";
import Map from "./MapScreen";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const [view, setView] = useState("map");

  return <View style={styles.container}>{view === "map" && <Map />}</View>;
}

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
