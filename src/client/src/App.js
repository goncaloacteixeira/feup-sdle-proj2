import logo from './logo.svg';
import './App.css';
import React from "react";
import CustomAppBar from "./components/AppBar";

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/p2p/start")
        .then((res) => res.json())
        .then((data) => {
            setData(JSON.stringify(data));
            console.log(data)
        });
  }, []);

  return (
      <div>
        <CustomAppBar />
          { !data ? "loading..." : data}
      </div>
  );
}

export default App;
