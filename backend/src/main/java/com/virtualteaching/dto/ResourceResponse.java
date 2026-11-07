package com.virtualteaching.dto;

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
public class ResourceResponse {
    private Long id;
    private Long tutorId;
    private String tutorName;
    private String title;
    private String description;
    private String fileUrl;
    private String qrCodeUrl;
    private String type;
    private LocalDateTime createdAt;
}
