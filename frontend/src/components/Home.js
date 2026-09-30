import React, { useState, useEffect } from "react";
import Appbar from "./Appbar";
import Patient from "./Patient";
import AppHeader from "./AppHeader";
import CalendarView from "./CalendarView";
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import EventIcon from '@mui/icons-material/Event';

function HomePage({ patients }) {
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/appointment/today")
      .then(res => res.json())
      .then(data => setTodayAppointments(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', pb: 5 }}>
      <Appbar />
      <AppHeader />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Column 1: Patient Management */}
          <Grid item xs={12} lg={4}>
            <Patient />
          </Grid>

          {/* Column 2: Calendar View */}
          <Grid item xs={12} lg={5}>
            <CalendarView />
          </Grid>
          
          {/* Column 3: Today's Appointments */}
          <Grid item xs={12} lg={3}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" color="primary">
                  Heutige Termine
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {todayAppointments.length === 0 ? (
                <Typography color="text.secondary">Keine Termine für heute.</Typography>
              ) : (
                <List>
                  {todayAppointments.map((app) => (
                    <React.Fragment key={app.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {app.patient.name}
                            </Typography>
                          }
                          secondary={app.description}
                        />
                      </ListItem>
                      <Divider variant="fullWidth" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
