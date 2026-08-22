package com.code.patientsystem.service;

import com.code.patientsystem.model.Patient;
import com.code.patientsystem.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientServiceImpl implements PatientService {
    @Autowired
    private PatientRepository patientRepository;
    @Override
    public Patient savePatientInfo(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public void deletePatientById(int id) {
        patientRepository.deleteById(id);
    }

    @Override
    public List<Patient> findByName(String name) {
        return patientRepository.findByName(name);
    }
}
