package com.code.patientsystem.controller;

import com.code.patientsystem.model.Appointment;
import com.code.patientsystem.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointment")
@CrossOrigin
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/add")
    public String add(@RequestBody Appointment appointment) {
        appointmentService.saveAppointment(appointment);
        return "New appointment added";
    }

    @GetMapping("/getAll")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/today")
    public List<Appointment> getTodayAppointments() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().plusDays(1).atStartOfDay();
        return appointmentService.getAppointmentsByDateRange(start, end);
    }
}
