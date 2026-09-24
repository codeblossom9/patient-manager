import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, Grid, Typography, Paper, Divider, Stack, Chip, Card, CardContent } from "@mui/material";
import Appbar from "./Appbar";
import AppHeader from "./AppHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const PatientInfo = ({ patients }) => {
  const [report, setReport] = React.useState("");
  const { id } = useParams();
  const navigate = useNavigate();

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

  const downloadPdf = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/patient/${id}/pdf`, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        console.error("Failed to download PDF");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Appbar />
      <AppHeader />
      <Box sx={{ p: 3, maxWidth: 900, margin: "auto" }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate("/")}
          sx={{ mb: 3 }}
        >
          Zurück zur Liste
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <PersonIcon sx={{ fontSize: 64, color: "primary.main" }} />
                <Typography variant="h5" fontWeight="bold">{patient.name}</Typography>
                <Chip label={`ID: ${patient.id}`} variant="outlined" size="small" />
              </Stack>
              
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Adresse</Typography>
                  <Typography variant="body1">{patient.address}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Krankheit</Typography>
                  <Typography variant="body1" fontWeight="medium" color="error.main">
                    {patient.illness}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Medikamente</Typography>
                  <Typography variant="body1">{patient.medicament}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospitalIcon color="primary" /> Ärztlicher Bericht
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" sx={{ minHeight: 100, fontStyle: patient.report ? "normal" : "italic", color: patient.report ? "text.primary" : "text.secondary" }}>
                  {patient.report || "Kein Bericht verfügbar."}
                </Typography>
              </CardContent>
            </Card>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Bericht aktualisieren
              </Typography>
              <TextField
                label="Neuer Bericht / Anmerkungen"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  fullWidth
                  onClick={() => handleUpdate(patient.id)}
                >
                  Speichern
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FileDownloadIcon />}
                  fullWidth
                  onClick={() => downloadPdf(patient.id)}
                >
                  PDF Export
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default PatientInfo;
