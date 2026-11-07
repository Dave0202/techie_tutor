package com.virtualteaching.service;

import com.virtualteaching.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class FileStorageService {

    private static final Pattern STORED_FILE_NAME = Pattern.compile("[a-f0-9-]{36}\\.[a-z0-9]{2,5}");
    private static final long PROFILE_IMAGE_LIMIT = 5L * 1024 * 1024;
    private static final long RESOURCE_FILE_LIMIT = 20L * 1024 * 1024;
    private static final Map<String, String> IMAGE_TYPES = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "webp", "image/webp"
    );
    private static final Map<String, String> RESOURCE_TYPES = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("txt", "text/plain"),
            Map.entry("csv", "text/csv"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("png", "image/png"),
            Map.entry("webp", "image/webp")
    );

    private final Path uploadDirectory;

    public FileStorageService(@Value("${app.file-storage-dir:uploads}") String directory) {
        Path configuredPath = Path.of(directory);
        this.uploadDirectory = (configuredPath.isAbsolute()
                ? configuredPath
                : Path.of(System.getProperty("user.dir")).resolve(configuredPath)).normalize();
        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not initialize the upload directory", exception);
        }
    }

    public String storeProfileImage(MultipartFile file) {
        return store(file, IMAGE_TYPES, PROFILE_IMAGE_LIMIT, true);
    }

    public String storeQrImage(MultipartFile file) {
        return store(file, IMAGE_TYPES, PROFILE_IMAGE_LIMIT, true);
    }

    public String storeResourceFile(MultipartFile file) {
        return store(file, RESOURCE_TYPES, RESOURCE_FILE_LIMIT, false);
    }

    public Path resolveStoredFile(String fileName) {
        if (fileName == null || !STORED_FILE_NAME.matcher(fileName).matches()) {
            throw new ApiException("Invalid file name");
        }
        Path resolved = uploadDirectory.resolve(fileName).normalize();
        if (!resolved.getParent().equals(uploadDirectory)) {
            throw new ApiException("Invalid file path");
        }
        return resolved;
    }

    public void deleteStoredFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/api/files/")) {
            return;
        }
        try {
            Files.deleteIfExists(resolveStoredFile(fileUrl.substring("/api/files/".length())));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not remove the stored file", exception);
        }
    }

    private String store(MultipartFile file, Map<String, String> allowedTypes, long sizeLimit, boolean imageOnly) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Choose a file to upload");
        }
        if (file.getSize() > sizeLimit) {
            throw new ApiException("The selected file is too large");
        }

        String originalName = file.getOriginalFilename();
        String extension = originalName == null || !originalName.contains(".")
                ? ""
                : originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        String expectedContentType = allowedTypes.get(extension);
        if (expectedContentType == null || !expectedContentType.equalsIgnoreCase(file.getContentType())) {
            throw new ApiException("This file type is not supported");
        }
        if (imageOnly && !hasValidImageSignature(file, extension)) {
            throw new ApiException("The selected file is not a supported image");
        }

        String fileName = UUID.randomUUID() + "." + extension;
        try {
            Files.copy(file.getInputStream(), resolveStoredFile(fileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store the uploaded file", exception);
        }
        return "/api/files/" + fileName;
    }

    private boolean hasValidImageSignature(MultipartFile file, String extension) {
        try (var input = file.getInputStream()) {
            byte[] header = input.readNBytes(12);
            return switch (extension) {
                case "jpg", "jpeg" -> header.length >= 3
                        && (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
                case "png" -> header.length >= 8
                        && (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
                        && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;
                case "webp" -> header.length >= 12
                        && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                        && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;
                default -> false;
            };
        } catch (IOException exception) {
            throw new IllegalStateException("Could not validate the uploaded image", exception);
        }
    }
}
