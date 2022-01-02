import React from "react";
import {useParams} from 'react-router-dom';

import '../styles/profile.css';
import CustomAppBar from "../components/AppBar";
import ProfileUnsub from "../components/ProfileUnsub";
import Profile from "../components/Profile";

export default function ProfilePage() {
  const {username} = useParams();

  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/p2p/profiles/" + username)
      .then((res) => res.json())
      .then((res) => {
        setData({
          status: res.message.message,
          record: res.message.content
        });
      });
  }, []);

  if (!data) {
    return (
      "Loading..."
    )
  }

  if (data.status === "ERR_NOT_FOUND") {
    return (
      <h1>User Not Found</h1>
    )
  }

  return (
    <div className="ProfilePage">
      <CustomAppBar/>
      {
        data.status === "ERR_NOT_SUBSCRIBED" ?
          <ProfileUnsub username={username}/>
          :
          <Profile username={username} data={data}/>
      }
    </div>
  );
}