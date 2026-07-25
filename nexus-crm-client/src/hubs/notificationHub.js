import * as signalR from "@microsoft/signalr";

// The backend API runs on the same host as the REST API
const API_BASE = "http://localhost:5128";

// Initialize SignalR connection to the notifications hub
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_BASE}/notifications`)
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.start().catch(err => console.error("SignalR Connection Error:", err));

export default connection;
