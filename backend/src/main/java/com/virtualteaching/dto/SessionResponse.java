package com.virtualteaching.dto;

import com.virtualteaching.model.SessionStatus;
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
public class SessionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long tutorId;
    private String tutorName;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String subject;
    private SessionStatus status;
}
