import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Paper, Button, Autocomplete, Grid, Typography, Card, CardContent, CardActions, IconButton, Tooltip, Divider, Stack, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

export default function Patient() {
  const paperStyle = { padding: "30px 20px", margin: "20px auto" };

  // Global states for adding new patient
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [illness, setIllness] = React.useState("");
  const [medicament, setMedicament] = React.useState("");

  const [patients, setPatients] = React.useState([]);
  const [selectedName, setSelectedName] = React.useState(null);
  const [relatedData, setRelatedData] = React.useState([]);

  const [showForm, setShowForm] = React.useState({});
  const [editValues, setEditValues] = React.useState({});

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

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


  const handleDelete = (id) => {
    fetch(`http://localhost:8080/patient/delete/${id}`, {
      method: "DELETE",
    }).then(() => {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/patient/getAll");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Patientenliste.");
      }
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
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
    <Box sx={{ p: 3, maxWidth: 1200, margin: "auto" }}>
      <Grid container spacing={4}>
        {/* ADD Patient Form */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} style={paperStyle}>
            <Typography variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon /> Neuen Patienten hinzufügen
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2} component="form" noValidate autoComplete="off">
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
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                sx={{ mt: 2 }}
              >
                Speichern
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={3} style={{ ...paperStyle, marginTop: "20px" }}>
             <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon /> Patient suchen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Autocomplete
              id="free-solo"
              options={patients.map((p) => p.name)}
              value={selectedName}
              onChange={handleSelection}
              renderInput={(params) => <TextField {...params} label="Name suchen..." />}
            />

            {relatedData.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 2 }}>
                {relatedData.map((item) => (
                  <Box key={item.id} sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="body2">Krankheit: {item.illness}</Typography>
                    <Typography variant="body2">Medikamente: {item.medicament}</Typography>
                    <Button 
                      size="small" 
                      onClick={() => showInfo(`/patients/${item.id}`)}
                      sx={{ mt: 1 }}
                    >
                      Details ansehen
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button 
              fullWidth
              variant="contained" 
              color="secondary" 
              startIcon={<FileDownloadIcon />}
              onClick={handleButtonClick}
            >
              Excel Export
            </Button>
          </Stack>
        </Grid>

        {/* PATIENT LIST + EDIT */}
        <Grid item xs={12} md={7}>
          <Box>
              <Typography variant="h5" color="primary" gutterBottom>
                Patientenliste
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                {patients.map((patient) => (
                  <Grid item xs={12} key={patient.id}>
                    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "5px solid", borderColor: "primary.main" }}>
                      <CardContent>
                        <Grid container justifyContent="space-between" alignItems="flex-start">
                          <Grid item>
                            <Typography variant="h6" component="div">{patient.name}</Typography>
                            <Typography color="text.secondary" variant="body2">{patient.address}</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ bgcolor: 'primary.light', color: 'white', px: 1, borderRadius: 1 }}>
                                {patient.illness}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Details">
                              <IconButton color="primary" onClick={() => showInfo(`/patients/${patient.id}`)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton color="info" onClick={() => handleEditClick(patient.id, patient)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Löschen">
                              <IconButton color="error" onClick={() => handleDelete(patient.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        {showForm[patient.id] && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                            <Stack spacing={1.5}>
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
                                color="success"
                                size="small"
                                onClick={() => handleUpdate(patient.id)}
                              >
                                Speichern
                              </Button>
                            </Stack>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
