package com.virtualteaching.dto;

import com.virtualteaching.model.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MessageContactResponse {
    private Long id;
    private String name;
    private String profilePictureUrl;
    private Role role;
}
