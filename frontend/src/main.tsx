import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { styles, config, colors } from "./chakra.config.ts";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "./socket/Socket.tsx";

const theme = extendTheme({ config, styles, colors });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Toaster />
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
