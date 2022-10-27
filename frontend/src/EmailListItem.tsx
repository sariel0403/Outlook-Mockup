import React, { useEffect, useState } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Message } from "microsoft-graph";

const EmailListItem = (props: any) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setTitle(convertTitle(props.subject));
    setContent(props.content);
    setDate(convertDate(props.date));
  }, []);

  const convertTitle = (title: string): string => {
    if (title.length > 20) {
      title = title.slice(0, 20);
      title += "...";
    }
    return title;
  };

  const convertDate = (date: string): string => {
    return date.slice(11, 16);
  };

  return (
    <div>
      <ListItem disablePadding>
        <ListItemButton onClick={() => props.setMessage(props.message)}>
          <ListItemIcon>
            <Avatar>
              <AccountCircleOutlinedIcon />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={title}
            secondary={content}
            sx={{
              width: 270,
              height: 63,
              overflow: "hidden",
            }}
          />
        </ListItemButton>
        <Typography
          variant="subtitle2"
          component="span"
          sx={{ position: "absolute", right: 15, top: 15 }}
        >
          {date}
        </Typography>
      </ListItem>
      <Divider />
    </div>
  );
};

export default EmailListItem;
