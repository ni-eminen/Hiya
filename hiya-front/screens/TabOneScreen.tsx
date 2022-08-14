import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  AnimationType,
  INFINITE_ANIMATION_ITERATIONS,
  LeafletView,
  MapLayerType,
  MapShapeType,
} from "react-native-leaflet-view";
import { colorsArray } from "../constants/Colors";

import { RootTabScreenProps } from "../types";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const [view, setView] = useState("map");

  const imageSize = [750 / 160, 1186 / 160];

  const polygons = [
    [
      [3.328125, 3.2265625],
      [3.328125, 7],
      [6.25, 7],
      [6.25, 8.84765625],
      [7.875, 8.8515625],
      [7.875, 8.97265625],
      [8.8203125, 8.96875],
      [8.8203125, 8.84765625],
      [10.5234375, 8.84765625],
      [10.53125, 7],
      [10.75, 6.99609375],
      [10.75, 3.2265625],
    ],
    [
      [3.47265625, 18.6953125],
      [4.92578125, 18.6953125],
      [4.9296875, 23.6796875],
      [7.23046875, 23.671875],
      [7.22265625, 26.16796875],
      [3.4765625, 26.171875],
    ],
    [
      [6, 7.25],
      [3.4765625, 7.24609375],
      [3.4765625, 7.6015625],
      [3.6015625, 7.6015625],
      [3.59765625, 7.89453125],
      [3.4765625, 7.89453125],
      [3.4765625, 13.6015625],
      [5.30078125, 13.59765625],
      [5.30078125, 10.97265625],
      [6.02734375, 10.9765625],
      [6.03515625, 10.9453125],
      [6.10546875, 10.94921875],
      [6.11328125, 9.94921875],
      [6, 9.94921875],
    ],
    [
      [9.12109375, 9.125],
      [9.125, 13.57421875],
      [15.30078125, 13.578125],
      [15.328125, 8.9765625],
      [11.0234375, 8.9765625],
      [11.01953125, 9.125],
    ],
    [
      [6.25, 10.9921875],
      [6.25, 9.171875],
      [8.90625, 9.1171875],
      [8.8984375, 13.859375],
      [10.10546875, 13.84765625],
      [10.1015625, 18.42578125],
      [8.94921875, 18.42578125],
      [8.94921875, 18.52734375],
      [7.828125, 18.5234375],
      [7.83203125, 18.42578125],
      [7.375, 18.421875],
      [7.375, 16.75],
      [3.4765625, 16.75],
      [3.48046875, 14.046875],
      [7.32421875, 14.04296875],
      [7.328125, 13.625],
      [7.72265625, 13.6171875],
      [7.7265625, 10.97265625],
    ],
    [
      [3.4765625, 16.953125],
      [3.4765625, 18.328125],
      [7.1953125, 18.3203125],
      [7.203125, 16.9453125],
    ],
    [
      [5.072265625, 18.6953125],
      [5.078125, 23.42578125],
      [5.14453125, 23.43359375],
      [5.142578125, 23.5078125],
      [7.224609375, 23.5],
      [7.2265625, 23.40234375],
      [7.4453125, 23.404296875],
      [7.443359375, 23.580078125],
      [13.72265625, 23.576171875],
      [13.728515625, 18.701171875],
    ],
  ].map((poly) => {
    return poly.map((points) => {
      points[0] = points[0] / 4;
      points[1] = points[1] / 4;

      return points;
    });
  });

  let imageBounds = [
    [0, 0], // padding
    imageSize, // image dimensions
  ];

  // return <View style={styles.container}>{view === "map" && <Map />}</View>;
  return (
    <LeafletView
      // mapCenterPosition={{ lat: imageSize[0] / 2, lng: imageSize[1] / 2 }}
      mapLayers={[
        {
          url: "http://www.uotilaloma.fi/wp-content/uploads/2017/03/elegante_ylakerta_pohjapiirros2015.png",
          layerType: MapLayerType.IMAGE_LAYER,
          bounds: imageBounds,
        },
      ]}
      zoom={2}
      mapShapes={polygons.map((p, i) => {
        return {
          shapeType: MapShapeType.POLYGON,
          color: colorsArray[i % colorsArray.length],
          id: "1",
          positions: p,
        };
      })}
      mapMarkers={[
        {
          icon: "a",
          position: { lat: 39.225727, lng: -77.94471 },
          size: [32, 32],
          id: "",
        },
      ]}
    />
  );
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
