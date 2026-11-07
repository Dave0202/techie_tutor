package com.virtualteaching.config;

import com.virtualteaching.model.Resource;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.Session;
import com.virtualteaching.model.SessionStatus;
import com.virtualteaching.model.TutorProfile;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.ResourceRepository;
import com.virtualteaching.repository.SessionRepository;
import com.virtualteaching.repository.TutorProfileRepository;
import com.virtualteaching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final ResourceRepository resourceRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-admin.email:admin@virtualteaching.com}")
    private String adminEmail;

    @Value("${app.demo-admin.password:AdminPass123!}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            seedDemoLearningData();
        }

        ensureDemoAdmin();
    }

    private void seedDemoLearningData() {
        User tutor1 = createUser("Amelia Hart", "amelia@virtualteaching.com", Role.TUTOR, "password123");
        User tutor2 = createUser("Marcus Lee", "marcus@virtualteaching.com", Role.TUTOR, "password123");
        User tutor3 = createUser("Priya Nair", "priya@virtualteaching.com", Role.TUTOR, "password123");
        User tutor4 = createUser("Ethan Brooks", "ethan@virtualteaching.com", Role.TUTOR, "password123");

        User student1 = createUser("Daniel Brooks", "daniel@virtualteaching.com", Role.STUDENT, "password123");
        User student2 = createUser("Olivia Smith", "olivia@virtualteaching.com", Role.STUDENT, "password123");

        setTutorProfile(tutor1, "Expert in algebra, calculus, and exam preparation. Helping students build confidence in mathematics.", "Mathematics, Calculus, Statistics", 28.0);
        setTutorProfile(tutor2, "Physics mentor focused on conceptual understanding and problem-solving for high school and university learners.", "Physics, Mechanics, Thermodynamics", 32.5);
        setTutorProfile(tutor3, "Computer science tutor helping students master programming, algorithms, and software design.", "Computer Science, Java, Python, Algorithms", 35.0);
        setTutorProfile(tutor4, "English literature and writing tutor for essays, reading comprehension, and academic communication.", "English, Literature, Writing", 26.0);

        sessionRepository.save(Session.builder().student(student1).tutor(tutor1).scheduledTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0)).status(SessionStatus.PENDING).build());
        sessionRepository.save(Session.builder().student(student2).tutor(tutor2).scheduledTime(LocalDateTime.now().plusDays(3).withHour(15).withMinute(30)).status(SessionStatus.CONFIRMED).build());
        sessionRepository.save(Session.builder().student(student1).tutor(tutor3).scheduledTime(LocalDateTime.now().minusDays(4)).status(SessionStatus.COMPLETED).build());
        sessionRepository.save(Session.builder().student(student2).tutor(tutor4).scheduledTime(LocalDateTime.now().minusDays(10)).status(SessionStatus.CANCELLED).build());

        resourceRepository.save(Resource.builder().tutor(tutor1).title("Algebra Revision Pack").description("Flashcards, worksheets, and problem sets for algebra practice.").fileUrl("https://example.com/algebra-pack.pdf").createdAt(LocalDateTime.now().minusDays(2)).build());
        resourceRepository.save(Resource.builder().tutor(tutor2).title("Motion and Forces Notes").description("A concise guide to kinematics, acceleration, and Newton's laws.").fileUrl("https://example.com/physics-notes.pdf").createdAt(LocalDateTime.now().minusDays(5)).build());
        resourceRepository.save(Resource.builder().tutor(tutor3).title("Java Fundamentals Practice").description("Hands-on exercises covering classes, objects, loops, and collections.").fileUrl("https://example.com/java-fundamentals.pdf").createdAt(LocalDateTime.now().minusDays(7)).build());
        resourceRepository.save(Resource.builder().tutor(tutor4).title("Essay Writing Framework").description("Template and checklist for strong, structured academic essays.").fileUrl("https://example.com/essay-framework.pdf").createdAt(LocalDateTime.now().minusDays(9)).build());
    }

    private void ensureDemoAdmin() {
        String normalizedEmail = adminEmail.trim().toLowerCase(java.util.Locale.ROOT);
        User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (existingUser != null) {
            if (existingUser.getRole() != Role.ADMIN) {
                throw new IllegalStateException("DEMO_ADMIN_EMAIL is already assigned to a non-admin user");
            }
            return;
        }

        userRepository.save(User.builder()
                .name("VirtualTeach Administrator")
                .email(normalizedEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build());
    }

    private User createUser(String name, String email, Role role, String password) {
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        return userRepository.save(user);
    }

    private void setTutorProfile(User tutor, String bio, String subjects, Double hourlyRate) {
        TutorProfile profile = TutorProfile.builder()
                .user(tutor)
                .bio(bio)
                .subjects(subjects)
                .hourlyRate(hourlyRate)
                .build();
        tutorProfileRepository.save(profile);
        tutor.setTutorProfile(profile);
        userRepository.save(tutor);
    }
}
