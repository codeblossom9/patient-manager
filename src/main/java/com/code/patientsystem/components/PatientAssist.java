package com.code.patientsystem.components;

import com.code.patientsystem.model.Patient;
import com.code.patientsystem.repository.PatientRepository;
import com.code.patientsystem.service.PatientService;
import com.code.patientsystem.service.PatientServiceImpl;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class PatientAssist {

    private final PatientRepository patientRepository;
    private final PatientServiceImpl patientService;

    public PatientAssist(PatientRepository patientRepository, PatientServiceImpl patientService) {
        this.patientRepository = patientRepository;
        this.patientService = patientService;
    }

    public ResponseEntity<Patient> updatePatient(int id, Patient updatedPatient) {

        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();

            patient.setName(updatedPatient.getName());
            patient.setAddress(updatedPatient.getAddress());
            patient.setIllness(updatedPatient.getIllness());
            patient.setMedicament(updatedPatient.getMedicament());
            patient.setReport(updatedPatient.getReport());

            patientRepository.save(patient);

            return ResponseEntity.ok(patient);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    public ResponseEntity<Resource> generateExcel() throws IOException {
        List<Patient> patients = patientService.getAllPatients();

        // Generate the Excel file using Apache POI
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Patients");

        // Create the header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Id");
        headerRow.createCell(1).setCellValue("Name");
        headerRow.createCell(2).setCellValue("Address");
        headerRow.createCell(3).setCellValue("Illness");
        headerRow.createCell(4).setCellValue("Medicament");
        headerRow.createCell(5).setCellValue("Report");

        // Fill in the data rows
        int rowNum = 1;
        for (Patient patient : patients) {
            Row dataRow = sheet.createRow(rowNum++);
            dataRow.createCell(0).setCellValue(patient.getId());
            dataRow.createCell(1).setCellValue(patient.getName());
            dataRow.createCell(2).setCellValue(patient.getAddress());
            dataRow.createCell(3).setCellValue(patient.getIllness());
            dataRow.createCell(4).setCellValue(patient.getMedicament());
            dataRow.createCell(5).setCellValue(patient.getReport());
        }

        // Write the workbook to a ByteArrayOutputStream
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        // Create a ByteArrayResource from the ByteArrayOutputStream
        ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

        // Set the appropriate headers for the response
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=patients.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}