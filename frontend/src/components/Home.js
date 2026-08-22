import React from "react";
import Appbar from "./Appbar";
import Patient from "./Patient";
import AppHeader from "./AppHeader";

function HomePage({ patients }) {
  return (
    <div className="App">
      <Appbar />
      <AppHeader />
      <Patient />
    </div>
  );
}

export default HomePage;
