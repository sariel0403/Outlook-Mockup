// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <NewEventSnippet>
import { useEffect, useState } from "react";
import { NavLink as RouterNavLink, Navigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Attendee, Message } from "microsoft-graph";
import {
  DialogContent,
  DialogContentText,
  TextField,
  Stack,
  FormControl,
  Input,
  InputLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";

import axios from "axios";

import { createMessage } from "./GraphService";
import { useAppContext } from "./AppContext";
import { UsernamePasswordClient } from "@azure/msal-common";

export default function NewMessage() {
  const app = useAppContext();

  const [user_list, setUserList] =
    useState<{ _id: string; useremail: string; username: string }[]>();
  const [filter_text, setFilter] = useState("");
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [subject, setSubject] = useState("");
  const [attendees, setAttendees] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [body, setBody] = useState("");
  const [formDisabled, setFormDisabled] = useState(true);
  const [redirect, setRedirect] = useState(false);

  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users/getuserlist")
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    setFormDisabled(
      subject.length === 0 || start.length === 0 || end.length === 0
    );
  }, [subject, start, end]);

  const doCreate = async () => {
    const attendeeEmails = attendees.split(";");
    const attendeeArray: Attendee[] = [];

    attendeeEmails.forEach((email) => {
      if (email.length > 0) {
        attendeeArray.push({
          emailAddress: {
            address: email,
          },
        });
      }
    });

    const newMessage: Message = {
      subject: subject,
      // Only add if there are attendees
      //   attendees: attendeeArray.length > 0 ? attendeeArray : undefined,
      // Specify the user's time zone so
      // the start and end are set correctly
      //   start: {
      //     dateTime: start,
      //     timeZone: app.user?.timeZone,
      //   },
      //   end: {
      //     dateTime: end,
      //     timeZone: app.user?.timeZone,
      //   },
      // Only add if a body was given
      body:
        body.length > 0
          ? {
              contentType: "text",
              content: body,
            }
          : undefined,
      toRecipients: [
        {
          emailAddress: {
            address: user,
            name: username,
          },
        },
      ],
    };

    try {
      await createMessage(app.authProvider!, newMessage);
      setRedirect(true);
    } catch (err) {
      app.displayError!("Error creating event", JSON.stringify(err));
    }
  };

  if (redirect) {
    return <Navigate to="/calendar" />;
  }
  return (
    <Form>
      <TextField
        id="standard-basic"
        label="Subject"
        variant="standard"
        value={subject}
        onChange={(ev) => setSubject(ev.target.value)}
        sx={{ width: "100%" }}
      />
      {/* <Form.Group>
        <Form.Label>Attendees</Form.Label>
        <Form.Control type="text"
          name="attendees"
          id="attendees"
          className="mb-2"
          placeholder="Enter a list of email addresses, separated by a semi-colon"
          value={attendees}
          onChange={(ev) => setAttendees(ev.target.value)} />
      </Form.Group> */}
      <TextField
        id="standard-basic"
        label="Attendees"
        variant="standard"
        value={user}
        sx={{ width: "100%" }}
      />
      <FormControl variant="standard" sx={{ width: "100%" }}>
        <InputLabel htmlFor="standard-adornment-password">
          Search User
        </InputLabel>
        <Input
          id="standard-adornment-password"
          onChange={handleFilterChange}
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </FormControl>
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "auto",
          height: 150,
          "& ul": { padding: 0 },
        }}
        subheader={<li />}
      >
        <li>
          <ul>
            {user_list?.map(
              (user: { _id: string; useremail: string; username: string }) =>
                user?.useremail.includes(filter_text) && (
                  <ListItem key={user?._id}>
                    <ListItemText primary={user?.useremail} />
                    <IconButton
                      onClick={() => {
                        setUser(user?.useremail);
                        setUsername(user?.username);
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                  </ListItem>
                )
            )}
          </ul>
        </li>
      </List>
      <Form.Group>
        <Form.Label>Body</Form.Label>
        <Form.Control
          as="textarea"
          name="body"
          id="body"
          className="mb-3"
          style={{ height: "10em" }}
          value={body}
          onChange={(ev) => setBody(ev.target.value)}
        />
      </Form.Group>
      <Button color="primary" className="me-2" onClick={() => doCreate()}>
        Create
      </Button>
      <RouterNavLink to="/emailclient" className="btn btn-secondary">
        Cancel
      </RouterNavLink>
    </Form>
  );
}
// </NewEventSnippet>
