import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Paper, Button, Autocomplete, Grid, Typography, Card, CardContent, CardActions, IconButton, Tooltip, Divider, Stack, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EventIcon from "@mui/icons-material/Event";

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

  // Appointment states
  const [openAppointmentDialog, setOpenAppointmentDialog] = React.useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = React.useState(null);
  const [appointmentDate, setAppointmentDate] = React.useState("");
  const [appointmentDescription, setAppointmentDescription] = React.useState("");
  const [includeAppointment, setIncludeAppointment] = React.useState(false);

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
    })
      .then((res) => res.json())
      .then((savedPatient) => {
        setPatients((prev) => [...prev, savedPatient]);
        if (includeAppointment && appointmentDate) {
          addAppointment(savedPatient);
        }
        // Reset patient form
        setName("");
        setAddress("");
        setIllness("");
        setMedicament("");
        setAppointmentDate("");
        setAppointmentDescription("");
        setIncludeAppointment(false);
      });
  };

  const addAppointment = (patient) => {
    const appointment = {
      patient: patient,
      appointmentDate: appointmentDate,
      description: appointmentDescription
    };
    fetch("http://localhost:8080/appointment/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    })
    .then(() => {
      // Potentially refresh global state or today's appointments if needed
      // For now, just alert or log
      console.log("Appointment added");
    })
    .catch(err => console.error(err));
  };

  const handleOpenAppointment = (patient) => {
    setSelectedPatientForAppointment(patient);
    setOpenAppointmentDialog(true);
  };

  const handleSaveAppointment = () => {
    if (selectedPatientForAppointment && appointmentDate) {
      addAppointment(selectedPatientForAppointment);
      setOpenAppointmentDialog(false);
      setAppointmentDate("");
      setAppointmentDescription("");
      setSelectedPatientForAppointment(null);
    }
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
    <Box sx={{ p: 0, width: "100%", margin: "0" }}>
      <Grid container spacing={0}>
        {/* ADD Patient Form */}
        <Grid item xs={12}>
          <Paper elevation={3} style={{ ...paperStyle, margin: "0 0 20px 0" }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon /> Patienten hinzufügen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2} component="form" noValidate autoComplete="off">
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Adresse"
                variant="outlined"
                fullWidth
                size="small"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <TextField
                label="Erkrankung"
                variant="outlined"
                fullWidth
                size="small"
                value={illness}
                onChange={(e) => setIllness(e.target.value)}
              />
              <TextField
                label="Medikamente"
                variant="outlined"
                fullWidth
                size="small"
                value={medicament}
                onChange={(e) => setMedicament(e.target.value)}
              />
              
              <Typography variant="subtitle2" color="text.secondary">Termin (optional)</Typography>
              <TextField
                type="datetime-local"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  if (e.target.value) setIncludeAppointment(true);
                }}
              />
              {includeAppointment && (
                <TextField
                  label="Beschreibung"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={appointmentDescription}
                  onChange={(e) => setAppointmentDescription(e.target.value)}
                />
              )}
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                sx={{ mt: 1 }}
              >
                Speichern
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={3} style={{ ...paperStyle, margin: "0 0 20px 0" }}>
             <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon /> Suchen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Autocomplete
              id="free-solo"
              size="small"
              options={patients.map((p) => p.name)}
              value={selectedName}
              onChange={handleSelection}
              renderInput={(params) => <TextField {...params} label="Name..." />}
            />

            {relatedData.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 2 }}>
                {relatedData.map((item) => (
                  <Box key={item.id} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{item.name}</Typography>
                    <Button 
                      size="small" 
                      onClick={() => showInfo(`/patients/${item.id}`)}
                    >
                      Details
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          <Button 
            fullWidth
            variant="contained" 
            color="secondary" 
            startIcon={<FileDownloadIcon />}
            onClick={handleButtonClick}
            sx={{ mb: 3 }}
          >
            Excel Export
          </Button>
        </Grid>

        {/* PATIENT LIST + EDIT */}
        <Grid item xs={12}>
          <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Patientenliste
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {patients.map((patient) => (
                  <Card key={patient.id} elevation={2} sx={{ borderRadius: 2, borderLeft: "5px solid", borderColor: "primary.main" }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{patient.name}</Typography>
                          <Typography color="text.secondary" variant="caption" display="block">{patient.address}</Typography>
                          <Typography variant="caption" sx={{ bgcolor: 'primary.light', color: 'white', px: 0.5, borderRadius: 0.5, mt: 0.5, display: 'inline-block' }}>
                            {patient.illness}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box>
                            <IconButton size="small" color="primary" onClick={() => showInfo(`/patients/${patient.id}`)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="success" onClick={() => handleOpenAppointment(patient)}>
                              <EventIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box>
                            <IconButton size="small" color="info" onClick={() => handleEditClick(patient.id, patient)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(patient.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>

                      {showForm[patient.id] && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                          <Stack spacing={1}>
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
                              OK
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
        </Grid>
      </Grid>

      {/* Appointment Dialog */}
      <Dialog open={openAppointmentDialog} onClose={() => setOpenAppointmentDialog(false)}>
        <DialogTitle>Termin für {selectedPatientForAppointment?.name} hinzufügen</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField
              label="Datum und Uhrzeit"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            <TextField
              label="Beschreibung"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={appointmentDescription}
              onChange={(e) => setAppointmentDescription(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppointmentDialog(false)}>Abbrechen</Button>
          <Button onClick={handleSaveAppointment} variant="contained" color="primary">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
