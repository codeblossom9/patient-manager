package com.code.patientsystem.controller;

import com.code.patientsystem.model.Patient;
import com.code.patientsystem.repository.PatientRepository;
import com.code.patientsystem.service.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PatientController.class)
class PatientsystemApplicationTests {


    @Autowired
    private MockMvc mockMvc;


    @Autowired
    private ObjectMapper objectMapper;


    @MockBean
    private PatientService patientService;


    @MockBean
    private PatientRepository patientRepository;


    @Test
    void shouldAddNewPatient() throws Exception {

        Patient patient = new Patient();
        patient.setName("John");
        patient.setAddress("Berlin");
        patient.setIllness("Flu");

        when(patientService.savePatientInfo(any(Patient.class)))
                .thenReturn(patient);

        mockMvc.perform(post("/patient/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patient)))
                .andExpect(status().isOk())
                .andExpect(content()
                        .string("new patient is added"));

        verify(patientService, times(1))
                .savePatientInfo(any(Patient.class));
    }


    @Test
    void shouldReturnAllPatients() throws Exception {

        Patient patient = new Patient();
        patient.setId(1);
        patient.setName("Anna");


        when(patientService.getAllPatients())
                .thenReturn(Arrays.asList(patient));


        mockMvc.perform(get("/patient/getAll"))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name")
                        .value("Anna"));
    }


    @Test
    void shouldDeletePatient() throws Exception {


        doNothing()
                .when(patientService)
                .deletePatientById(1);


        mockMvc.perform(delete("/patient/delete/1"))

                .andExpect(status().isOk())
                .andExpect((ResultMatcher) content()
                        .string("Patient deleted"));


        verify(patientService)
                .deletePatientById(1);
    }


    @Test
    void shouldFindPatientById() throws Exception {


        Patient patient = new Patient();
        patient.setId(1);
        patient.setName("Mark");


        when(patientRepository.findById(1))
                .thenReturn(Optional.of(patient));


        mockMvc.perform(get("/patient/1"))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Mark"));
    }


    @ParameterizedTest
    @CsvSource({
            "John, Berlin, Erkältung",
            "Anna, München, Kopfschmerzen",
            "Peter, Hamburg, Covid"
    })
    void shouldAddMultiplePatients(String name,
                                   String address,
                                   String illness) throws Exception {

        Patient patient = new Patient();
        patient.setName(name);
        patient.setAddress(address);
        patient.setIllness(illness);

        when(patientService.savePatientInfo(any(Patient.class)))
                .thenReturn(patient);

        mockMvc.perform(post("/patient/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patient)))
                .andExpect(status().isOk());

        verify(patientService, times(1))
                .savePatientInfo(any(Patient.class));
    }

    @ParameterizedTest
    @MethodSource("patientProvider")
    void shouldAddMultiplePatientsUsingMethod(String name,
                                   String address,
                                   String illness) throws Exception {

        Patient patient = new Patient();
        patient.setName(name);
        patient.setAddress(address);
        patient.setIllness(illness);

        doNothing()
                .when(patientService)
                .savePatientInfo(any(Patient.class));

        mockMvc.perform(post("/patient/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patient)))
                .andExpect(status().isOk())
                .andExpect(content().string("new patient is added"));

        verify(patientService, times(1))
                .savePatientInfo(any(Patient.class));
    }


    @ParameterizedTest
    @CsvSource({
            "John",
            "Anna",
            "Peter"
    })
    void shouldSearchPatientByName(String name)
            throws Exception {


        Patient patient = new Patient();
        patient.setName(name);


        when(patientService.findByName(name))
                .thenReturn(Arrays.asList(patient));


        mockMvc.perform(get("/patient/related-data/" + name))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name")
                        .value(name));
    }


    @Test
    void shouldReturnEmptyWhenPatientDoesNotExist() throws Exception {

        when(patientRepository.findById(99))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/patient/99"))
                .andExpect(status().isOk())
                .andExpect(content().string("null"));
    }

    static Stream<Arguments> patientProvider() {
        return Stream.of(
                arguments("John", "Berlin", "Erkältung"),
                arguments("Anna", "München", "Kopfschmerzen"),
                arguments("Peter", "Hamburg", "Covid")
        );
    }

}
