package com.virtualteaching.controller;

import com.virtualteaching.dto.MessageContactResponse;
import com.virtualteaching.dto.MessageRequest;
import com.virtualteaching.dto.MessageResponse;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import com.virtualteaching.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/contacts")
    public ResponseEntity<List<MessageContactResponse>> getContacts(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.ok(messageService.getContacts(currentUser));
    }

    @GetMapping("/{otherUserId}")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long otherUserId) {
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.ok(messageService.getConversation(currentUser, otherUserId));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MessageRequest request) {
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(currentUser, request));
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
