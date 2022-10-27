import React, { useState, useEffect } from "react";
import { List, Typography, Stack, Divider, Card } from "@mui/material";
import { Message } from "microsoft-graph";

import { getMessages } from "./GraphService";
import { useAppContext } from "./AppContext";
import EmailListItem from "./EmailListItem";
import { red } from "@mui/material/colors";
import axios from "axios";

const color = red[50];

const EmailList = (props: any) => {
  const [mailFolder, setMailFolder] = useState("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [rules, setRules] = useState([]);
  const app = useAppContext();

  useEffect(() => {
    console.log("Mail Folder ----->", props.mailFolder);
    const loadMessages = async () => {
      axios
        .get("http://localhost:5000/api/users/getrules")
        .then((res) => {
          setRules(res.data);
          console.log(res.data);
        })
        .catch((err) => console.log(err));
      if (app.user) {
        try {
          if (
            props.mailFolder === "Inbox" ||
            props.mailFolder === "sentitems"
          ) {
            let messages = await getMessages(
              app.authProvider!,
              props.mailFolder
            );
            setMessages(messages);
          } else if (
            props.mailFolder === "archive" ||
            props.mailFolder === "rss"
          ) {
            let messages = await getMessages(app.authProvider!, "Inbox");
            let filteredMessages: Message[] = [];
            messages.map((message: Message) => {
              rules.map((rule: { filter: string; folder: string }) => {
                if (rule.folder == props.mailFolder) {
                  if (
                    message.body?.content?.includes(rule.filter) ||
                    message.subject?.includes(rule.filter)
                  ) {
                    filteredMessages.push(message);
                  }
                }
              });
            });
            setMessages(filteredMessages);
          }
        } catch (err) {
          const error = err as Error;
          app.displayError!(error.message);
        }
      }
    };
    loadMessages();
  }, [props.mailFolder]);

  const isTodayMessage = (receivedtime: any) => {
    var today: Date = new Date();
    var date: string =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    return receivedtime.includes(date);
  };
  return (
    <Card
      sx={{ minWidth: 350, height: "calc(100vh - 100px)", overflow: "auto" }}
    >
      <Stack>
        <Typography variant="h5" sx={{ padding: 3, backgroundColor: color }}>
          {props.mailFolder === "Inbox" && "Inbox"}
          {props.mailFolder === "sentitems" && "Sent Items"}
          {props.mailFolder === "archive" && "Archive"}
          {props.mailFolder === "rss" && "RSS"}
        </Typography>
        <Divider />
        <List sx={{ maxHeight: "100%", overflow: "auto" }}>
          {messages.map(
            (message: Message) =>
              isTodayMessage(message.receivedDateTime) && (
                <EmailListItem
                  subject={message.subject}
                  content={message.bodyPreview}
                  date={message.receivedDateTime}
                  key={message.id}
                  message={message}
                  setMessage={(newMessage: Message) => {
                    props.setMessage(newMessage);
                  }}
                  //   setData={(newMessage: Message) => props.setMessage(newMessage)}
                  //   onClick={props.setMessage(message)}
                  //   setMessage={props.setMessage(message)}
                />
              )
          )}
        </List>
      </Stack>
    </Card>
  );
};

export default EmailList;
