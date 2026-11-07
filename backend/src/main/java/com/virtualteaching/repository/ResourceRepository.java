package com.virtualteaching.repository;

import com.virtualteaching.model.Resource;
import com.virtualteaching.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    boolean existsByTutorId(Long tutorId);
    List<Resource> findByTutorOrderByCreatedAtDesc(User tutor);
    List<Resource> findAllByOrderByCreatedAtDesc();
}
