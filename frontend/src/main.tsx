import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketContextProvider } from "./socket/Socket.tsx";
import { SelectConversationContextProvider } from "./hooks/useSelectConversation.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <SelectConversationContextProvider>
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </SelectConversationContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
