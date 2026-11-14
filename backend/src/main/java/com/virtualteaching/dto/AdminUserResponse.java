package com.virtualteaching.dto;

import com.virtualteaching.model.Role;
import com.virtualteaching.model.AccountStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String profilePictureUrl;
    private Role role;
    private boolean tutorConfirmed;
    private AccountStatus accountStatus;
    private String bio;
    private String subjects;
    private Double hourlyRate;
}
