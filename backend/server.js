const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const User = require("./models/User");
const Message = require("./models/Message");
const qs = require("qs");
const cors = require("cors");
const axios = require("axios");
var nodemailer = require("nodemailer");
// Connect to Database
connectDB();

// Set Limit

// Initialize Middleware
app.use(express.json({ strict: false, limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());

// app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define Routes
app.use("/api/users", require("./routes/api/users"));

// Serve Static assets in production
if (process.env.NODE_ENV === "production") {
  // Set Static Folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

/*
POST /{tenant}/oauth2/v2.0/token HTTP/1.1
Host: https://login.microsoftonline.com
Content-Type: application/x-www-form-urlencoded

client_id=11111111-1111-1111-1111-111111111111
&scope=user.read%20mail.read
&refresh_token=OAAABAAAAiL9Kn2Z27UubvWFPbm0gLWQJVzCTE9UkP3pSx1aXxUjq...
&grant_type=refresh_token
&client_secret=jXoM3iz...      // NOTE: Only required for web apps
 */

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

function intervalFunc() {
  User.find({}, function (err, users) {
    // console.log("users type", users[0].refreshToken);
    console.log("users length", users.length);
    for (let i = 0; i < users.length; i++) {
      var data = qs.stringify({
        client_id: "3cf476da-a75d-4767-a024-4af6df349dd0",
        refresh_token: users[i].refreshToken,
        scope:
          "https://graph.microsoft.com/User.Read https://graph.microsoft.com/mailboxsettings.read https://graph.microsoft.com/calendars.read https://graph.microsoft.com/mail.read https://graph.microsoft.com/mail.send openid profile offline_access",
        grant_type: "refresh_token",
      });
      var config = {
        method: "post",
        url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        headers: {
          Origin: "http://localhost:3000",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
      axios(config)
        .then(async function (response) {
          var token = response.data.access_token;
          // console.log("token--->", token);
          await axios
            .get(
              "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=100",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              const inboxmessages = res.data.value;
              for (let i = 0; i < inboxmessages.length; i++) {
                if (
                  inboxmessages[i].body.content
                    .toLowerCase()
                    .includes("booking") ||
                  inboxmessages[i].subject.toLowerCase().includes("booking")
                ) {
                  Message.findOne({ id: inboxmessages[i].id }).then(
                    (message) => {
                      if (message) {
                      } else {
                        // Send email to server with smtp.
                        var transporter = nodemailer.createTransport({
                          service: "gmail",
                          auth: {
                            user: "juri.god0403@gmail.com",
                            pass: "pfbfiriqcxsfthsx",
                          },
                        });

                        var mailOptions = {
                          from: "no@reply.com",
                          to: "Joseph@masonicvillagespennsylvania.org",
                          subject: inboxmessages[i].subject,
                          html: inboxmessages[i].body.content,
                        };

                        transporter.sendMail(
                          mailOptions,
                          function (error, info) {
                            if (error) {
                              console.log(error);
                            } else {
                              console.log("Email sent: " + info.response);
                            }
                          }
                        );
                      }
                    }
                  );

                  const newMessage = new Message({ id: inboxmessages[i].id });
                  newMessage.save();
                }
              }
            })
            .catch((err) => console.log("messageerr---->", err));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
}

setInterval(intervalFunc, 10000);
