package com.virtualteaching.service;

import com.virtualteaching.dto.AdminCreateUserRequest;
import com.virtualteaching.dto.AdminUpdateUserRequest;
import com.virtualteaching.dto.AdminUserResponse;
import com.virtualteaching.exception.ConflictException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.TutorProfile;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.ResourceRepository;
import com.virtualteaching.repository.SessionRepository;
import com.virtualteaching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final ResourceRepository resourceRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAllByOrderByRoleAscNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse createUser(AdminCreateUserRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered");
        }

        Role role = parseRole(request.getRole());
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);
        if (role == Role.TUTOR) {
            user.setTutorProfile(createTutorProfile(user, request.getBio(), request.getSubjects(), request.getHourlyRate()));
            userRepository.save(user);
        }
        return toResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new ConflictException("Email already registered");
        }

        Role updatedRole = parseRole(request.getRole());
        protectLastAdmin(user, updatedRole);

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setRole(updatedRole);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (updatedRole == Role.TUTOR) {
            TutorProfile profile = user.getTutorProfile();
            if (profile == null) {
                profile = createTutorProfile(user, request.getBio(), request.getSubjects(), request.getHourlyRate());
                user.setTutorProfile(profile);
            } else {
                profile.setBio(request.getBio());
                profile.setSubjects(request.getSubjects());
                profile.setHourlyRate(request.getHourlyRate() == null ? 20.0 : request.getHourlyRate());
            }
        } else if (user.getRole() != Role.TUTOR) {
            user.setTutorProfile(null);
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new ConflictException("You cannot delete your own administrator account");
        }
        protectLastAdmin(user, null);
        if (sessionRepository.existsByStudent_IdOrTutor_Id(id, id) || resourceRepository.existsByTutorId(id)) {
            throw new ConflictException("This account has sessions or resources; preserve its learning history before deletion");
        }
        userRepository.delete(user);
    }

    private void protectLastAdmin(User user, Role updatedRole) {
        if (user.getRole() == Role.ADMIN && updatedRole != Role.ADMIN
                && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ConflictException("The last administrator cannot be demoted or deleted");
        }
    }

    private Role parseRole(String roleText) {
        try {
            return Role.valueOf(roleText.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ConflictException("Role must be ADMIN, STUDENT, or TUTOR");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private TutorProfile createTutorProfile(User user, String bio, String subjects, Double hourlyRate) {
        return TutorProfile.builder()
                .user(user)
                .bio(bio == null || bio.isBlank() ? "New tutor profile ready for updates." : bio.trim())
                .subjects(subjects == null || subjects.isBlank() ? "General" : subjects.trim())
                .hourlyRate(hourlyRate == null ? 20.0 : hourlyRate)
                .build();
    }

    private AdminUserResponse toResponse(User user) {
        TutorProfile profile = user.getTutorProfile();
        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .bio(profile == null ? null : profile.getBio())
                .subjects(profile == null ? null : profile.getSubjects())
                .hourlyRate(profile == null ? null : profile.getHourlyRate())
                .build();
    }
}
