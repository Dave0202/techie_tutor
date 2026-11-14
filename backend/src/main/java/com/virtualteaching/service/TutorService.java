package com.virtualteaching.service;

import com.virtualteaching.dto.TutorProfileRequest;
import com.virtualteaching.dto.TutorResponse;
import com.virtualteaching.exception.ForbiddenException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.AccountStatus;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.TutorProfile;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.TutorProfileRepository;
import com.virtualteaching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;

    @Transactional(readOnly = true)
    @Cacheable("publicTutors")
    public List<TutorResponse> getAllTutors(String subject) {
        List<User> tutors = userRepository.findPublicTutors(Role.TUTOR, AccountStatus.ACTIVE);

        List<TutorResponse> responses = new ArrayList<>();
        for (User tutor : tutors) {
            TutorProfile profile = tutor.getTutorProfile();
            if (profile == null) {
                continue;
            }
            if (subject == null || subject.isBlank()) {
                responses.add(mapTutor(tutor, profile));
            } else if (profile.getSubjects() != null
                    && profile.getSubjects().toLowerCase(java.util.Locale.ROOT)
                    .contains(subject.toLowerCase(java.util.Locale.ROOT))) {
                responses.add(mapTutor(tutor, profile));
            }
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public TutorResponse getTutorById(Long id) {
        User tutor = userRepository.findByIdAndRoleAndAccountStatusAndTutorConfirmed(
                        id, Role.TUTOR, AccountStatus.ACTIVE, true)
                .orElseThrow(() -> new NotFoundException("Tutor not found"));
        TutorProfile profile = tutor.getTutorProfile();
        if (profile == null) {
            throw new NotFoundException("Tutor profile not found");
        }
        return mapTutor(tutor, profile);
    }

    @CacheEvict(value = "publicTutors", allEntries = true)
    public TutorResponse updateProfile(User currentUser, TutorProfileRequest request) {
        if (currentUser.getRole() != Role.TUTOR) {
            throw new ForbiddenException("Students cannot update tutor profiles");
        }
        if (currentUser.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ForbiddenException("Inactive accounts cannot update tutor profiles");
        }

        TutorProfile profile = tutorProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    TutorProfile newProfile = new TutorProfile();
                    newProfile.setUser(currentUser);
                    return newProfile;
                });

        profile.setBio(request.getBio());
        profile.setSubjects(request.getSubjects());
        profile.setHourlyRate(request.getHourlyRate());
        tutorProfileRepository.save(profile);

        currentUser.setTutorProfile(profile);
        userRepository.save(currentUser);

        return mapTutor(currentUser, profile);
    }

    private TutorResponse mapTutor(User tutor, TutorProfile profile) {
        return TutorResponse.builder()
                .id(tutor.getId())
                .userId(tutor.getId())
                .name(tutor.getName())
                .email(tutor.getEmail())
                .profilePictureUrl(tutor.getProfilePictureUrl())
                .bio(profile.getBio())
                .subjects(profile.getSubjects())
                .hourlyRate(profile.getHourlyRate())
                .build();
    }
}
