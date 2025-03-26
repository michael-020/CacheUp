import { WebSocket, WebSocketServer } from 'ws';
import { chatModel, userModel, chatRoomModel } from "shared/src/models/db"
import { JWT_SECRET }  from "shared/src/lib/config"
import jwt from "jsonwebtoken"
const socketServer = new WebSocketServer({ port: 4000 });


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
  if (userId){
    userSocketMap[userId] = socket;

    broadcastOnlineUsers()
  }

  socket.on("error", console.error)

  socket.on("message", async (data) => {
      try {
          const parsedMessage: WebSocketMessage = JSON.parse(data.toString())

          if(parsedMessage.type === "JOIN_ROOM" && parsedMessage.payload.roomId){
              // join room logic
              socket.roomId = parsedMessage.payload.roomId

              // console.log(`User ${userId} joined room ${parsedMessage.payload.roomId}`);
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
      }
  });
}