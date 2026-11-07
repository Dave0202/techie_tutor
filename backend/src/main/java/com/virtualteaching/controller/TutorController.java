package com.virtualteaching.controller;

import com.virtualteaching.dto.TutorProfileRequest;
import com.virtualteaching.dto.TutorResponse;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import com.virtualteaching.service.TutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TutorResponse>> getTutors(@RequestParam(required = false) String subject) {
        return ResponseEntity.ok(tutorService.getAllTutors(subject));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorResponse> getTutor(@PathVariable Long id) {
        return ResponseEntity.ok(tutorService.getTutorById(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<TutorResponse> updateTutorProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TutorProfileRequest request) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(tutorService.updateProfile(currentUser, request));
    }
}
