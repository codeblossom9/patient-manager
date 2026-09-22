package com.code.patientsystem.components;

import com.code.patientsystem.model.Patient;
import com.code.patientsystem.repository.PatientRepository;
import com.code.patientsystem.service.PatientServiceImpl;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
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
        
        DeviceRgb primaryColor = new DeviceRgb(25, 118, 210); // Material Blue
        DeviceRgb lightGray = new DeviceRgb(245, 245, 245);
        DeviceRgb textGray = new DeviceRgb(100, 100, 100);

        // Header Table
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
        headerTable.setMarginBottom(20);
        
        Cell titleCell = new Cell().add(new Paragraph("Healthcare Hospital")
                .setFontSize(26)
                .setBold()
                .setFontColor(primaryColor))
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
        
        Cell contactCell = new Cell().add(new Paragraph("Health Care Center\n123 Medical Drive, Cologne City\nPhone: (555) 0123-4567\nwww.healthcare-hosp.com")
                .setFontSize(9)
                .setFontColor(textGray)
                .setTextAlignment(TextAlignment.RIGHT))
                .setBorder(Border.NO_BORDER);
        
        headerTable.addCell(titleCell);
        headerTable.addCell(contactCell);
        document.add(headerTable);

        // Line separator
        document.add(new Paragraph("").setBorderBottom(new SolidBorder(primaryColor, 1)).setMarginBottom(20));

        // Report Title
        document.add(new Paragraph("PATIENTENBERICHT / MEDICAL REPORT")
                .setFontSize(18)
                .setBold()
                .setMarginBottom(20)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(primaryColor));

        // Patient Info Section
        document.add(new Paragraph("Patienteninformationen").setBold().setFontSize(14).setMarginBottom(10).setFontColor(primaryColor));
        
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{30, 70})).useAllAvailableWidth();
        infoTable.setMarginBottom(20);

        addInfoRow(infoTable, "Name:", patient.getName() != null ? patient.getName() : "N/A", lightGray);
        addInfoRow(infoTable, "Adresse:", patient.getAddress() != null ? patient.getAddress() : "N/A", null);
        addInfoRow(infoTable, "Patienten-ID:", String.valueOf(patient.getId()), lightGray);
        
        document.add(infoTable);

        // Medical Details Section
        document.add(new Paragraph("Diagnose & Behandlung").setBold().setFontSize(14).setMarginBottom(10).setFontColor(primaryColor));
        
        Table medicalTable = new Table(UnitValue.createPercentArray(new float[]{30, 70})).useAllAvailableWidth();
        medicalTable.setMarginBottom(20);

        addInfoRow(medicalTable, "Erkrankung:", patient.getIllness() != null ? patient.getIllness() : "N/A", lightGray);
        addInfoRow(medicalTable, "Medikation:", patient.getMedicament() != null ? patient.getMedicament() : "N/A", null);
        
        document.add(medicalTable);

        // Detailed Report Section
        document.add(new Paragraph("Ärztlicher Befund").setBold().setFontSize(14).setMarginBottom(10).setFontColor(primaryColor));
        
        Cell reportContent = new Cell().add(new Paragraph(patient.getReport() != null && !patient.getReport().isEmpty() ? patient.getReport() : "Kein ausführlicher Bericht verfügbar."))
                .setPadding(10)
                .setBackgroundColor(lightGray)
                .setBorder(new SolidBorder(new DeviceRgb(200, 200, 200), 0.5f));
        
        Table reportTable = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        reportTable.addCell(reportContent);
        reportTable.setMarginBottom(40);
        document.add(reportTable);

        // Signature Section
        Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
        
        Cell dateCell = new Cell().add(new Paragraph("Datum: ____________________\n(Ausstellungsdatum)"))
                .setBorder(Border.NO_BORDER)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.LEFT);
        
        Cell signCell = new Cell().add(new Paragraph("__________________________\nUnterschrift des Arztes / Stempel"))
                .setBorder(Border.NO_BORDER)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.RIGHT);
        
        signatureTable.addCell(dateCell);
        signatureTable.addCell(signCell);
        
        document.add(signatureTable);
        
        // Footer
        document.add(new Paragraph("Dieses Dokument wurde elektronisch erstellt und ist ohne manuelle Unterschrift gültig.")
                .setFontSize(8)
                .setFontColor(textGray)
                .setTextAlignment(TextAlignment.CENTER)
                .setFixedPosition(36, 20, 523));

        document.close();

        ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=patient_report_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    private void addInfoRow(Table table, String label, String value, DeviceRgb bgColor) {
        Cell labelCell = new Cell().add(new Paragraph(label).setBold())
                .setBorder(new SolidBorder(DeviceRgb.WHITE, 1))
                .setPadding(5);
        
        Cell valueCell = new Cell().add(new Paragraph(value))
                .setBorder(new SolidBorder(DeviceRgb.WHITE, 1))
                .setPadding(5);
        
        if (bgColor != null) {
            labelCell.setBackgroundColor(bgColor);
            valueCell.setBackgroundColor(bgColor);
        }
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

}