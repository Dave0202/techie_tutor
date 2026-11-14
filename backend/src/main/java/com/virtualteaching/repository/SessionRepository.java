package com.virtualteaching.repository;

import com.virtualteaching.model.Session;
import com.virtualteaching.model.SessionStatus;
import com.virtualteaching.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    boolean existsByStudent_IdOrTutor_Id(Long studentId, Long tutorId);
    @EntityGraph(attributePaths = {"student", "tutor"})
    List<Session> findByStudentOrderByScheduledTimeDesc(User student);
    @EntityGraph(attributePaths = {"student", "tutor"})
    List<Session> findByTutorOrderByScheduledTimeDesc(User tutor);
    @EntityGraph(attributePaths = {"student", "tutor"})
    List<Session> findByTutorAndStatusOrderByScheduledTimeDesc(User tutor, SessionStatus status);
    @EntityGraph(attributePaths = {"student", "tutor"})
    List<Session> findByStudentAndStatusOrderByScheduledTimeDesc(User student, SessionStatus status);
    List<Session> findByScheduledTimeAfter(LocalDateTime dateTime);

    @Query("select s from Session s join fetch s.student join fetch s.tutor order by s.scheduledTime desc")
    List<Session> findAllWithParticipants();
}
