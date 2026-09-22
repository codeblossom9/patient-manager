package com.code.patientsystem.components;

import com.code.patientsystem.model.Patient;
import com.code.patientsystem.repository.PatientRepository;
import com.code.patientsystem.service.PatientServiceImpl;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
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

    public ResponseEntity<Resource> generatePdf(int id) throws IOException {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (optionalPatient.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Patient patient = optionalPatient.get();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header / Logo area
        document.add(new Paragraph("Healthcare hospital")
                .setFontSize(24)
                .setItalic()
                .setFontColor(new DeviceRgb(0, 51, 102))
                .setTextAlignment(TextAlignment.LEFT));
        
        document.add(new Paragraph("Health Care Center\n123 Medical Drive, Cologne City\nPhone: (555) 0123-4567")
                .setFontSize(10)
                .setFontColor(new DeviceRgb(100, 100, 100))
                .setTextAlignment(TextAlignment.LEFT));

        document.add(new Paragraph("\n"));
        document.add(new Paragraph("PATIENTENBERICHT")
                .setFontSize(22)
                .setBold()
                .setUnderline()
                .setFontColor(new DeviceRgb(0, 0, 255))
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("\n"));

        // Patient Details Section
        document.add(new Paragraph("Patienten Details").setBold().setFontSize(14).setFontColor(new DeviceRgb(0, 0, 255)));
        document.add(new Paragraph("Name: ").add(patient.getName() != null ? patient.getName() : "N/A"));
        document.add(new Paragraph("Adresse: ").add(patient.getAddress() != null ? patient.getAddress() : "N/A"));
        
        document.add(new Paragraph("\n"));
        
        // Medical Info Section
        document.add(new Paragraph("Medizinische Informationen").setBold().setFontSize(14).setFontColor(new DeviceRgb(0, 0, 255)));
        document.add(new Paragraph("Krankheit: ").add(patient.getIllness() != null ? patient.getIllness() : "N/A"));
        document.add(new Paragraph("Medikamente: ").add(patient.getMedicament() != null ? patient.getMedicament() : "N/A"));
        
        document.add(new Paragraph("\n"));
        
        // Report Section
        document.add(new Paragraph("Ärztlicher Bericht").setBold().setFontSize(14).setFontColor(new DeviceRgb(0, 0, 255)));
        document.add(new Paragraph(patient.getReport() != null ? patient.getReport() : "Kein Bericht verfügbar."));

        // Signature Section
        document.add(new Paragraph("\n\n\n\n"));
        
        Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
        signatureTable.setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        
        Cell dateCell = new Cell().add(new Paragraph("Datum: ____________________"))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT);
        Cell signCell = new Cell().add(new Paragraph("Unterschrift: ____________________"))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT);
        
        signatureTable.addCell(dateCell);
        signatureTable.addCell(signCell);
        
        document.add(signatureTable);

        document.close();

        ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

        HttpHeaders headers = new HttpHeaders();
        // Change attachment to inline to help preview, but download can also be handled by frontend
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=patient_report_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

}