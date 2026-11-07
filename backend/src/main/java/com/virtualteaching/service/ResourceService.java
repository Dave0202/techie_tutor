package com.virtualteaching.service;

import com.virtualteaching.dto.ResourceRequest;
import com.virtualteaching.dto.ResourceResponse;
import com.virtualteaching.exception.ForbiddenException;
import com.virtualteaching.exception.ApiException;
import com.virtualteaching.model.Resource;
import com.virtualteaching.model.Role;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final FileStorageService fileStorageService;

    public ResourceResponse addResource(User currentUser, ResourceRequest request) {
        requirePublisher(currentUser);
        String fileUrl = validateExternalUrl(request.getFileUrl());
        String type = normalizeType(request.getType());

        Resource resource = Resource.builder()
                .tutor(currentUser)
                .title(request.getTitle())
                .fileUrl(fileUrl)
                .description(request.getDescription())
                .type(type)
                .createdAt(LocalDateTime.now())
                .build();

        Resource saved = resourceRepository.save(resource);
        return toResponse(saved);
    }

    public ResourceResponse addMaterial(
            User currentUser,
            String title,
            String description,
            String externalUrl,
            String type,
            MultipartFile file,
            MultipartFile qrCode) {
        requirePublisher(currentUser);
        if (title == null || title.isBlank()) {
            throw new ApiException("A title is required");
        }
        String link = externalUrl == null || externalUrl.isBlank() ? null : validateExternalUrl(externalUrl);
        if ((file == null || file.isEmpty()) && link == null) {
            throw new ApiException("Add a resource file or a valid resource link");
        }

        String fileUrl = file == null || file.isEmpty() ? link : fileStorageService.storeResourceFile(file);
        String qrCodeUrl = qrCode == null || qrCode.isEmpty() ? null : fileStorageService.storeQrImage(qrCode);
        Resource resource = Resource.builder()
                .tutor(currentUser)
                .title(title.trim())
                .fileUrl(fileUrl)
                .qrCodeUrl(qrCodeUrl)
                .description(description == null || description.isBlank() ? null : description.trim())
                .type(normalizeType(type))
                .createdAt(LocalDateTime.now())
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private ResourceResponse toResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .tutorId(resource.getTutor().getId())
                .tutorName(resource.getTutor().getName())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .fileUrl(resource.getFileUrl())
                .qrCodeUrl(resource.getQrCodeUrl())
                .type(resource.getType())
                .createdAt(resource.getCreatedAt())
                .build();
    }

    private void requirePublisher(User user) {
        if (user.getRole() != Role.TUTOR && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only tutors and administrators can publish learning materials");
        }
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return "MATERIAL";
        }
        String normalized = type.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("HOMEWORK") && !normalized.equals("MATERIAL")) {
            throw new ApiException("Resource type must be HOMEWORK or MATERIAL");
        }
        return normalized;
    }

    private String validateExternalUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new ApiException("A resource link is required");
        }
        try {
            URI parsed = URI.create(url.trim());
            String scheme = parsed.getScheme();
            if (parsed.getHost() == null || scheme == null
                    || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                throw new ApiException("Resource links must use http:// or https://");
            }
            return parsed.toASCIIString();
        } catch (IllegalArgumentException exception) {
            throw new ApiException("Enter a valid resource link");
        }
    }
}
