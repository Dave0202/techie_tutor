package com.virtualteaching.service;

import com.virtualteaching.dto.ProfilePictureResponse;
import com.virtualteaching.exception.ApiException;
import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.model.User;
import com.virtualteaching.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;

@Service
public class UserProfileService {

    private static final String CLOUDINARY_HOST = "res.cloudinary.com";

    private final UserRepository userRepository;
    private final String cloudinaryCloudName;

    public UserProfileService(
            UserRepository userRepository,
            @Value("${app.cloudinary.cloud-name:mrnfxyxs}") String cloudinaryCloudName) {
        this.userRepository = userRepository;
        this.cloudinaryCloudName = cloudinaryCloudName;
    }

    @Transactional
    public ProfilePictureResponse updateProfilePicture(String email, String profilePictureUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        String validatedUrl = validateCloudinaryUrl(profilePictureUrl);
        user.setProfilePictureUrl(validatedUrl);
        userRepository.save(user);
        return ProfilePictureResponse.builder()
                .id(user.getId())
                .profilePictureUrl(validatedUrl)
                .build();
    }

    private String validateCloudinaryUrl(String profilePictureUrl) {
        try {
            URI uri = URI.create(profilePictureUrl);
            String cloudinaryImagePath = "/" + cloudinaryCloudName + "/image/upload/";
            if ("https".equalsIgnoreCase(uri.getScheme())
                    && CLOUDINARY_HOST.equalsIgnoreCase(uri.getHost())
                    && uri.getUserInfo() == null
                    && uri.getQuery() == null
                    && uri.getFragment() == null
                    && uri.getPath() != null
                    && uri.getPath().startsWith(cloudinaryImagePath)
                    && uri.getPath().length() > cloudinaryImagePath.length()) {
                return profilePictureUrl;
            }
        } catch (IllegalArgumentException exception) {
            throw new ApiException("Profile picture URL must be a valid Cloudinary image URL");
        }
        throw new ApiException("Profile picture must be an HTTPS image from the configured Cloudinary account");
    }
}
