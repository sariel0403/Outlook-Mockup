import React from "react";
import { Avatar, Stack, Typography } from "@mui/material";

const EmailContentHeader = (props: any) => {
  let ccRecipients = "";
  let toRecipients = "";
  let bccRecipients = "";
  React.useEffect(() => {
    if (props.cc !== undefined) {
      props.cc.map((ccrecipient: any) => {
        ccRecipients += ccrecipient?.emailAddress.name + " ";
      });
    }
    if (props.to !== undefined) {
      props.to.map((torecipient: any) => {
        toRecipients += torecipient?.emailAddress.name + " ";
      });
    }
    if (props.bcc !== undefined) {
      props.bcc.map((bccrecipient: any) => {
        bccRecipients += bccrecipient?.emailAddress.name + " ";
      });
    }
  }, [props]);
  return (
    <Stack direction="row" spacing={2}>
      <Stack>
        <Typography component="span" variant="subtitle1">
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
