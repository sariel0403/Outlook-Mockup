import React from "react";
import { Box, Card } from "@mui/material";

import EmailContentHeader from "./EmailContentHeader";
import EmailBody from "./EmailBody";

const EmailContent = (props: any) => {
  console.log(props);
  if (props.message !== undefined) {
    return (
      <Card
        sx={{ width: "100%", height: "calc(100vh - 100px)", overflow: "auto" }}
      >
        <EmailContentHeader
          subject={props.message.subject}
          sender_email={props.message.sender.emailAddress.address}
          sent_time={props.message.sentDateTime}
          to={props.message.toRecipients}
          cc={props.message.ccRecipients}
          bcc={props.message.bccRecipients}
        />
        <EmailBody body={props.message.body} mailId={props.message.id} />
      </Card>
    );
  } else {
    return <></>;
  }
};

export default EmailContent;
