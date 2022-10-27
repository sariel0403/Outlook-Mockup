// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import ReactDOM from "react-dom/client";

import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  LogLevel,
} from "@azure/msal-browser";

import config from "./Config";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// <MsalInstanceSnippet>
const msalInstance = new PublicClientApplication({
  auth: {
    clientId: config.appId,
    redirectUri: config.redirectUri,
    // authority: config.authority,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
});

// Check if there are already accounts in the browser session
// If so, set the first account as the active account
const accounts = msalInstance.getAllAccounts();
if (accounts && accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    // Set the active account - this simplifies token acquisition
    const authResult = event.payload as AuthenticationResult;
    msalInstance.setActiveAccount(authResult.account);
  }
});
// </MsalInstanceSnippet>

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App pca={msalInstance} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
