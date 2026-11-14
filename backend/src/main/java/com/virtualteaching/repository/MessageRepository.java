package com.virtualteaching.repository;

import com.virtualteaching.model.Message;
import com.virtualteaching.model.ModerationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @EntityGraph(attributePaths = {"sender", "recipient", "reviewedBy"})
    @Query("""
            select message from Message message
            where (message.sender.id = :userId and message.recipient.id = :otherUserId)
               or (message.sender.id = :otherUserId and message.recipient.id = :userId)
            order by message.createdAt desc
            """)
    List<Message> findConversation(
            @Param("userId") Long userId,
            @Param("otherUserId") Long otherUserId,
            Pageable pageable);

    @EntityGraph(attributePaths = {"sender", "recipient", "reviewedBy"})
    List<Message> findByModerationStatusOrderByCreatedAtAsc(ModerationStatus status, Pageable pageable);
}
