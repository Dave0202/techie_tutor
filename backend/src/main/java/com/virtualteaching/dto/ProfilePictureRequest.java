package com.virtualteaching.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProfilePictureRequest {

    @NotBlank(message = "Profile picture URL is required")
    @Size(max = 2048, message = "Profile picture URL is too long")
    private String profilePictureUrl;
}
