package com.dlms.backend.media.controller;

import com.dlms.backend.media.model.MediaMetadata;
import com.dlms.backend.media.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (role != null && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            MediaMetadata saved = mediaService.uploadFile(file);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<String> getStreamUrl(@PathVariable String mediaId) {
        try {
            return ResponseEntity.ok(mediaService.getAccessUrl(mediaId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<?> deleteMedia(@PathVariable String mediaId) {
        try {
            mediaService.deleteMedia(mediaId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/download/{mediaId}")
    public ResponseEntity<Void> downloadMedia(@PathVariable String mediaId) {
        try {
            String accessUrl = mediaService.getAccessUrl(mediaId);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(java.net.URI.create(accessUrl))
                    .build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveLocalFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads").toAbsolutePath().normalize().resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{mediaId}/course/{courseId}")
    public ResponseEntity<?> assignCourse(@PathVariable String mediaId, @PathVariable String courseId) {
        try {
            mediaService.assignCourse(mediaId, courseId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
