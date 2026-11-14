package com.virtualteaching.dto;

import com.virtualteaching.model.AccountStatus;
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
public class LoginResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
    private String profilePictureUrl;
    private boolean tutorConfirmed;
    private AccountStatus accountStatus;
}
