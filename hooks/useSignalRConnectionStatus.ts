"use client";

import { useEffect, useState } from "react";
import { signalRService } from "@/services/signalr";
import * as signalR from "@microsoft/signalr";

export function useSignalRConnectionStatus() {
  const [isConnected, setIsConnected] = useState(signalRService.isConnected());

  console.log("useSignalRConnectionStatus", isConnected);
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(signalRService.isConnected());
    };

    checkConnection(); // estado inicial

    const connection = signalRService['connection'];
    if (!connection) return;

    const handleChange = () => {
      setIsConnected(connection.state === signalR.HubConnectionState.Connected);
    };

    connection.onreconnected(handleChange);
    connection.onreconnecting(handleChange);
    connection.onclose(handleChange);

    return () => {
      connection.off("onreconnected", handleChange);
      connection.off("onreconnecting", handleChange);
      connection.off("onclose", handleChange);
    };
  }, []);

  return isConnected;
}
