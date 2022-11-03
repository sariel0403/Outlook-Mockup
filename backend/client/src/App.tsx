// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { MsalProvider } from "@azure/msal-react";
import { IPublicClientApplication } from "@azure/msal-browser";

import ProvideAppContext from "./AppContext";
import ErrorMessage from "./ErrorMessage";
import NavBar from "./NavBar";
import Welcome from "./Welcome";
import MyCalendar from "./Calendar";
import NewEvent from "./NewEvent";
import "bootstrap/dist/css/bootstrap.css";
import EmailClient from "./EmailClient";
import NewMessage from "./NewMessage";
import { hot } from "react-hot-loader/root";
import ReplyMessage from "./ReplyMessage";
import ForwardMessage from "./ForwardMessage";
import UserSection from "./UserSection";

// import {Calendar, momentLocalizer} from 'react-big-calendar';

// declare const moment: any;
// const localizer = momentLocalizer(moment);

// <AppPropsSnippet>
type AppProps = {
  pca: IPublicClientApplication;
};
// </AppPropsSnippet>

const App = ({ pca }: AppProps): JSX.Element => {
  return (
    <MsalProvider instance={pca}>
      <ProvideAppContext>
        <Router>
          <NavBar />
          <Container>
            <ErrorMessage />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/calendar" element={<MyCalendar />} />
              <Route path="/newevent" element={<NewEvent />} />
              <Route path="/emailclient" element={<EmailClient />} />
              <Route path="/newmessage" element={<NewMessage />} />
              <Route path="/replymessage" element={<ReplyMessage />} />
              <Route path="/forwardmessage" element={<ForwardMessage />} />
              <Route path="/users" element={<UserSection />} />
            </Routes>
          </Container>
        </Router>
      </ProvideAppContext>
    </MsalProvider>
    // <EmailClient />
  );
};

export default App;
