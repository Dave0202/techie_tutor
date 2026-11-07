package com.virtualteaching.repository;

import com.virtualteaching.model.Session;
import com.virtualteaching.model.SessionStatus;
import com.virtualteaching.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    boolean existsByStudent_IdOrTutor_Id(Long studentId, Long tutorId);
    List<Session> findByStudentOrderByScheduledTimeDesc(User student);
    List<Session> findByTutorOrderByScheduledTimeDesc(User tutor);
    List<Session> findByTutorAndStatusOrderByScheduledTimeDesc(User tutor, SessionStatus status);
    List<Session> findByStudentAndStatusOrderByScheduledTimeDesc(User student, SessionStatus status);
    List<Session> findByScheduledTimeAfter(LocalDateTime dateTime);
}
