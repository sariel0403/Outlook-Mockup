import React from "react";
import axios from "axios";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getMessageAttachments } from "./GraphService";
import { useAppContext } from "./AppContext";
import { isVariableStatement } from "typescript";
import { Attachment } from "microsoft-graph";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Stack } from "@mui/material";
import { NavLink as RouterNavLink } from "react-router-dom";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const EmailBody = (props: any) => {
  const [parsedText, setParseText] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [replyModalShow, setReplyModalShow] = React.useState(false);
  const [forwardModalShow, setForwardModalShow] = React.useState(false);
  const [docs, setDocs] = React.useState([]);
  const app = useAppContext();

  const parseText = (text: string): string => {
    return text.replace(new RegExp("\r?\n", "g"), "<br />");
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleReplyModalOpen = () => setReplyModalShow(true);
  const handleReplyModalClose = () => setReplyModalShow(false);
  const handleForwardModalOpen = () => setForwardModalShow(true);
  const handleForwardModalClose = () => setForwardModalShow(false);

  React.useEffect(() => {
    localStorage.setItem("mailId", props.mailId);
    const writeEmail = (data: string) => {
      axios
        .post("http://localhost:5000/api/users/writeemail", {
          data: data,
          id: props.mailId,
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    writeEmail(props.body.content);
    const loadAttachments = async () => {
      if (app.user) {
        try {
          var attachments: any = await getMessageAttachments(
            app.authProvider!,
            props.mailFolder,
            props.mailId
          );
          let newdocs: any = [];
          for (var i = 0; i < attachments.length; i++) {
            newdocs.push({
              uri:
                "http://localhost:5000/api/users/getfile?filename=" +
                attachments[i].name,
            });
            axios
              .post("http://localhost:5000/api/users/writefile", {
                filename: attachments[i].name,
                content: attachments[i].contentBytes,
              })
              .then(function (response) {
                console.log(response);
              })
              .catch(function (err) {
                console.log(err);
              });
          }
          setDocs(newdocs);
        } catch (err) {
          const error = err as Error;
          app.displayError!(error.message);
        }
      }
    };
    loadAttachments();
    setEmailAddress(
      "http://localhost:5000/api/users/getemail/?id=" + props.mailId
    );
  }, [props]);
  return (
    <div style={{ height: "calc(100% - 150px)" }}>
      <iframe
        style={{ width: "100%", height: "100%" }}
        src={emailAddress}
      ></iframe>
      {docs.length !== 0 && (
        <div>
          <Button onClick={handleOpen}>Show Attachments</Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <DocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
              />
            </Box>
          </Modal>
        </div>
      )}
      <Stack direction="row" spacing={2}>
        <RouterNavLink to="/replymessage">
          <Button>Reply</Button>
        </RouterNavLink>
        <RouterNavLink to="/forwardmessage">
          <Button>Forward</Button>
        </RouterNavLink>
      </Stack>
    </div>
  );
};

export default EmailBody;
