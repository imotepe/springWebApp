package com.exampleproject.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;

@Service
public class QrCodeService {
    private static final int QR_SIZE = 360;
    private static final int DARK_COLOR = 0xFF0F172A;
    private static final int LIGHT_COLOR = 0xFFFFFFFF;
    private final FileStorageService fileStorageService;

    public QrCodeService(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    public String generateOrganizationQrCode(String orgId, String content, QrIcon icon) {
        String normalized = normalizeContent(content);
        if (normalized == null) {
            return null;
        }
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);
            BitMatrix matrix = new QRCodeWriter().encode(normalized, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(matrix, new MatrixToImageConfig(DARK_COLOR, LIGHT_COLOR));
            if (icon != null) {
                overlayIcon(qrImage, icon);
            }
            String type = icon != null ? icon.slug() : "qr";
            return fileStorageService.storeOrganizationQrCode(orgId, type, qrImage);
        } catch (WriterException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate QR code");
        }
    }

    private String normalizeContent(String content) {
        if (content == null) {
            return null;
        }
        String trimmed = content.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private void overlayIcon(BufferedImage qrImage, QrIcon icon) {
        int size = qrImage.getWidth();
        int iconSize = Math.max(48, Math.round(size * 0.2f));
        int padding = Math.max(4, Math.round(iconSize * 0.12f));
        int backgroundSize = iconSize + padding * 2;
        int backgroundX = (size - backgroundSize) / 2;
        int backgroundY = (size - backgroundSize) / 2;

        Graphics2D g = qrImage.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.WHITE);
        g.fillRoundRect(backgroundX, backgroundY, backgroundSize, backgroundSize, backgroundSize / 3, backgroundSize / 3);
        BufferedImage iconImage = buildIcon(icon, iconSize);
        int iconX = (size - iconSize) / 2;
        int iconY = (size - iconSize) / 2;
        g.drawImage(iconImage, iconX, iconY, null);
        g.dispose();
    }

    private BufferedImage buildIcon(QrIcon icon, int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(icon.background());
        g.fillRoundRect(0, 0, size, size, size / 3, size / 3);

        String label = icon.label();
        Font font = new Font("SansSerif", Font.BOLD, Math.round(size * 0.45f));
        g.setFont(font);
        FontMetrics metrics = g.getFontMetrics();
        int x = (size - metrics.stringWidth(label)) / 2;
        int y = (size - metrics.getHeight()) / 2 + metrics.getAscent();
        g.setColor(icon.foreground());
        g.drawString(label, x, y);
        g.dispose();
        return image;
    }

    public enum QrIcon {
        MAPS("maps", "MAP", new Color(0x1F7A5F), Color.WHITE),
        FACEBOOK("facebook", "FB", new Color(0x1877F2), Color.WHITE),
        FACEBOOK_GROUP("facebook-group", "FG", new Color(0x1461C0), Color.WHITE),
        INSTAGRAM("instagram", "IG", new Color(0xE1306C), Color.WHITE),
        WHATSAPP_MESSAGE("whatsapp-message", "WA", new Color(0x25D366), Color.WHITE),
        CALL("call", "CALL", new Color(0x0EA5E9), Color.WHITE);

        private final String slug;
        private final String label;
        private final Color background;
        private final Color foreground;

        QrIcon(String slug, String label, Color background, Color foreground) {
            this.slug = slug;
            this.label = label;
            this.background = background;
            this.foreground = foreground;
        }

        public String slug() {
            return slug;
        }

        public String label() {
            return label.toUpperCase(Locale.ROOT);
        }

        public Color background() {
            return background;
        }

        public Color foreground() {
            return foreground;
        }
    }
}
