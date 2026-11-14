package com.virtualteaching.service;

import com.virtualteaching.dto.AdminCreateUserRequest;
import com.virtualteaching.dto.AdminUpdateUserRequest;
import com.virtualteaching.dto.AdminUserResponse;
import com.virtualteaching.exception.ConflictException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.AccountStatus;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.TutorProfile;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    @Cacheable("adminUserDirectory")
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAllByOrderByRoleAscNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
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
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
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
        if (updatedRole != Role.TUTOR) {
            user.setTutorConfirmed(false);
        }
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
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
    public AdminUserResponse confirmTutor(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getRole() != Role.TUTOR) {
            throw new ConflictException("Only tutor accounts can be confirmed");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ConflictException("Only active tutor accounts can be confirmed");
        }
        user.setTutorConfirmed(true);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
    public AdminUserResponse suspendUser(Long id, String currentAdminEmail) {
        User user = getUser(id);
        ensureNotSelf(user, currentAdminEmail);
        ensureNotLastActiveAdmin(user);
        if (user.getAccountStatus() == AccountStatus.TERMINATED
                || user.getAccountStatus() == AccountStatus.DELETED) {
            throw new ConflictException("Terminated or deleted accounts cannot be suspended");
        }
        user.setAccountStatus(AccountStatus.SUSPENDED);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
    public AdminUserResponse restoreUser(Long id) {
        User user = getUser(id);
        if (user.getAccountStatus() != AccountStatus.SUSPENDED) {
            throw new ConflictException("Only suspended accounts can be restored");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
    public AdminUserResponse terminateUser(Long id, String currentAdminEmail) {
        User user = getUser(id);
        ensureNotSelf(user, currentAdminEmail);
        ensureNotLastActiveAdmin(user);
        if (user.getAccountStatus() == AccountStatus.DELETED) {
            throw new ConflictException("Deleted accounts cannot be terminated");
        }
        user.setAccountStatus(AccountStatus.TERMINATED);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    @CacheEvict(value = {"adminUserDirectory", "publicTutors", "publicResources"}, allEntries = true)
    public void deleteUser(Long id, String currentAdminEmail) {
        User user = getUser(id);
        ensureNotSelf(user, currentAdminEmail);
        ensureNotLastActiveAdmin(user);
        if (user.getAccountStatus() == AccountStatus.DELETED) {
            throw new ConflictException("Account has already been deleted");
        }

        user.setName("Deleted account");
        user.setEmail("deleted+" + user.getId() + "@deleted.invalid");
        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
        user.setProfilePictureUrl(null);
        user.setTutorConfirmed(false);
        user.setTutorProfile(null);
        user.setAccountStatus(AccountStatus.DELETED);
        userRepository.save(user);
    }

    private void protectLastAdmin(User user, Role updatedRole) {
        if (user.getRole() == Role.ADMIN && user.getAccountStatus() == AccountStatus.ACTIVE
                && updatedRole != Role.ADMIN) {
            ensureNotLastActiveAdmin(user);
        }
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private void ensureNotSelf(User user, String currentAdminEmail) {
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new ConflictException("You cannot change your own administrator account");
        }
    }

    private void ensureNotLastActiveAdmin(User user) {
        if (user.getRole() == Role.ADMIN && user.getAccountStatus() == AccountStatus.ACTIVE
                && userRepository.countActiveByRole(Role.ADMIN, AccountStatus.ACTIVE) <= 1) {
            throw new ConflictException("The last active administrator cannot be suspended, terminated, or deleted");
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
                .tutorConfirmed(user.isTutorConfirmed())
                .accountStatus(user.getAccountStatus())
                .bio(profile == null ? null : profile.getBio())
                .subjects(profile == null ? null : profile.getSubjects())
                .hourlyRate(profile == null ? null : profile.getHourlyRate())
                .build();
    }
}
