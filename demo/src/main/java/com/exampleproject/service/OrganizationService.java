package com.exampleproject.service;

import com.exampleproject.model.Organization;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.OrganizationTypeRepository;
import com.exampleproject.security.OrganizationAccessManager;
import com.exampleproject.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.function.Function;

@Service
@SuppressWarnings("null")
public class OrganizationService {
    private final OrganizationRepository repository;
    private final OrganizationTypeRepository typeRepository;
    private final OrganizationAccessManager organizationAccessManager;
    private final SubscriptionService subscriptionService;
    private final FileStorageService fileStorageService;
    private final QrCodeService qrCodeService;

    public OrganizationService(OrganizationRepository repository,
                               OrganizationTypeRepository typeRepository,
                               OrganizationAccessManager organizationAccessManager,
                               SubscriptionService subscriptionService,
                               FileStorageService fileStorageService,
                               QrCodeService qrCodeService) {
        this.repository = repository;
        this.typeRepository = typeRepository;
        this.organizationAccessManager = organizationAccessManager;
        this.subscriptionService = subscriptionService;
        this.fileStorageService = fileStorageService;
        this.qrCodeService = qrCodeService;
    }

    public List<Organization> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isSuperAdmin()) {
            return repository.findAll();
        }
        if (context.isPlatformAdmin()) {
            return repository.findByCreatedBy(context.user().getId());
        }
        return context.scopedOrgId()
                .flatMap(repository::findById)
                .map(List::of)
                .orElse(List.of());
    }

    public Organization findById(String id) {
        Organization organization = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(organization.getId());
        return organization;
    }

    public Organization create(Organization org) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can create organizations");
        }
        org.setType(resolveTypeId(org.getType()));
        org.setId(null);
        org.setCreatedBy(context.user().getId());
        org.setCreatedAt(LocalDateTime.now());
        Organization saved = repository.save(org);
        saved = refreshQrCodes(saved, null);
        subscriptionService.createDefaultForOrg(saved.getId());
        return saved;
    }

    public Organization update(String id, Organization org) {
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId(), OrganizationAccessManager.AccessIntent.WRITE);
        org.setType(resolveTypeId(org.getType()));
        org.setId(id);
        org.setCreatedBy(existing.getCreatedBy());
        org.setCreatedAt(existing.getCreatedAt());
        org.setMapsQrCode(existing.getMapsQrCode());
        org.setFacebookPageQrCode(existing.getFacebookPageQrCode());
        org.setFacebookGroupQrCode(existing.getFacebookGroupQrCode());
        org.setInstagramQrCode(existing.getInstagramQrCode());
        org.setWhatsappMessageQrCode(existing.getWhatsappMessageQrCode());
        org.setWhatsappCallQrCode(existing.getWhatsappCallQrCode());
        Organization saved = repository.save(org);
        return refreshQrCodes(saved, existing);
    }

    public void delete(String id) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can delete organizations");
        }
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId(), OrganizationAccessManager.AccessIntent.WRITE);
        repository.deleteById(id);
    }

    public Organization updateLogo(String id, MultipartFile file) {
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId(), OrganizationAccessManager.AccessIntent.WRITE);
        String previousLogo = existing.getLogoImage();
        String logoPath = fileStorageService.storeOrganizationLogo(existing.getId(), file);
        existing.setLogoImage(logoPath);
        Organization saved = repository.save(existing);
        if (previousLogo != null && !previousLogo.isBlank() && !previousLogo.equals(logoPath)) {
            fileStorageService.deleteIfExists(previousLogo);
        }
        return saved;
    }

    private Organization refreshQrCodes(Organization org, Organization previous) {
        boolean updated = false;
        updated |= applyQrCode(
                org,
                org.getMapsLink(),
                previous == null ? null : previous.getMapsLink(),
                previous == null ? null : previous.getMapsQrCode(),
                org::setMapsQrCode,
                QrCodeService.QrIcon.MAPS,
                this::toMapsQrContent
        );
        updated |= applyQrCode(
                org,
                org.getFacebookPage(),
                previous == null ? null : previous.getFacebookPage(),
                previous == null ? null : previous.getFacebookPageQrCode(),
                org::setFacebookPageQrCode,
                QrCodeService.QrIcon.FACEBOOK,
                this::toFacebookPageQrContent
        );
        updated |= applyQrCode(
                org,
                org.getFacebookGroup(),
                previous == null ? null : previous.getFacebookGroup(),
                previous == null ? null : previous.getFacebookGroupQrCode(),
                org::setFacebookGroupQrCode,
                QrCodeService.QrIcon.FACEBOOK_GROUP,
                this::toFacebookGroupQrContent
        );
        updated |= applyQrCode(
                org,
                org.getInstagram(),
                previous == null ? null : previous.getInstagram(),
                previous == null ? null : previous.getInstagramQrCode(),
                org::setInstagramQrCode,
                QrCodeService.QrIcon.INSTAGRAM,
                this::toInstagramQrContent
        );
        updated |= applyQrCode(
                org,
                org.getWhatsappContact(),
                previous == null ? null : previous.getWhatsappContact(),
                previous == null ? null : previous.getWhatsappMessageQrCode(),
                org::setWhatsappMessageQrCode,
                QrCodeService.QrIcon.WHATSAPP_MESSAGE,
                this::toWhatsappMessageQrContent
        );
        updated |= applyQrCode(
                org,
                org.getWhatsappContact(),
                previous == null ? null : previous.getWhatsappContact(),
                previous == null ? null : previous.getWhatsappCallQrCode(),
                org::setWhatsappCallQrCode,
                QrCodeService.QrIcon.WHATSAPP_CALL,
                this::toWhatsappCallQrContent
        );
        if (updated) {
            return repository.save(org);
        }
        return org;
    }

    private boolean applyQrCode(
            Organization org,
            String newLink,
            String previousLink,
            String previousQr,
            Consumer<String> setter,
            QrCodeService.QrIcon icon,
            Function<String, String> contentBuilder
    ) {
        String newContent = contentBuilder.apply(newLink);
        String previousContent = contentBuilder.apply(previousLink);

        if (newContent == null) {
            if (previousQr != null && !previousQr.isBlank()) {
                fileStorageService.deleteIfExists(previousQr);
                setter.accept(null);
                return true;
            }
            setter.accept(null);
            return false;
        }

        if (previousQr == null || previousQr.isBlank() || !Objects.equals(previousContent, newContent)) {
            String generated = qrCodeService.generateOrganizationQrCode(org.getId(), newContent, icon);
            if (previousQr != null && !previousQr.isBlank() && generated != null && !generated.equals(previousQr)) {
                fileStorageService.deleteIfExists(previousQr);
            }
            setter.accept(generated);
            return true;
        }

        setter.accept(previousQr);
        return false;
    }

    private String toMapsQrContent(String value) {
        String trimmed = normalizeLink(value);
        if (trimmed == null) return null;
        if (startsWithScheme(trimmed)) {
            return trimmed;
        }
        String lower = trimmed.toLowerCase();
        if (lower.contains("maps.google.com") || lower.contains("google.com/maps") || lower.contains("goo.gl/maps")) {
            return "https://" + trimmed;
        }
        return "https://maps.google.com/?q=" + urlEncode(trimmed);
    }

    private String toFacebookPageQrContent(String value) {
        String trimmed = normalizeLink(value);
        if (trimmed == null) return null;
        if (startsWithScheme(trimmed)) {
            return trimmed;
        }
        return "https://www.facebook.com/" + stripHandle(trimmed);
    }

    private String toFacebookGroupQrContent(String value) {
        String trimmed = normalizeLink(value);
        if (trimmed == null) return null;
        if (startsWithScheme(trimmed)) {
            return trimmed;
        }
        return "https://www.facebook.com/groups/" + stripHandle(trimmed);
    }

    private String toInstagramQrContent(String value) {
        String trimmed = normalizeLink(value);
        if (trimmed == null) return null;
        if (startsWithScheme(trimmed)) {
            return trimmed;
        }
        return "https://www.instagram.com/" + stripHandle(trimmed);
    }

    private String toWhatsappMessageQrContent(String value) {
        String trimmed = normalizeLink(value);
        if (trimmed == null) return null;
        if (startsWithHttpOrWhatsapp(trimmed)) {
            return trimmed;
        }
        String phone = normalizePhone(trimmed);
        if (phone == null) return null;
        String digits = phone.startsWith("+") ? phone.substring(1) : phone;
        return "https://wa.me/" + digits;
    }

    private String toWhatsappCallQrContent(String value) {
        String phone = normalizePhone(value);
        if (phone == null) return null;
        return "tel:" + phone;
    }

    private String normalizeLink(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizePhone(String value) {
        if (value == null) return null;
        String digits = value.replaceAll("[^0-9+]", "");
        if (digits.isBlank()) {
            return null;
        }
        String digitsOnly = digits.replace("+", "");
        if (digitsOnly.isBlank()) {
            return null;
        }
        if (digits.startsWith("00")) {
            digits = "+" + digits.substring(2);
        }
        if (digits.contains("+") && !digits.startsWith("+")) {
            digits = "+" + digits.replace("+", "");
        }
        return digits;
    }

    private String stripHandle(String value) {
        String trimmed = value.trim();
        if (trimmed.startsWith("@")) {
            return trimmed.substring(1);
        }
        return trimmed;
    }

    private boolean startsWithScheme(String value) {
        String lower = value.toLowerCase();
        return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("geo:");
    }

    private boolean startsWithHttpOrWhatsapp(String value) {
        String lower = value.toLowerCase();
        return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("whatsapp:");
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String resolveTypeId(String typeName) {
        if (typeName == null || typeName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        String normalizedType = typeName.trim();
        if (typeRepository.existsById(normalizedType)) {
            return normalizedType;
        }
        return typeRepository.findByName(normalizedType)
                .map(type -> type.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unknown organization type: " + typeName
                ));
    }
}
