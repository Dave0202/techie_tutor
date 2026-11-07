package com.virtualteaching.service;

import com.virtualteaching.dto.TutorProfileRequest;
import com.virtualteaching.dto.TutorResponse;
import com.virtualteaching.exception.ForbiddenException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.TutorProfile;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.TutorProfileRepository;
import com.virtualteaching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;

    public List<TutorResponse> getAllTutors(String subject) {
        List<User> tutors = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.TUTOR)
                .toList();

        List<TutorResponse> responses = new ArrayList<>();
        for (User tutor : tutors) {
            TutorProfile profile = tutor.getTutorProfile();
            if (profile == null) {
                continue;
            }
            if (subject == null || subject.isBlank()) {
                responses.add(mapTutor(tutor, profile));
            } else if (profile.getSubjects() != null && profile.getSubjects().toLowerCase().contains(subject.toLowerCase())) {
                responses.add(mapTutor(tutor, profile));
            }
        }
        return responses;
    }

    public TutorResponse getTutorById(Long id) {
        User tutor = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tutor not found"));
        if (tutor.getRole() != Role.TUTOR) {
            throw new NotFoundException("Tutor not found");
        }
        TutorProfile profile = tutor.getTutorProfile();
        if (profile == null) {
            throw new NotFoundException("Tutor profile not found");
        }
        return mapTutor(tutor, profile);
    }

    public TutorResponse updateProfile(User currentUser, TutorProfileRequest request) {
        if (currentUser.getRole() != Role.TUTOR) {
            throw new ForbiddenException("Students cannot update tutor profiles");
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
