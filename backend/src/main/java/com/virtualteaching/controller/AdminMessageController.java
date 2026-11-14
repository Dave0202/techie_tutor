package com.virtualteaching.controller;

import com.virtualteaching.dto.MessageResponse;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import com.virtualteaching.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/messages")
@RequiredArgsConstructor
public class AdminMessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/flagged")
    public ResponseEntity<List<MessageResponse>> getFlaggedMessages() {
        return ResponseEntity.ok(messageService.getFlaggedMessages());
    }

    @PostMapping("/{messageId}/review")
    public ResponseEntity<MessageResponse> markReviewed(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {
        User reviewer = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(messageService.markReviewed(messageId, reviewer));
    }
}
