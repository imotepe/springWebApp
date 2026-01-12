package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Objects;

@Document("organizations")
public class Organization {
    @Id
    private String id;
    private String name;
    private String marketingName;
    private String industry;
    private String type;
    private String phone;
    private String email;
    private Address address;
    private GeoLocation location;
    private ScheduleConfig scheduleConfig;
    private String createdBy;
    private LocalDateTime createdAt;
    private String mapsLink;
    private String facebookPage;
    private String facebookGroup;
    private String instagram;
    private String whatsappContact;
    private String emailQrCode;
    private String mapsQrCode;
    private String facebookPageQrCode;
    private String facebookGroupQrCode;
    private String instagramQrCode;
    private String whatsappMessageQrCode;
    private String callQrCode;
    private String logoImage;

    public Organization() {}

    public Organization(String id, String name, String marketingName, String industry, String type,
                        String phone,
                        Address address, GeoLocation location, ScheduleConfig scheduleConfig) {
        this.id = id;
        this.name = name;
        this.marketingName = marketingName;
        this.industry = industry;
        this.type = type;
        this.phone = phone;
        this.address = address;
        this.location = location;
        this.scheduleConfig = scheduleConfig;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMarketingName() { return marketingName; }
    public void setMarketingName(String marketingName) { this.marketingName = marketingName; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }

    public GeoLocation getLocation() { return location; }
    public void setLocation(GeoLocation location) { this.location = location; }

    public ScheduleConfig getScheduleConfig() { return scheduleConfig; }
    public void setScheduleConfig(ScheduleConfig scheduleConfig) { this.scheduleConfig = scheduleConfig; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getMapsLink() { return mapsLink; }
    public void setMapsLink(String mapsLink) { this.mapsLink = mapsLink; }

    public String getFacebookPage() { return facebookPage; }
    public void setFacebookPage(String facebookPage) { this.facebookPage = facebookPage; }

    public String getFacebookGroup() { return facebookGroup; }
    public void setFacebookGroup(String facebookGroup) { this.facebookGroup = facebookGroup; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getWhatsappContact() { return whatsappContact; }
    public void setWhatsappContact(String whatsappContact) { this.whatsappContact = whatsappContact; }

    public String getEmailQrCode() { return emailQrCode; }
    public void setEmailQrCode(String emailQrCode) { this.emailQrCode = emailQrCode; }

    public String getMapsQrCode() { return mapsQrCode; }
    public void setMapsQrCode(String mapsQrCode) { this.mapsQrCode = mapsQrCode; }

    public String getFacebookPageQrCode() { return facebookPageQrCode; }
    public void setFacebookPageQrCode(String facebookPageQrCode) { this.facebookPageQrCode = facebookPageQrCode; }

    public String getFacebookGroupQrCode() { return facebookGroupQrCode; }
    public void setFacebookGroupQrCode(String facebookGroupQrCode) { this.facebookGroupQrCode = facebookGroupQrCode; }

    public String getInstagramQrCode() { return instagramQrCode; }
    public void setInstagramQrCode(String instagramQrCode) { this.instagramQrCode = instagramQrCode; }

    public String getWhatsappMessageQrCode() { return whatsappMessageQrCode; }
    public void setWhatsappMessageQrCode(String whatsappMessageQrCode) { this.whatsappMessageQrCode = whatsappMessageQrCode; }

    public String getCallQrCode() { return callQrCode; }
    public void setCallQrCode(String callQrCode) { this.callQrCode = callQrCode; }

    public String getLogoImage() { return logoImage; }
    public void setLogoImage(String logoImage) { this.logoImage = logoImage; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Organization)) return false;
        Organization that = (Organization) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Organization{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", marketingName='" + marketingName + '\'' +
                ", industry='" + industry + '\'' +
                ", type='" + type + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", address=" + address +
                ", location=" + location +
                ", createdBy='" + createdBy + '\'' +
                ", mapsLink='" + mapsLink + '\'' +
                ", facebookPage='" + facebookPage + '\'' +
                ", facebookGroup='" + facebookGroup + '\'' +
                ", instagram='" + instagram + '\'' +
                ", whatsappContact='" + whatsappContact + '\'' +
                ", emailQrCode='" + emailQrCode + '\'' +
                ", mapsQrCode='" + mapsQrCode + '\'' +
                ", facebookPageQrCode='" + facebookPageQrCode + '\'' +
                ", facebookGroupQrCode='" + facebookGroupQrCode + '\'' +
                ", instagramQrCode='" + instagramQrCode + '\'' +
                ", whatsappMessageQrCode='" + whatsappMessageQrCode + '\'' +
                ", callQrCode='" + callQrCode + '\'' +
                ", logoImage='" + logoImage + '\'' +
                '}';
    }
}
