package com.virtualteaching;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualteaching.dto.BookingRequest;
import com.virtualteaching.dto.LoginRequest;
import com.virtualteaching.dto.ProfilePictureRequest;
import com.virtualteaching.dto.RegisterRequest;
import com.virtualteaching.dto.ResourceRequest;
import com.virtualteaching.dto.TutorProfileRequest;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.ResourceRepository;
import com.virtualteaching.repository.SessionRepository;
import com.virtualteaching.repository.TutorProfileRepository;
import com.virtualteaching.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.containsString;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VirtualTeachingApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @BeforeEach
    void setUp() {
        resourceRepository.deleteAll();
        sessionRepository.deleteAll();
        tutorProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registrationPreflightShouldAllowConfiguredViteOriginsOnly() throws Exception {
        for (String origin : List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
                "http://localhost:4174",
                "http://127.0.0.1:4174")) {
            mockMvc.perform(options("/api/auth/register")
                            .header("Origin", origin)
                            .header("Access-Control-Request-Method", "POST")
                            .header("Access-Control-Request-Headers", "authorization,content-type"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin))
                    .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        }

        mockMvc.perform(options("/api/sessions/1/status")
                        .header("Origin", "http://127.0.0.1:4174")
                        .header("Access-Control-Request-Method", "PATCH")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:4174"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(header().string("Access-Control-Allow-Methods", containsString("PATCH")));

        mockMvc.perform(options("/api/auth/register")
                        .header("Origin", "https://untrusted.example")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isForbidden());
    }

    @Test
    void registerLoginAndTutorSearchShouldWork() throws Exception {
        RegisterRequest tutorRequest = RegisterRequest.builder()
                .name("Tutor Alpha")
                .email("alpha@example.com")
                .password("password123")
                .role("TUTOR")
                .build();

        String tutorRegisterJson = objectMapper.writeValueAsString(tutorRequest);
        String tutorRegisterResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(tutorRegisterJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String tutorToken = objectMapper.readTree(tutorRegisterResponse).get("token").asText();
        Long tutorId = objectMapper.readTree(tutorRegisterResponse).get("id").asLong();

        mockMvc.perform(get("/api/tutors")
                        .param("subject", "General"))
                .andExpect(status().isOk());

        TutorProfileRequest profileRequest = TutorProfileRequest.builder()
                .bio("I teach mathematics and statistics")
                .subjects("Mathematics, Calculus")
                .hourlyRate(30.0)
                .build();

        mockMvc.perform(put("/api/tutors/profile")
                        .header("Authorization", "Bearer " + tutorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileRequest)))
                .andExpect(status().isOk());

        RegisterRequest studentRequest = RegisterRequest.builder()
                .name("Student Beta")
                .email("beta@example.com")
                .password("password123")
                .role("STUDENT")
                .build();

        String studentRegisterJson = objectMapper.writeValueAsString(studentRequest);
        String studentToken = objectMapper.readTree(
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(studentRegisterJson))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString())
                .get("token").asText();

        BookingRequest bookingRequest = BookingRequest.builder()
                .tutorId(tutorId)
                .scheduledTime(java.time.LocalDateTime.now().plusDays(2))
                .durationMinutes(60)
                .subject("Mathematics")
                .build();

        String bookingJson = objectMapper.writeValueAsString(bookingRequest);
        String createdSessionResponse = mockMvc.perform(post("/api/sessions/book")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode sessionNode = objectMapper.readTree(createdSessionResponse);
        Long sessionId = sessionNode.get("id").asLong();
        org.junit.jupiter.api.Assertions.assertEquals(60, sessionNode.get("durationMinutes").asInt());
        org.junit.jupiter.api.Assertions.assertEquals("Mathematics", sessionNode.get("subject").asText());

        BookingRequest legacyBookingRequest = BookingRequest.builder()
                .tutorId(tutorId)
                .scheduledTime(java.time.LocalDateTime.now().plusDays(3))
                .build();

        mockMvc.perform(post("/api/sessions/book")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(legacyBookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.durationMinutes").value(60))
                .andExpect(jsonPath("$.subject").value("General tutoring"));

        BookingRequest invalidDurationRequest = BookingRequest.builder()
                .tutorId(tutorId)
                .scheduledTime(java.time.LocalDateTime.now().plusDays(4))
                .durationMinutes(45)
                .subject("Mathematics")
                .build();

        mockMvc.perform(post("/api/sessions/book")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDurationRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Session duration must be 30, 60, or 90 minutes"));

        mockMvc.perform(patch("/api/sessions/{id}/status", sessionId)
                        .header("Authorization", "Bearer " + tutorToken)
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        ResourceRequest resourceRequest = ResourceRequest.builder()
                .title("Calculus Notes")
                .description("Helpful overview of derivatives")
                .fileUrl("https://example.com/calculus-notes.pdf")
                .build();

        mockMvc.perform(post("/api/resources/upload")
                        .header("Authorization", "Bearer " + tutorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resourceRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Calculus Notes"));

        LoginRequest loginRequest = LoginRequest.builder()
                .email("alpha@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alpha@example.com"));
    }

    @Test
    void authenticatedUsersCanSaveOnlyConfiguredCloudinaryProfilePictureUrls() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Picture Student")
                .email("picture-student@example.com")
                .password("password123")
                .role("STUDENT")
                .build();
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String token = objectMapper.readTree(response).get("token").asText();

        ProfilePictureRequest validRequest = new ProfilePictureRequest();
        validRequest.setProfilePictureUrl(
                "https://res.cloudinary.com/mrnfxyxs/image/upload/v1234567890/profile/picture.jpg");
        mockMvc.perform(put("/api/users/me/profile-picture")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profilePictureUrl")
                        .value(validRequest.getProfilePictureUrl()));

        org.junit.jupiter.api.Assertions.assertEquals(
                validRequest.getProfilePictureUrl(),
                userRepository.findByEmail("picture-student@example.com").orElseThrow().getProfilePictureUrl());

        ProfilePictureRequest invalidRequest = new ProfilePictureRequest();
        invalidRequest.setProfilePictureUrl("https://example.com/profile.jpg");
        mockMvc.perform(put("/api/users/me/profile-picture")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Profile picture must be an HTTPS image from the configured Cloudinary account"));
    }
}
