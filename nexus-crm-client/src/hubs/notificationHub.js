import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "../api";

// The hub runs on the same host as the REST API
const API_BASE = "http://localhost:5128";

let connection = null;
let handler = null;

// The hub requires a JWT, so the connection is only opened once the user is
// logged in — not at import time.
export async function startNotificationHub(onNotification) {
  if (connection) return connection;

  handler = onNotification;
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/notifications`, {
      accessTokenFactory: () => getAuthToken() ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ReceiveNotification", handler);

  try {
    await connection.start();
  } catch (err) {
    console.error("SignalR Connection Error:", err);
  }

  return connection;
}

export async function stopNotificationHub() {
  const current = connection;
  const currentHandler = handler;
  connection = null;
  handler = null;

  if (!current) return;

  if (currentHandler) current.off("ReceiveNotification", currentHandler);

  try {
    await current.stop();
  } catch {
    // Already stopped or never finished negotiating — nothing to clean up.
  }
}
