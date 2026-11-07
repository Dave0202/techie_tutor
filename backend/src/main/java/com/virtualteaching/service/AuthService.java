package com.virtualteaching.service;

import com.virtualteaching.dto.LoginRequest;
import com.virtualteaching.dto.LoginResponse;
import com.virtualteaching.dto.RegisterRequest;
import com.virtualteaching.exception.ConflictException;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.TutorProfile;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import com.virtualteaching.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Email already registered");
        }

        Role role = parseRole(request.getRole());
        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        if (role == Role.TUTOR) {
            TutorProfile profile = TutorProfile.builder()
                    .user(savedUser)
                    .bio("New tutor profile ready for updates.")
                    .subjects("General")
                    .hourlyRate(20.0)
                    .build();
            savedUser.setTutorProfile(profile);
            userRepository.save(savedUser);
        }

        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                savedUser.getEmail(),
                savedUser.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + savedUser.getRole().name()))
        ));
        return LoginResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .profilePictureUrl(savedUser.getProfilePictureUrl())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ConflictException("User not found"));

        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        ));

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    private Role parseRole(String roleText) {
        if (roleText == null) {
            throw new ConflictException("Role is required");
        }
        String normalized = roleText.trim().toUpperCase();
        if (normalized.equals("STUDENT") || normalized.equals("TUTOR")) {
            return Role.valueOf(normalized);
        }
        throw new ConflictException("Role must be either STUDENT or TUTOR");
    }
}
