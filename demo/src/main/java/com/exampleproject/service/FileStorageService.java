package com.exampleproject.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeOrganizationLogo(String orgId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Logo file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        String extension = resolveExtension(file);
        String filename = "logo-" + UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path orgDir = uploadRoot.resolve("organizations").resolve(orgId).normalize();
        if (!orgDir.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
        }

        try {
            Files.createDirectories(orgDir);
            Path target = orgDir.resolve(filename).normalize();
            if (!target.startsWith(orgDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
            }
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store logo");
        }

        return "/uploads/organizations/" + orgId + "/" + filename;
    }

    public String storeOrganizationQrCode(String orgId, String type, BufferedImage image) {
        if (orgId == null || orgId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization id is required");
        }
        if (image == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "QR code image is required");
        }
        String safeType = normalizeType(type);
        String filename = "qr-v4-" + safeType + "-" + UUID.randomUUID() + ".png";
        Path orgDir = uploadRoot.resolve("organizations").resolve(orgId).resolve("qr").normalize();
        if (!orgDir.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
        }
        try {
            Files.createDirectories(orgDir);
            Path target = orgDir.resolve(filename).normalize();
            if (!target.startsWith(orgDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
            }
            ImageIO.write(image, "png", target.toFile());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store QR code");
        }
        return "/uploads/organizations/" + orgId + "/qr/" + filename;
    }

    public void deleteIfExists(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return;
        }
        String normalized = storedPath.trim().replace('\\', '/');
        String relative;
        if (normalized.startsWith("/uploads/")) {
            relative = normalized.substring("/uploads/".length());
        } else if (normalized.startsWith("uploads/")) {
            relative = normalized.substring("uploads/".length());
        } else {
            return;
        }
        Path target = uploadRoot.resolve(relative).normalize();
        if (!target.startsWith(uploadRoot)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            // Best-effort cleanup; ignore failures to avoid breaking the update flow.
        }
    }

    private String resolveExtension(MultipartFile file) {
        String cleaned = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = StringUtils.getFilenameExtension(cleaned);
        if (ext != null && !ext.isBlank()) {
            return ext.toLowerCase(Locale.ROOT);
        }
        String contentType = file.getContentType();
        if (contentType == null) {
            return "";
        }
        String normalized = contentType.toLowerCase(Locale.ROOT);
        if ("image/png".equals(normalized)) return "png";
        if ("image/jpeg".equals(normalized)) return "jpg";
        if ("image/gif".equals(normalized)) return "gif";
        if ("image/webp".equals(normalized)) return "webp";
        if ("image/svg+xml".equals(normalized)) return "svg";
        return "";
    }

    private String normalizeType(String type) {
        String trimmed = type == null ? "" : type.trim().toLowerCase(Locale.ROOT);
        if (trimmed.isBlank()) {
            return "code";
        }
        String normalized = trimmed.replaceAll("[^a-z0-9]+", "-");
        if (normalized.startsWith("-")) {
            normalized = normalized.substring(1);
        }
        if (normalized.endsWith("-")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.isBlank() ? "code" : normalized;
    }
}
