package com.virtualteaching.controller;

import com.virtualteaching.dto.ResourceRequest;
import com.virtualteaching.dto.ResourceResponse;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import com.virtualteaching.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<ResourceResponse> uploadResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResourceRequest request) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.addResource(currentUser, request));
    }

    @PostMapping(value = "/upload-material", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResourceResponse> uploadMaterial(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String fileUrl,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) MultipartFile qrCode) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.addMaterial(currentUser, title, description, fileUrl, type, file, qrCode));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }
}
