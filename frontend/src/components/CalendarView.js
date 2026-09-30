import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';

const CalendarView = () => {
  const [appointments, setAppointments] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetch("http://localhost:8080/appointment/getAll")
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }, []);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<Grid item xs={12 / 7} key={`empty-${i}`} sx={{ border: '1px solid #eee', minHeight: 80 }} />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(app => app.appointmentDate.startsWith(dateStr));

      days.push(
        <Grid item xs={12 / 7} key={d} sx={{ border: '1px solid #eee', minHeight: 100, p: 0.5, bgcolor: dayAppointments.length > 0 ? 'action.hover' : 'background.paper' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{d}</Typography>
          {dayAppointments.map(app => (
            <Box key={app.id} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 1, px: 0.5, mb: 0.5, fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {app.patient.name}
            </Box>
          ))}
        </Grid>
      );
    }

    return days;
  };

  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const years = [2024, 2025, 2026, 2027];

  return (
    <Paper sx={{ p: 3, mt: 0, borderRadius: 3, height: '100%', minHeight: 600 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Terminkalender
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Monat</InputLabel>
          <Select value={month} label="Monat" onChange={(e) => setMonth(e.target.value)}>
            {months.map((m, i) => (
              <MenuItem key={m} value={i}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Jahr</InputLabel>
          <Select value={year} label="Jahr" onChange={(e) => setYear(e.target.value)}>
            {years.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container sx={{ border: '1px solid #eee' }}>
        {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
          <Grid item xs={12 / 7} key={day} sx={{ bgcolor: 'grey.200', textAlign: 'center', py: 1, fontWeight: 'bold', border: '1px solid #eee' }}>
            {day}
          </Grid>
        ))}
        {renderCalendar()}
      </Grid>
    </Paper>
  );
};

export default CalendarView;
