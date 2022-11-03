import React from "react";
import { Stack } from "@mui/material";
import { Message } from "microsoft-graph";

import EmailCategory from "./EmailCategory";
import EmailList from "./EmailList";
import EmailContent from "./EmailContent";

const EmailClient = () => {
  const [mailFolder, setMailFolder] = React.useState("Inbox");
  const [message, setMessage] = React.useState<Message>();

  return (
    <div>
      <Stack direction="row" spacing={2} sx={{ padding: 2 }}>
        <EmailCategory
          onChange={(newMailFolder: string) => setMailFolder(newMailFolder)}
          // sx={{ width: 200 }}
          // sx={{ padding: 2 }}
        />
        <EmailList
          mailFolder={mailFolder}
          setMessage={(newMessage: Message) => {
            setMessage(newMessage);
            console.log("!@#!@#");
          }}
          onClick={() => {
            console.log("123");
          }}
        />
        <EmailContent message={message} />
      </Stack>
    </div>
  );
};

export default EmailClient;
