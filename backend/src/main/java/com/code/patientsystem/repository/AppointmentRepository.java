package com.code.patientsystem.repository;

import com.code.patientsystem.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
}
