import React from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, Autocomplete, Grid } from "@mui/material";
import Appbar from "./Appbar";
import AppHeader from "./AppHeader";
import Paper from "@mui/material/Paper";

const PatientInfo = ({ patients }) => {
  const [report, setReport] = React.useState("");
  const { id } = useParams();

  const patient = patients.find((patient) => {
    return patient.id === parseInt(id, 10);
  });

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const handleUpdate = async (id) => {
    const name = patient.name;
    const address = patient.address;
    const illness = patient.illness;
    const medicament = patient.medicament;
    const updatedPatient = { id, name, address, illness, medicament, report };
    try {
      await fetch("http://localhost:8080/patient/" + id, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPatient),
      });
      console.log(patient);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <div>
      <Appbar />
      <AppHeader />


  <Grid container spacing={1} justifyContent="center">
  <Grid item xs={12} md={6}>
    <Paper
      elevation={3}
      style={{
        padding: "20px",
        marginTop: "20px",
      }}
    >
      <h1 style={{ color: "blue" }}>Patienteninformationen</h1>

      <Box>
        <h3>Name: {patient.name}</h3>
        <h3>Adresse: {patient.address}</h3>
        <h3>Krankheit: {patient.illness}</h3>
        <h3>Medikamente: {patient.medicament}</h3>
        <h3>Bericht: {patient.report}</h3>
              <h4 style={{ color: "blue" }}> Bericht zum Patientenbesuch hinzufügen </h4>
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1 },
        }}
        width={600}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="outlined-basic"
          label="Bericht"
          variant="outlined"
          fullWidth
          value={report}
          onChange={(e) => setReport(e.target.value)}
        />

        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleUpdate(patient.id)}
        >
          Submit
        </Button>
      </Box>
      </Box>
    </Paper>
  </Grid>
</Grid>

    </div>
  );
};

export default PatientInfo;
