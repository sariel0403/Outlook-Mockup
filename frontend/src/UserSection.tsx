import React from "react";
import axios from "axios";

export default function UserSection() {
  const [usercount, setUsercount] = React.useState(0);
  React.useEffect(() => {
    axios
      .get("http://localhost:5000/api/users/getuserlist")
      .then((res) => setUsercount(res.data.length))
      .catch((err) => console.log(err));
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: 200,
        border: "solid green 10px",
        top: "50%",
        right: "50%",
        transform: "translate(50%,-50%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "50%",
          transform: "translate(50%,-50%)",
        }}
      >
        <p style={{ fontSize: 70, marginBottom: 0 }}>Users</p>
        <p style={{ fontSize: 100, textAlign: "center" }}>{usercount}</p>
      </div>
    </div>
  );
}
