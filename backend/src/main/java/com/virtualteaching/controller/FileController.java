package com.virtualteaching.controller;

import com.virtualteaching.exception.NotFoundException;
import com.virtualteaching.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private static final Map<String, MediaType> MEDIA_TYPES = Map.ofEntries(
            Map.entry("jpg", MediaType.IMAGE_JPEG),
            Map.entry("jpeg", MediaType.IMAGE_JPEG),
            Map.entry("png", MediaType.IMAGE_PNG),
            Map.entry("webp", MediaType.parseMediaType("image/webp")),
            Map.entry("pdf", MediaType.APPLICATION_PDF),
            Map.entry("txt", MediaType.TEXT_PLAIN),
            Map.entry("csv", MediaType.parseMediaType("text/csv")),
            Map.entry("doc", MediaType.parseMediaType("application/msword")),
            Map.entry("docx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry("ppt", MediaType.parseMediaType("application/vnd.ms-powerpoint")),
            Map.entry("pptx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation")),
            Map.entry("xls", MediaType.parseMediaType("application/vnd.ms-excel")),
            Map.entry("xlsx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
    );

    private final FileStorageService fileStorageService;

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) throws IOException {
        Path path = fileStorageService.resolveStoredFile(fileName);
        if (!Files.isRegularFile(path)) {
            throw new NotFoundException("File not found");
        }

        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        MediaType mediaType = MEDIA_TYPES.getOrDefault(extension, MediaType.APPLICATION_OCTET_STREAM);
        boolean inline = mediaType.getType().equals("image");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(Files.size(path))
                .cacheControl(CacheControl.noCache())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.builder(inline ? "inline" : "attachment")
                        .filename(fileName)
                        .build()
                        .toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(path));
    }
}
