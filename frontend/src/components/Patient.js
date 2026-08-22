import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Paper, Button, Autocomplete, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Patient() {
  const paperStyle = { padding: "50px 20px", width: 600, margin: "20px auto" };

  // Global states for adding new patient
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [illness, setIllness] = React.useState("");
  const [medicament, setMedicament] = React.useState("");

  const [patients, setPatients] = React.useState([]);
  const [divVisibility, setDivVisibility] = React.useState(false);
  const [selectedName, setSelectedName] = React.useState(null);
  const [relatedData, setRelatedData] = React.useState([]);

  const [showForm, setShowForm] = React.useState({});
  const [editValues, setEditValues] = React.useState({});

  const navigate = useNavigate();

  const handleEditClick = (id, patient) => {
    setShowForm((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    setEditValues((prev) => ({
      ...prev,
      [id]: {
        name: patient.name,
        address: patient.address,
        illness: patient.illness,
        medicament: patient.medicament,
      },
    }));
  };

  const handleUpdate = async (id) => {
    const updatedPatient = { id, ...editValues[id] };

    try {
      await fetch(`http://localhost:8080/patient/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPatient),
      });

      fetchPatients();
      setShowForm((prev) => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const patient = { name, address, illness, medicament };
    fetch("http://localhost:8080/patient/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    }).then(() => {
      setPatients((prev) => [...prev, patient]);
    });
  };

  const showPatients = () => {
    setDivVisibility((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:8080/patient/delete/${id}`, {
      method: "DELETE",
    }).then(() => {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:8080/patient/getAll");
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const handleSelection = (event, value) => {
    setSelectedName(value);
    fetch(`http://localhost:8080/patient/related-data/${value}`)
      .then((response) => response.json())
      .then((data) => setRelatedData(data));
  };

  const handleButtonClick = () => {
    fetch("http://localhost:8080/patient/excel")
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "patients.xlsx";
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error generating Excel:", error);
      });
  };

  const showInfo = (to) => {
    navigate(to);
  };

  return (
    <Grid container spacing={1} justify="center">
      <Grid item xs>
        <Paper elevation={3} style={paperStyle}>
          <h1 style={{ color: "blue" }}>Neuen Patienten hinzufügen</h1>
          <Box
            component="form"
            sx={{ "& > :not(style)": { m: 1 } }}
            noValidate
            autoComplete="off"
          >
            {/* ADD Patient Form */}
            <TextField
              label="Patientenname"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Patientenadresse"
              variant="outlined"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
              label="Patientenerkrankung"
              variant="outlined"
              fullWidth
              value={illness}
              onChange={(e) => setIllness(e.target.value)}
            />
            <TextField
              label="Medikamente des Patienten"
              variant="outlined"
              fullWidth
              value={medicament}
              onChange={(e) => setMedicament(e.target.value)}
            />
            <Button variant="contained" color="secondary" onClick={handleSubmit}>
              Speichern
            </Button>
            <Button variant="contained" color="primary" onClick={showPatients}>
              Patientenliste anzeigen
            </Button>
            <Button variant="contained" color="secondary" onClick={handleButtonClick}>
              Excel-Bericht erstellen
            </Button>
            {/*
            <Button variant="contained" color="primary" onClick={() => showInfo("/new")}>
              New Page
            </Button>
            */}

            <div>
              <Autocomplete
                id="free-solo"
                options={patients.map((p) => p.name)}
                value={selectedName}
                onChange={handleSelection}
                renderInput={(params) => <TextField {...params} label="Suchen" />}
              />

              <ul>
                {relatedData.map((item) => (
                  <h4 key={item.id}>
                    Name: {item.name} <br />
                    Krankheit: {item.illness} <br />
                    Medikamente: {item.medicament}
                  </h4>
                ))}
              </ul>
            </div>
          </Box>
        </Paper>
      </Grid>

      {/* PATIENT LIST + EDIT */}
      {divVisibility && (
        <Grid item xs={6}>
          <Paper elevation={3} style={paperStyle}>
            {patients.map((patient) => (
              <Paper
                key={patient.id}
                elevation={6}
                style={{ margin: "10px", padding: "15px", textAlign: "left" }}
              >
                Name: {patient.name}
                <br />
                Adresse: {patient.address}
                <br />
                Krankheit: {patient.illness}
                <br />
                Medikamente: {patient.medicament}
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDelete(patient.id)}
                >
                  Löschen
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ m: 1 }}
                  onClick={() => handleEditClick(patient.id, patient)}
                >
                  Bearbeiten
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => showInfo(`/patients/${patient.id}`)}
                >
                  Patienteninformationen zeigen
                </Button>

                {showForm[patient.id] && (
                  <div>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                      <TextField
                        label="Name"
                        size="small"
                        fullWidth
                        value={editValues[patient.id]?.name || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [patient.id]: {
                              ...prev[patient.id],
                              name: e.target.value,
                            },
                          }))
                        }
                      />
                      <TextField
                        label="Adresse"
                        size="small"
                        fullWidth
                        value={editValues[patient.id]?.address || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [patient.id]: {
                              ...prev[patient.id],
                              address: e.target.value,
                            },
                          }))
                        }
                      />
                      <TextField
                        label="Krankheit"
                        size="small"
                        fullWidth
                        value={editValues[patient.id]?.illness || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [patient.id]: {
                              ...prev[patient.id],
                              illness: e.target.value,
                            },
                          }))
                        }
                      />
                      <TextField
                        label="Medikamente"
                        size="small"
                        fullWidth
                        value={editValues[patient.id]?.medicament || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [patient.id]: {
                              ...prev[patient.id],
                              medicament: e.target.value,
                            },
                          }))
                        }
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleUpdate(patient.id)}
                      >
                        Aktualisieren
                      </Button>
                    </Box>
                  </div>
                )}
              </Paper>
            ))}
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
