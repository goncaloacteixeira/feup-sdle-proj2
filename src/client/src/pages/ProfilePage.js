import React from "react";
import {useParams} from 'react-router-dom';

import '../styles/profile.css';
import CustomAppBar from "../components/AppBar";
import ProfileUnsub from "../components/ProfileUnsub";
import ProfileOffline from "../components/ProfileOffline";
import ProfileSelf from "../components/ProfileSelf";
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

  switch (data.status) {
    case "ERR_NOT_FOUND":
      // change this to a 404
      return (
        <h1>User Not Found</h1>
      )
    case "ERR_SELF":
      return (
        <div className="ProfilePage">
          <CustomAppBar/>
          <ProfileSelf username={username} data={data}/>
        </div>
      )
    case "ERR_NOT_SUBSCRIBED":
      return (
        <div className="ProfilePage">
          <CustomAppBar/>
          <ProfileUnsub username={username}/>
        </div>
      )
    case "ERR_NO_INFO":
      return (
        <div className="ProfilePage">
          <CustomAppBar/>
          <ProfileOffline username={username}/>
        </div>
      )
    case "OK":
      return (
        <div className="ProfilePage">
          <CustomAppBar/>
          <Profile username={username} data={data}/>
        </div>
      )
    default:
      return (
        <h1>ERROR</h1>
      )
  }
}