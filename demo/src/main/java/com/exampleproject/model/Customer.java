package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document("customers")
public class Customer {
    @Id
    private String id;
    private String name;
    private String firstName;
    private String email;
    private String phone;
    private String notes;
    private LocalDate dateOfBirth;
    private List<CustomerInteraction> interactions = new ArrayList<>();

    public Customer() {
    }

    public Customer(
            String id,
            String name,
            String firstName,
            String email,
            String phone,
            String notes,
            LocalDate dateOfBirth,
            List<CustomerInteraction> interactions
    ) {
        this.id = id;
        this.name = name;
        this.firstName = firstName;
        this.email = email;
        this.phone = phone;
        this.notes = notes;
        this.dateOfBirth = dateOfBirth;
        if (interactions != null) {
            this.interactions = interactions;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public List<CustomerInteraction> getInteractions() { return interactions; }
    public void setInteractions(List<CustomerInteraction> interactions) { this.interactions = interactions; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Customer)) {
            return false;
        }
        Customer customer = (Customer) o;
        return Objects.equals(id, customer.id)
                && Objects.equals(email, customer.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }

    @Override
    public String toString() {
        return "Customer{"
                + "id='" + id + '\''
                + ", name='" + name + '\''
                + ", firstName='" + firstName + '\''
                + ", email='" + email + '\''
                + ", phone='" + phone + '\''
                + ", dateOfBirth=" + dateOfBirth
                + '}';
    }
}
