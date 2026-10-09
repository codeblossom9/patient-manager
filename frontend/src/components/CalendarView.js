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
  InputLabel,
  Popover,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const CalendarView = () => {
  const [appointments, setAppointments] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);

  const handleDayClick = (event, dateStr, dayAppointments) => {
    setAnchorEl(event.currentTarget);
    setSelectedDay(dateStr);
    setSelectedDayAppointments(dayAppointments);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedDay(null);
  };

  const popoverOpen = Boolean(anchorEl);

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
        <Grid
          item
          xs={12 / 7}
          key={d}
          onClick={(e) => handleDayClick(e, dateStr, dayAppointments)}
          sx={{
            border: '1px solid #eee',
            minHeight: 100,
            p: 0.5,
            cursor: 'pointer',
            bgcolor: dayAppointments.length > 0 ? 'action.hover' : 'background.paper',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
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

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, minWidth: 220, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {selectedDay}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {selectedDayAppointments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Keine Termine an diesem Tag.
            </Typography>
          ) : (
            <List dense disablePadding>
              {selectedDayAppointments.map(app => (
                <ListItem key={app.id} disableGutters>
                  <ListItemText
                    primary={app.patient.name}
                    secondary={new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </Paper>
  );
};

export default CalendarView;
