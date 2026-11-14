package com.virtualteaching.service;

import com.virtualteaching.dto.MessageRequest;
import com.virtualteaching.dto.MessageContactResponse;
import com.virtualteaching.dto.MessageResponse;
import com.virtualteaching.exception.ConflictException;
import com.virtualteaching.exception.ForbiddenException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.AccountStatus;
import com.virtualteaching.model.Message;
import com.virtualteaching.model.ModerationStatus;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.MessageRepository;
import com.virtualteaching.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Arrays;

@Service
public class MessageService {

    private static final int CONVERSATION_LIMIT = 100;
    private static final int REVIEW_QUEUE_LIMIT = 200;

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final List<String> blockedWords;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            @Value("${app.moderation.blocked-words:}") String configuredBlockedWords) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.blockedWords = Arrays.stream(configuredBlockedWords.split(","))
                .map(this::normalize)
                .filter(word -> !word.isBlank())
                .distinct()
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageContactResponse> getContacts(User currentUser) {
        return userRepository.findActiveUsers(AccountStatus.ACTIVE).stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> MessageContactResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .role(user.getRole())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getConversation(User currentUser, Long otherUserId) {
        User otherUser = getActiveUser(otherUserId);
        if (currentUser.getId().equals(otherUser.getId())) {
            throw new ConflictException("You cannot start a conversation with yourself");
        }

        List<Message> messages = messageRepository.findConversation(
                currentUser.getId(), otherUserId, PageRequest.of(0, CONVERSATION_LIMIT));
        List<MessageResponse> responses = new ArrayList<>(messages.size());
        for (int index = messages.size() - 1; index >= 0; index--) {
            responses.add(toResponse(messages.get(index)));
        }
        return responses;
    }

    @Transactional
    public MessageResponse sendMessage(User sender, MessageRequest request) {
        if (sender.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ForbiddenException("Inactive accounts cannot send messages");
        }
        User recipient = getActiveUser(request.getRecipientId());
        if (sender.getId().equals(recipient.getId())) {
            throw new ConflictException("You cannot send a message to yourself");
        }

        List<String> matches = findBlockedWords(request.getContent());
        Message message = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(request.getContent().trim())
                .flagged(!matches.isEmpty())
                .matchedTerms(matches.isEmpty() ? null : String.join(", ", matches))
                .moderationStatus(matches.isEmpty()
                        ? ModerationStatus.NOT_REQUIRED
                        : ModerationStatus.PENDING_REVIEW)
                .createdAt(LocalDateTime.now())
                .build();
        return toResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getFlaggedMessages() {
        return messageRepository.findByModerationStatusOrderByCreatedAtAsc(
                        ModerationStatus.PENDING_REVIEW, PageRequest.of(0, REVIEW_QUEUE_LIMIT))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MessageResponse markReviewed(Long messageId, User reviewer) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (message.getModerationStatus() != ModerationStatus.PENDING_REVIEW) {
            throw new ConflictException("This message is not awaiting review");
        }
        message.setModerationStatus(ModerationStatus.REVIEWED);
        message.setReviewedAt(LocalDateTime.now());
        message.setReviewedBy(reviewer);
        return toResponse(messageRepository.save(message));
    }

    private User getActiveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    private List<String> findBlockedWords(String content) {
        String normalizedContent = " " + normalize(content) + " ";
        return blockedWords.stream()
                .filter(word -> normalizedContent.contains(" " + word + " "))
                .toList();
    }

    private String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", " ")
                .trim();
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .recipientId(message.getRecipient().getId())
                .recipientName(message.getRecipient().getName())
                .content(message.getContent())
                .flagged(message.isFlagged())
                .matchedTerms(message.getMatchedTerms())
                .moderationStatus(message.getModerationStatus())
                .createdAt(message.getCreatedAt())
                .reviewedAt(message.getReviewedAt())
                .reviewedByName(message.getReviewedBy() == null ? null : message.getReviewedBy().getName())
                .build();
    }
}
