package com.code.patientsystem.controller;

import com.code.patientsystem.components.PatientAssist;
import com.code.patientsystem.model.Patient;
import com.code.patientsystem.repository.PatientRepository;
import com.code.patientsystem.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patient")
@CrossOrigin

public class PatientController {
    private final PatientAssist patientAssist;

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    public PatientController(PatientAssist patientAssist) {
        this.patientAssist = patientAssist;
    }

    @PostMapping("/add")
    public String add(@RequestBody Patient patient){
        patientService.savePatientInfo(patient);
        return "new patient is added";
    }

    @GetMapping("/getAll")
    public List<Patient> getAllPatients(){
        return patientService.getAllPatients();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteById(@PathVariable int id){
        patientService.deletePatientById(id);
        return "Patient deleted";
    }

    @GetMapping("/related-data/{name}")
    public List<Patient> getRelatedData(@PathVariable String name) {
        return patientService.findByName(name);
    }

    @GetMapping("/{id}")
    public Optional<Patient> getRelatedDataById(@PathVariable int id) {
        return patientRepository.findById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient( @PathVariable int id, @RequestBody Patient updatedPatient) {
        return patientAssist.updatePatient(id, updatedPatient);
    }

    @GetMapping("/excel")
    public ResponseEntity<Resource> generateExcel() throws IOException {
        return patientAssist.generateExcel();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> generatePdf(@PathVariable int id) throws IOException {
        return patientAssist.generatePdf(id);
    }

}
