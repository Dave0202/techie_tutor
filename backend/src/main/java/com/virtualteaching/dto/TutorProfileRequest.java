package com.virtualteaching.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorProfileRequest {

    @NotBlank(message = "Bio is required")
    private String bio;

    @NotBlank(message = "Subjects are required")
    private String subjects;

    @NotNull(message = "Hourly rate is required")
    private Double hourlyRate;
}
