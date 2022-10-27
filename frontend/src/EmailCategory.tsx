import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Typography,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import SendIcon from "@mui/icons-material/Send";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Message } from "microsoft-graph";
import { NavLink as RouterNavLink } from "react-router-dom";
import { useAppContext } from "./AppContext";
import { getMessages } from "./GraphService";
import useEnhancedEffect from "@mui/material/utils/useEnhancedEffect";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import axios from "axios";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
// import NewMessageDialog from "./NewMssageDialog";

const EmailCategory = (props: any) => {
  const [rules, setRules] = useState([]);
  const [visible, setVisible] = useState(false);
  const [mailFolder, setMailFolder] = useState("Inbox");
  const [inboxMailCount, setInboxMailCount] = useState(0);
  const [sentMailCount, setSentMailCount] = useState(0);
  const [archieveMailCount, setArchieveMailCount] = useState(0);
  const [rssMailCount, setRSSMailCount] = useState(0);
  const [moveToFolder, setMoveToFolder] = useState("archive");
  const [filter, setFilter] = useState("");
  const app = useAppContext();
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((event.target as HTMLInputElement).value);
  };
  const handleSetFilter = () => {
    axios
      .post("http://localhost:5000/api/users/newrule", {
        filter: filter,
        folder: moveToFolder,
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    setOpen(false);
  };
  const handleOpenDialog = () => {
    setVisible(!visible);
  };
  const handleMoveToFolderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMoveToFolder((event.target as HTMLInputElement).value);
  };
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

  useEffect(() => {
    const countInboxMessages = async () => {
      /* axios to get rules */
      axios
        .get("http://localhost:5000/api/users/getrules")
        .then((res) => {
          setRules(res.data);
          console.log(res.data);
        })
        .catch((err) => console.log(err));
      if (app.user) {
        try {
          const inboxMessages = await getMessages(app.authProvider!, "inbox");
          let inboxMessageCnt: number = 0;
          let archieveMessageCnt: number = 0;
          let rssMessageCnt: number = 0;
          inboxMessages.map((inboxMessage: Message) => {
            if (isTodayMessage(inboxMessage.receivedDateTime)) {
              inboxMessageCnt++;
              rules.map((rule: { filter: string; folder: string }, index) => {
                if (
                  inboxMessage.body?.content?.includes(rule.filter) ||
                  inboxMessage.subject?.includes(rule.filter)
                ) {
                  console.log("filter --->", rule.filter);
                  if (rule.folder === "archive") {
                    archieveMessageCnt++;
                  } else {
                    rssMessageCnt++;
                  }
                }
              });
            }
          });
          console.log("Archive Message Cnt --->", archieveMessageCnt);
          setArchieveMailCount(archieveMessageCnt);
          setRSSMailCount(rssMessageCnt);
          setInboxMailCount(inboxMessageCnt);
        } catch (err) {
          const error = err as Error;
          app.displayError!(error.message);
        }
      }
    };
    const countSentMessages = async () => {
      if (app.user) {
        try {
          const sentMessages = await getMessages(
            app.authProvider!,
            "sentitems"
          );
          let sentMessageCnt: number = 0;
          sentMessages.map((sentMessage: Message) => {
            if (isTodayMessage(sentMessage.receivedDateTime)) {
              sentMessageCnt++;
            }
          });
          setSentMailCount(sentMessageCnt);
        } catch (err) {
          const error = err as Error;
          app.displayError!(error.message);
        }
      }
    };
    countInboxMessages();
    countSentMessages();
  }, []);

  return (
    <Box sx={{ width: 200, minWidth: 200 }}>
      <Box sx={{ padding: 2 }}>
        <RouterNavLink to="/newmessage">
          <Button variant="contained" onClick={handleOpenDialog}>
            New Message
          </Button>
        </RouterNavLink>
        <Button
          variant="contained"
          onClick={handleOpen}
          style={{ marginTop: 15 }}
        >
          Set New Rule
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <TextField
              id="outlined-basic"
              label="Filter"
              variant="outlined"
              onChange={handleFilterChange}
            />
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={moveToFolder}
              onChange={handleMoveToFolderChange}
              // style={{ width: '100%' }}
            >
              <FormControlLabel
                value="archive"
                control={<Radio />}
                label="Archive"
              />
              <FormControlLabel value="rSS" control={<Radio />} label="RSS" />
            </RadioGroup>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleSetFilter}
                style={{ width: "50%" }}
              >
                Set
              </Button>
              <Button
                variant="contained"
                onClick={handleClose}
                style={{ width: "50%" }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
      <List>
        <ListItem
          secondaryAction={
            <Typography variant="subtitle1" component="div">
              {inboxMailCount}
            </Typography>
          }
          disablePadding
        >
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText
              primary="Inbox"
              onClick={() => props.onChange("Inbox")}
            />
          </ListItemButton>
        </ListItem>
        <ListItem
          secondaryAction={
            <Typography variant="subtitle1" component="div">
              {sentMailCount}
            </Typography>
          }
          disablePadding
        >
          <ListItemButton>
            <ListItemIcon>
              <SendIcon />
            </ListItemIcon>
            <ListItemText
              primary="Sent Items"
              onClick={() => props.onChange("sentitems")}
            />
          </ListItemButton>
        </ListItem>
        <ListItem
          secondaryAction={
            <Typography variant="subtitle1" component="div">
              {archieveMailCount}
            </Typography>
          }
          disablePadding
        >
          <ListItemButton>
            <ListItemIcon>
              <Inventory2OutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Archive"
              onClick={() => props.onChange("archive")}
            />
          </ListItemButton>
        </ListItem>
        <ListItem
          secondaryAction={
            <Typography variant="subtitle1" component="div">
              {rssMailCount}
            </Typography>
          }
          disablePadding
        >
          <ListItemButton>
            <ListItemIcon>
              <FolderOpenIcon />
            </ListItemIcon>
            <ListItemText primary="RSS" onClick={() => props.onChange("rss")} />
          </ListItemButton>
        </ListItem>
      </List>
      {/* <NewMessageDialog show={visible} /> */}
    </Box>
  );
};

export default EmailCategory;
