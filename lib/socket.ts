"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Singleton browser socket connection to the API. Auth is via the
 * NextAuth session cookie (withCredentials), verified server-side in
 * apps/api/sockets/index.ts — same session, no separate token to manage.
 */
export function getSocket(): Socket {
  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    socket = io(apiUrl, { withCredentials: true, autoConnect: true });
  }
  return socket;
}
