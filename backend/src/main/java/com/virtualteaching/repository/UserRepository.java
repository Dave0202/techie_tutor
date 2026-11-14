package com.virtualteaching.repository;

import com.virtualteaching.model.User;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.AccountStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    long countByRole(Role role);
    @Query("""
            select count(u) from User u
            where u.role = :role
              and (u.accountStatus = :accountStatus or u.accountStatus is null)
            """)
    long countActiveByRole(@Param("role") Role role, @Param("accountStatus") AccountStatus accountStatus);
    @EntityGraph(attributePaths = "tutorProfile")
    List<User> findAllByOrderByRoleAscNameAsc();
    @Query("""
            select u from User u left join fetch u.tutorProfile
            where u.role = :role and u.tutorConfirmed = true
              and (u.accountStatus = :accountStatus or u.accountStatus is null)
            order by u.name asc
            """)
    List<User> findPublicTutors(
            @Param("role") Role role, @Param("accountStatus") AccountStatus accountStatus);
    @Query("""
            select u from User u
            where u.accountStatus = :accountStatus or u.accountStatus is null
            order by u.name asc
            """)
    List<User> findActiveUsers(@Param("accountStatus") AccountStatus accountStatus);
    @EntityGraph(attributePaths = "tutorProfile")
    Optional<User> findByIdAndRoleAndAccountStatusAndTutorConfirmed(
            Long id, Role role, AccountStatus accountStatus, boolean tutorConfirmed);
}
