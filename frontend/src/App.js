import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NewPage from "./components/NewPage";
import PatientInfo from "./components/PatientInfo";
import React, { useEffect } from "react";

const App = () => {
  const [patients, setPatients] = React.useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:8080/patient/getAll");
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home patients={patients} />} />
        <Route
          path="/patients/:id"
          element={<PatientInfo patients={patients} />}
        />
        <Route path="/new" element={<NewPage />} />
      </Routes>
    </Router>
  );
};

export default App;
