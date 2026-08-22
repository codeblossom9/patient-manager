package com.code.patientsystem.repository;

import com.code.patientsystem.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository <Patient, Integer> {
    List<Patient> findByName(String name);
}
