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

export interface HiyaMessage {
  action: "join" | "leave" | "locationUpdate";
  room: string;
  messageString?: string;
}

export interface HiyaLocationUpdate {
  action: "locationUpdate";
  room: string;
  location: LatLng;
}

export interface Connection {
  socket: WebSocket;
  name?: string;
}

export interface Room {
  name: string;
  connections: Connection[];
}
