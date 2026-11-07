package com.virtualteaching.service;

import com.virtualteaching.dto.BookingRequest;
import com.virtualteaching.dto.SessionResponse;
import com.virtualteaching.exception.ApiException;
import com.virtualteaching.exception.ForbiddenException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.Session;
import com.virtualteaching.model.SessionStatus;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.SessionRepository;
import com.virtualteaching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionResponse bookSession(User student, BookingRequest request) {
        if (student.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can book tutoring sessions");
        }

        User tutor = userRepository.findById(request.getTutorId())
                .orElseThrow(() -> new NotFoundException("Tutor not found"));
        if (tutor.getRole() != Role.TUTOR) {
            throw new ApiException("Selected user is not a tutor");
        }
        if (request.getScheduledTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Booking time must be in the future");
        }
        Integer durationMinutes = request.getDurationMinutes() == null ? 60 : request.getDurationMinutes();
        if (!Set.of(30, 60, 90).contains(durationMinutes)) {
            throw new ApiException("Session duration must be 30, 60, or 90 minutes");
        }

        Session session = Session.builder()
                .student(student)
                .tutor(tutor)
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(durationMinutes)
                .subject(request.getSubject() == null || request.getSubject().isBlank()
                        ? "General tutoring"
                        : request.getSubject().trim())
                .status(SessionStatus.PENDING)
                .build();

        Session saved = sessionRepository.save(session);
        return map(saved);
    }

    public List<SessionResponse> getMySessions(User user) {
        List<Session> sessions = new ArrayList<>();
        if (user.getRole() == Role.ADMIN) {
            sessions.addAll(sessionRepository.findAll());
        } else if (user.getRole() == Role.STUDENT) {
            sessions.addAll(sessionRepository.findByStudentOrderByScheduledTimeDesc(user));
        } else {
            sessions.addAll(sessionRepository.findByTutorOrderByScheduledTimeDesc(user));
        }

        return sessions.stream().map(this::map).toList();
    }

    public SessionResponse updateStatus(User currentUser, Long sessionId, SessionStatus status) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        if (currentUser.getRole() != Role.ADMIN
                && !currentUser.getId().equals(session.getTutor().getId())
                && !currentUser.getId().equals(session.getStudent().getId())) {
            throw new ForbiddenException("You are not allowed to update this session");
        }

        if (currentUser.getRole() != Role.ADMIN
                && currentUser.getRole() == Role.STUDENT
                && !currentUser.getId().equals(session.getStudent().getId())) {
            throw new ForbiddenException("Students can only update their own sessions");
        }

        if (currentUser.getRole() != Role.ADMIN
                && currentUser.getRole() == Role.TUTOR
                && !currentUser.getId().equals(session.getTutor().getId())) {
            throw new ForbiddenException("Tutors can only update their own sessions");
        }

        session.setStatus(status);
        return map(sessionRepository.save(session));
    }

    private SessionResponse map(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .studentId(session.getStudent().getId())
                .studentName(session.getStudent().getName())
                .tutorId(session.getTutor().getId())
                .tutorName(session.getTutor().getName())
                .scheduledTime(session.getScheduledTime())
                .durationMinutes(session.getDurationMinutes() == null ? 60 : session.getDurationMinutes())
                .subject(session.getSubject() == null || session.getSubject().isBlank()
                        ? "General tutoring"
                        : session.getSubject())
                .status(session.getStatus())
                .build();
    }
}
