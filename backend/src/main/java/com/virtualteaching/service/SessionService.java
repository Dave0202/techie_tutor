package com.virtualteaching.service;

import com.virtualteaching.dto.BookingRequest;
import com.virtualteaching.dto.SessionResponse;
import com.virtualteaching.model.AccountStatus;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public SessionResponse bookSession(User student, BookingRequest request) {
        if (student.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can book tutoring sessions");
        }
        if (student.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ForbiddenException("Inactive accounts cannot book sessions");
        }

        User tutor = userRepository.findById(request.getTutorId())
                .orElseThrow(() -> new NotFoundException("Tutor not found"));
        if (tutor.getRole() != Role.TUTOR || tutor.getAccountStatus() != AccountStatus.ACTIVE
                || !tutor.isTutorConfirmed()) {
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

    @Transactional(readOnly = true)
    public List<SessionResponse> getMySessions(User user) {
        List<Session> sessions = user.getRole() == Role.ADMIN
                ? sessionRepository.findAllWithParticipants()
                : user.getRole() == Role.STUDENT
                    ? sessionRepository.findByStudentOrderByScheduledTimeDesc(user)
                    : sessionRepository.findByTutorOrderByScheduledTimeDesc(user);
        return sessions.stream().map(this::map).toList();
    }

    @Transactional
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

        if (currentUser.getRole() == Role.TUTOR && !currentUser.isTutorConfirmed()) {
            throw new ForbiddenException("Admin approval is required before tutors can manage sessions");
        }
        if (status == SessionStatus.IN_PROGRESS || status == SessionStatus.COMPLETED) {
            throw new ApiException("Use the class start and end controls to update class timing");
        }
        if (currentUser.getRole() == Role.STUDENT && status != SessionStatus.CANCELLED) {
            throw new ForbiddenException("Students can only cancel their own sessions");
        }
        if (currentUser.getRole() == Role.TUTOR && status != SessionStatus.CONFIRMED
                && status != SessionStatus.CANCELLED) {
            throw new ForbiddenException("Tutors can only accept or cancel their own sessions");
        }
        if (session.getStatus() == SessionStatus.IN_PROGRESS && status != SessionStatus.CANCELLED) {
            throw new ApiException("An active class can only be ended using the class controls");
        }

        session.setStatus(status);
        return map(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse startClass(User currentUser, Long sessionId) {
        Session session = getSession(sessionId);
        requireTutorForSession(currentUser, session);
        if (session.getStatus() != SessionStatus.CONFIRMED || session.getStartedAt() != null) {
            throw new ApiException("Only a confirmed session that has not started can be started");
        }
        session.setStartedAt(LocalDateTime.now());
        session.setStatus(SessionStatus.IN_PROGRESS);
        return map(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse endClass(User currentUser, Long sessionId) {
        Session session = getSession(sessionId);
        if (currentUser.getRole() != Role.ADMIN) {
            requireTutorForSession(currentUser, session);
        }
        if (session.getStatus() != SessionStatus.IN_PROGRESS || session.getStartedAt() == null) {
            throw new ApiException("Only an active class can be ended");
        }
        session.setEndedAt(LocalDateTime.now());
        session.setStatus(SessionStatus.COMPLETED);
        return map(sessionRepository.save(session));
    }

    private Session getSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
    }

    private void requireTutorForSession(User currentUser, Session session) {
        if (currentUser.getRole() != Role.TUTOR
                || !currentUser.getId().equals(session.getTutor().getId())) {
            throw new ForbiddenException("Only the assigned tutor can manage class timing");
        }
        if (currentUser.getAccountStatus() != AccountStatus.ACTIVE || !currentUser.isTutorConfirmed()) {
            throw new ForbiddenException("An active, admin-approved tutor account is required");
        }
    }

    private SessionResponse map(Session session) {
        Long actualDurationMinutes = session.getStartedAt() == null
                ? null
                : Duration.between(
                        session.getStartedAt(),
                        session.getEndedAt() == null ? LocalDateTime.now() : session.getEndedAt())
                .toMinutes();
        return SessionResponse.builder()
                .id(session.getId())
                .studentId(session.getStudent().getId())
                .studentName(session.getStudent().getName())
                .tutorId(session.getTutor().getId())
                .tutorName(session.getTutor().getName())
                .scheduledTime(session.getScheduledTime())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .actualDurationMinutes(actualDurationMinutes)
                .durationMinutes(session.getDurationMinutes() == null ? 60 : session.getDurationMinutes())
                .subject(session.getSubject() == null || session.getSubject().isBlank()
                        ? "General tutoring"
                        : session.getSubject())
                .status(session.getStatus())
                .build();
    }
}
