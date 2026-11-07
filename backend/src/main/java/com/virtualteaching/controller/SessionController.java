package com.virtualteaching.controller;

import com.virtualteaching.dto.BookingRequest;
import com.virtualteaching.dto.SessionResponse;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.SessionStatus;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import com.virtualteaching.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserRepository userRepository;

    @PostMapping("/book")
    public ResponseEntity<SessionResponse> bookSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.bookSession(student, request));
    }

    @GetMapping("/my-sessions")
    public ResponseEntity<List<SessionResponse>> getMySessions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(sessionService.getMySessions(user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SessionResponse> updateSessionStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam SessionStatus status) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(sessionService.updateStatus(currentUser, id, status));
    }
}
