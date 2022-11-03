import React from "react";
import { Avatar, Stack, Typography } from "@mui/material";

const EmailContentHeader = (props: any) => {
  const [ccRecipients, setccRecipients] = React.useState("");
  const [toRecipients, settoRecipients] = React.useState("");
  const [bccRecipients, setbccRecipients] = React.useState("");
  React.useEffect(() => {
    if (props.cc !== undefined) {
      let newccRecipients = "", cnt = 0;
      props.cc.map((ccrecipient: any) => {
        if(cnt == props.cc.length - 1)
          newccRecipients += ccrecipient?.emailAddress.name;
        else
          newccRecipients += ccrecipient?.emailAddress.name + ", ";
        cnt++;
      });
      setccRecipients(newccRecipients);
    }
    if (props.to !== undefined) {
      let newtoRecipients = "", cnt = 0;
      props.to.map((torecipient: any) => {
        if(cnt == props.to.length - 1)
          newtoRecipients += torecipient?.emailAddress.name;
        else
          newtoRecipients += torecipient?.emailAddress.name + ", ";
        cnt++;
      });
      settoRecipients(newtoRecipients);
    }
    if (props.bcc !== undefined) {
      let newbccRecipients = "", cnt = 0;
      props.bcc.map((bccrecipient: any) => {
        if(cnt == props.bcc.length - 1)
          newbccRecipients += bccrecipient.emailAddress.name;
        else
          newbccRecipients += bccrecipient.emailAddress.name + ", ";
        cnt++;
      });
      setbccRecipients(newbccRecipients);
    }
  }, [props]);
  return (
    <Stack direction="row" spacing={2}>
      <Stack>
        <Typography component="span" variant="h6">
          {props.subject}
        </Typography>
        <Typography component="span" variant="subtitle1">
          From : {props.sender_email}
        </Typography>
        {toRecipients.length > 0 && (
          <Typography component="span" variant="subtitle1">
            To : {toRecipients}
          </Typography>
        )}
        {ccRecipients.length > 0 && (
          <Typography component="span" variant="subtitle2">
            CC : {ccRecipients}
          </Typography>
        )}
        {bccRecipients.length > 0 && (
          <Typography component="span" variant="subtitle2">
            BCC : {bccRecipients}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default EmailContentHeader;
