package com.virtualteaching.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileStorageServiceTest {

    @TempDir
    Path temporaryDirectory;

    @Test
    void storeProfileImageWritesBytesAndClosesAllInputStreams() throws IOException {
        byte[] imageBytes = {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x00
        };
        TrackingMultipartFile file = new TrackingMultipartFile(imageBytes);
        FileStorageService service = new FileStorageService(temporaryDirectory.resolve("uploads").toString());

        String fileUrl = service.storeProfileImage(file);
        Path storedFile = service.resolveStoredFile(fileUrl.substring("/api/files/".length()));

        assertArrayEquals(imageBytes, Files.readAllBytes(storedFile));
        assertEquals(2, file.openedStreams.size());
        assertTrue(file.openedStreams.stream().allMatch(stream -> stream.closed));
    }

    private static final class TrackingMultipartFile extends MockMultipartFile {

        private final List<TrackingInputStream> openedStreams = new ArrayList<>();

        private TrackingMultipartFile(byte[] content) {
            super("file", "profile.png", "image/png", content);
        }

        @Override
        public ByteArrayInputStream getInputStream() throws IOException {
            TrackingInputStream stream = new TrackingInputStream(getBytes());
            openedStreams.add(stream);
            return stream;
        }
    }

    private static final class TrackingInputStream extends ByteArrayInputStream {

        private boolean closed;

        private TrackingInputStream(byte[] content) {
            super(content);
        }

        @Override
        public void close() throws IOException {
            closed = true;
            super.close();
        }
    }
}
