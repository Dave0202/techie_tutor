package com.virtualteaching.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Tutor ID is required")
    private Long tutorId;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;

    @Min(value = 30, message = "Session duration must be at least 30 minutes")
    @Max(value = 90, message = "Session duration cannot exceed 90 minutes")
    private Integer durationMinutes;

    @Size(max = 160, message = "Subject cannot exceed 160 characters")
    private String subject;
}
