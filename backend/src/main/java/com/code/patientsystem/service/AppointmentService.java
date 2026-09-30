package com.code.patientsystem.service;

import com.code.patientsystem.model.Appointment;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {
    public Appointment saveAppointment(Appointment appointment);
    public List<Appointment> getAllAppointments();
    public List<Appointment> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end);
}
