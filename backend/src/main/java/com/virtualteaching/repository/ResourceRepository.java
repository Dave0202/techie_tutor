package com.virtualteaching.repository;

import com.virtualteaching.model.Resource;
import com.virtualteaching.model.User;
import com.virtualteaching.model.AccountStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    boolean existsByTutorId(Long tutorId);
    @EntityGraph(attributePaths = "tutor")
    List<Resource> findByTutorOrderByCreatedAtDesc(User tutor);
    @Query("""
            select r from Resource r
            join fetch r.tutor t
            where t.accountStatus = :accountStatus or t.accountStatus is null
            order by r.createdAt desc
            """)
    List<Resource> findVisibleResources(@Param("accountStatus") AccountStatus accountStatus);
}
