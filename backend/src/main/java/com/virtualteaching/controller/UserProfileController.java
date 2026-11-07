package com.virtualteaching.controller;

import com.virtualteaching.dto.ProfilePictureRequest;
import com.virtualteaching.dto.ProfilePictureResponse;
import com.virtualteaching.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PutMapping("/profile-picture")
    public ResponseEntity<ProfilePictureResponse> updateProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfilePictureRequest request) {
        return ResponseEntity.ok(userProfileService.updateProfilePicture(
                userDetails.getUsername(), request.getProfilePictureUrl()));
    }
}
