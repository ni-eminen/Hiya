import * as http from "http";
import express from "express";
import dotenv from "dotenv";
import * as WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

("use strict");

const { networkInterfaces } = require("os");

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

console.log(results);

type LatLng = [number, number];

interface GeoJson {
  type: string;
  geometry: {
    type: string;
    coordinates: LatLng;
  };
  properties: {
    name: string;
  };
}

type HiyaMessage = HiyaLocationUpdate | HiyaRoomAction;
interface HiyaMessageBase {
  room: string;
}

interface HiyaRoomAction extends HiyaMessageBase {
  type: "room-action";
  action: "join" | "leave";
}

type HiyaLocationUpdate = HiyaLocationUpdateServer | HiyaLocationUpdateClient;

interface HiyaLocationUpdateServer extends HiyaMessageBase {
  type: "location-update-server";
  locations: LatLng[];
}

interface HiyaLocationUpdateClient extends HiyaMessageBase {
  type: "location-update-client";
  newLocation: LatLng;
}
interface Connection {
  socket: WebSocket;
  location?: LatLng;
  name?: string;
}

interface Room {
  name: string;
  connections: Connection[];
}

dotenv.config();

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
const rooms: Room[] = [];

const parseData = (data: any) => {
  try {
    const message = JSON.parse(data.toString());
    return message;
  } catch (e: any) {
    return null;
  }
};

wss.on("connection", (ws: WebSocket) => {
  const connId = uuidv4();
  const connection: Connection = {
    socket: ws,
    name: connId,
    location: [60.22899004950994, 24.958941363122307],
  };

  //connection is up, let's add a simple simple event
  ws.on("message", (data: any) => {
    const message: HiyaMessage = parseData(data);
    if (message === null) {
      ws.send("expected json format");
      return;
    }

    // Get the room
    const room = rooms.find((r) => r.name === message.room);
    switch (message.type) {
      case "room-action":
        // Check if room exists
        if (room === undefined) {
          // Create a room and push this connection into it
          const newRoom = {
            name: message.room,
            connections: [{ socket: ws, name: connId }],
          };
          rooms.push(newRoom);
          ws.send("created new room and joined successfully");
        } else {
          // Room exists, push this connection into it
          if (room.connections.some((c) => c.socket === connection.socket)) {
            ws.send("Already in room.");
            return;
          }
          room.connections.push(connection);
          ws.send("joined successfully");
        }
        break;
      case "location-update-client":
        if (room === undefined) {
          ws.send("room doesnt exist");
        } else if (message.newLocation !== undefined) {
          const updated = room.connections.map((c) => {
            if (c.socket === ws) {
              c.location = message.newLocation;
              return c.location;
            }
            return c.location;
          });
          const data = {
            locations: updated,
          };
          // Send the message  to each connection
          const newlocs: HiyaLocationUpdateServer = {
            locations: updated as LatLng[],
            room: room.name,
            type: "location-update-server",
          };

          room.connections.forEach((c) => {
            c.socket.send(JSON.stringify(newlocs));
          });
        }
        break;
      default:
        ws.send("Your message did not follow the correct protocol.");
    }
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Connected to Hiya websocket server");
});

//start our server
server.listen(process.env.PORT || 4000, () => {
  console.log(`Server started on port ${port}`);
});
