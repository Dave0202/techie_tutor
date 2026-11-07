package com.virtualteaching.dto;

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
public class TutorResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String profilePictureUrl;
    private String bio;
    private String subjects;
    private Double hourlyRate;
}
