import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken"
import JWT_SECRET from '../config';
import express from "express"
import http from "http"

const app = express()
export const server = http.createServer(app);
export default app;
const socketServer = new WebSocketServer({noServer: true})

export const userSocketMap: Record<string, WebSocket> = {}; // { userId: socket }

interface WebSocketMessage {
  type: "JOIN_ROOM" | "SEND_MESSAGE";
  payload: {
    roomId?: string;
    content?: string;
    image?: string;
  };
}

interface CustomWebSocket extends WebSocket {
  roomId?: string;
}

const checkUser = (token: string | undefined): string | null => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (typeof decoded === "string" || !decoded.userId) return null;
    return decoded.userId;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const userId = url.searchParams.get("userId");

  if (!userId) {
      socket.destroy();
      return;
  }

  socketServer.handleUpgrade(request, socket, head, (ws) => {
      socketServer.emit('connection', ws, request); // this triggers a connection event
  });
});

socketServer.on('connection', function connection(socket: CustomWebSocket, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";

  if (!token) {
    console.error("No token found in cookies");
    socket.close();
    return;
  }

  const userId = checkUser(token);

  if (!userId) {
    console.error("invalid token")
    socket.close();
    return;
  }
  console.log(`User ${userId} connected`);

  // Store the WebSocket for the user
  userSocketMap[userId] = socket;

  // Broadcast online users
  broadcastOnlineUsers();

  socket.on("error", console.error)

  socket.on("message", async (data) => {
      try {
          const parsedMessage: WebSocketMessage = JSON.parse(data.toString())
          console.log("message recieved: ", parsedMessage)
          if(parsedMessage.type === "JOIN_ROOM" && parsedMessage.payload.roomId){
              // join room logic
              socket.roomId = parsedMessage.payload.roomId
              console.log(`User ${userId} joined room ${parsedMessage.payload.roomId}`);
          }
          else if(parsedMessage.type === "SEND_MESSAGE"){
              const { roomId, content, image } = parsedMessage.payload;

              // Broadcast the message only;
              socketServer.clients.forEach((client) => { 
                  const customClient = client as CustomWebSocket;
                  if (
                      customClient.readyState === WebSocket.OPEN && 
                      customClient.roomId === roomId
                  ) {
                      customClient.send(
                          JSON.stringify({
                              type: "NEW_MESSAGE",
                              payload: { roomId, content, image },
                          })
                      );
                      console.log("message: ", content + ", " +image)
                  }
              });
          }
      } catch (error) {
          console.error("Error while sending message:", error);
      }
      
  })

  socket.on("close", () => {
    // logic to disconnect the user 
    // console.log("A client disconnected");

    const userId = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === socket
    );

    if (userId) {
        delete userSocketMap[userId];
        // console.log(`User ${userId} removed from socket map`);

        broadcastOnlineUsers();
    }
})
});

function broadcastOnlineUsers() {
  const onlineUsers = Object.keys(userSocketMap);
  socketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
              type: "ONLINE_USERS",
              payload: onlineUsers,
          }));
          console.log("online users:  ", onlineUsers)
      }
  });
}