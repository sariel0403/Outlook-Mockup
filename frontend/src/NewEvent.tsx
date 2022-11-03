// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <NewEventSnippet>
import { useEffect, useState } from "react";
import { NavLink as RouterNavLink, Navigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Event } from "microsoft-graph";
import { TextField } from "@mui/material";
import axios from "axios";
import SelectMultipleAttendees from "./SelectMultipleAttendees";
import { createEvent, createAttachment } from "./GraphService";
import { useAppContext } from "./AppContext";

export default function NewEvent() {
  const app = useAppContext();

  const [user_list, setUserList] =
    useState<{ _id: string; useremail: string }[]>();
  const [filter_text, setFilter] = useState("");
  const [user, setUser] = useState("");
  const [subject, setSubject] = useState("");
  const [filename, setFileName] = useState("");
  const [comment, setComment] = useState("");
  const [filedata, setFileData] = useState([]);
  const [attendees, setAttendees] = useState<{ email: string; name: string }[]>(
    []
  );
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [body, setBody] = useState("");
  const [formDisabled, setFormDisabled] = useState(true);
  const [redirect, setRedirect] = useState(false);

  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
  };

  const uploadFile = (event: any) => {
    let file = event.target.files[0];
    let formData = new FormData();
    formData.append("file", file);

    axios
      .post("http://localhost:5000/api/users/uploadfiles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setFileData(res.data);
      console.log("filedata", res.data)}
        )
      .catch((err) => console.log(err));
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
  const convertVariant = (
    source: string,
    email: string,
    name: string,
    datetime: string
  ): string => {
    let dest = source.replaceAll("$email", email);
    dest = dest.replaceAll("$name", name);
    dest = dest.replaceAll("$datetime", datetime);
    return dest;
  };
  const doCreate = async () => {
    try {
      attendees.forEach(async (attendee: { email: string; name: string }) => {
        var today = new Date();
        var date =
          today.getDate() +
          "/" +
          (today.getMonth() + 1) +
          "/" +
          today.getFullYear();
        var time =
          today.getHours() >= 12
            ? today.getHours() - 12
            : today.getHours() +
              ":" +
              today.getMinutes() +
              ":" +
              today.getSeconds();
        let datetime =
          time + " " + (today.getHours() >= 12 ? "PM" : "AM") + " " + date;
        let convertedsubject = convertVariant(
          subject,
          attendee.email,
          attendee.name,
          datetime
        );
        let convertedbody = convertVariant(
          body,
          attendee.email,
          attendee.name,
          datetime
        );
        const newEvent: Event = {
          subject: convertedsubject,
          // Only add if there are attendees
          // attendees: attendeeArray.length > 0 ? attendeeArray : undefined,
          attendees: [ {
            emailAddress: {
              address: attendee.email
            } 
          }],
          // Specify the user's time zone so
          // the start and end are set correctly
          start: {
            dateTime: start,
            timeZone: app.user?.timeZone,
          },
          end: {
            dateTime: end,
            timeZone: app.user?.timeZone,
          },
          // Only add if a body was given
          body:
            convertedbody.length > 0
              ? {
                  contentType: "html",
                  content: convertedbody,
                }
              : undefined,
          hasAttachments:true,

        };
        var res = await createEvent(app.authProvider!, newEvent);
        var eventid = res.id;
        console.log("Created Event --->", res);
        let attachmentdata = "";
        filedata.map((eachdata: { email: string; data: string }) => {
          if (eachdata.email == attendee.email) {
            attachmentdata = eachdata.data;
          }
        });
        let convertedfilename = convertVariant(
          filename,
          attendee.email,
          attendee.name,
          datetime
        );
        await createAttachment(
          app.authProvider!,
          eventid,
          convertedfilename,
          attachmentdata
        );
      });

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
      <SelectMultipleAttendees
        setAttendees={(newAttendees: any) => setAttendees(newAttendees)}
      />
      <TextField
        id="standard-basic"
        label="Attachment Name"
        variant="standard"
        value={filename}
        onChange={(ev) => setFileName(ev.target.value)}
        sx={{ width: "100%" }}
      />
      <input type="file" onChange={uploadFile} />
      <Row className="mb-2">
        <Col>
          <Form.Group>
            <Form.Label>Start</Form.Label>
            <Form.Control
              type="datetime-local"
              name="start"
              id="start"
              value={start}
              onChange={(ev) => setStart(ev.target.value)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>End</Form.Label>
            <Form.Control
              type="datetime-local"
              name="end"
              id="end"
              value={end}
              onChange={(ev) => setEnd(ev.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
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

      <Button
        color="primary"
        className="me-2"
        disabled={formDisabled}
        onClick={() => doCreate()}
      >
        Create
      </Button>
      <RouterNavLink to="/calendar" className="btn btn-secondary">
        Cancel
      </RouterNavLink>
    </Form>
  );
}
// </NewEventSnippet>
