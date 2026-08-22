package com.code.patientsystem.service;

import com.code.patientsystem.model.Patient;

import java.util.List;

public interface PatientService {
    public Patient savePatientInfo(Patient patient);
    public List<Patient> getAllPatients();

    public void deletePatientById(int id);

    List<Patient> findByName(String name);
}
