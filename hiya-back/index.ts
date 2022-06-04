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

interface HiyaMessage {
  action: "join" | "leave" | "locationUpdate";
  room: string;
  messageString?: string;
}

export interface HiyaLocationUpdate {
  action: "locationUpdate";
  room: string;
  location: GeoJson;
}

interface Connection {
  socket: WebSocket;
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
  };

  //connection is up, let's add a simple simple event
  ws.on("message", (data: HiyaMessage) => {
    const message = parseData(data);
    if (message === null) {
      ws.send("expected json format");
      return;
    }

    // Get the room
    const room = rooms.find((r) => r.name === message.room);
    switch (message.action) {
      case "join":
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
      case "locationUpdate":
        if (room === undefined) {
          ws.send("room doesnt exist");
        } else if (message.location !== undefined) {
          // Send the message  to each connection
          room.connections.forEach((c) => {
            c.socket.send(message.messageString);
          });
          console.log((message as HiyaLocationUpdate).location);
        }
        break;
      default:
        ws.send("Your message did not follow the correct protocol.");
    }
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");
});

//start our server
server.listen(process.env.PORT || 4000, () => {
  console.log(`Server started on port ${port}`);
});
