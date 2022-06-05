export type LatLng = [number, number];

export interface GeoJson {
  type: string;
  geometry: {
    type: string;
    coordinates: LatLng;
  };
  properties: {
    name: string;
  };
}

export type HiyaMessage = HiyaLocationUpdate | HiyaRoomAction;
interface HiyaMessageBase {
  room: string;
}

export interface HiyaRoomAction extends HiyaMessageBase {
  type: "room-action";
  action: "join" | "leave";
}

/**
 * Server / Client refers to the origin of the data.
 */
export type HiyaLocationUpdate =
  | HiyaLocationUpdateServer
  | HiyaLocationUpdateClient;

interface HiyaLocationUpdateServer extends HiyaMessageBase {
  type: "location-update-server";
  locations: LatLng[];
}

interface HiyaLocationUpdateClient extends HiyaMessageBase {
  type: "location-update-client";
  newLocation: LatLng;
}

export interface Connection {
  socket: WebSocket;
  location?: LatLng;
  name?: string;
}

export interface Room {
  name: string;
  connections: Connection[];
}
