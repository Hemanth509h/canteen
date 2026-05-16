import { io } from "socket.io-client";

// In production, this would be the actual backend URL
// For development, we use the window.location.origin or a hardcoded value if needed
const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

socket.on("connect", () => {
  console.log("[Socket] Connected to server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("[Socket] Disconnected from server");
});

export const useSocket = () => {
  return socket;
};
