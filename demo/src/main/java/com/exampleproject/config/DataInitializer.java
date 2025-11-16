package com.exampleproject.config;

import com.exampleproject.model.*;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.OrganizationTypeRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
@ConditionalOnProperty(value = "app.initial-data.enabled", havingValue = "true")
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final String ORG_TYPE_RETAIL_ID = "org-type-retail";
    private static final String ORG_TYPE_PUBLIC_ID = "org-type-public";
    private static final String ORG_AURORA_ID = "org-aurora-retail";
    private static final String RESOURCE_CRM_DESK_ID = "resource-crm-desk";
    private static final String RESOURCE_ONSITE_CREW_ID = "resource-onsite-crew";
    private static final String APPOINTMENT_TYPE_CONSULTATION_ID = "appt-consultation";
    private static final String APPOINTMENT_TYPE_INSTALLATION_ID = "appt-installation";
    private static final String CUSTOMER_JEAN_ID = "customer-jean-dupont";
    private static final String CUSTOMER_EMMA_ID = "customer-emma-leroy";
    private static final String APPOINTMENT_DISCOVERY_ID = "appt-discovery-call";
    private static final String APPOINTMENT_INSTALL_ID = "appt-onsite-install";

    @Bean
    CommandLineRunner loadReferenceData(
            OrganizationTypeRepository organizationTypeRepository,
            OrganizationRepository organizationRepository,
            ResourceRepository resourceRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            CustomerRepository customerRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository
    ) {
        return args -> {
            log.info("Loading initial Mongo data (idempotent)");
            organizationTypeRepository.saveAll(buildOrganizationTypes());
            organizationRepository.saveAll(buildOrganizations());
            resourceRepository.saveAll(buildResources());
            appointmentTypeRepository.saveAll(buildAppointmentTypes());
            customerRepository.saveAll(buildCustomers());
            userRepository.saveAll(buildUsers());
            appointmentRepository.saveAll(buildAppointments());
            log.info("Initial Mongo data loaded");
        };
    }

    private List<OrganizationType> buildOrganizationTypes() {
        return List.of(
                new OrganizationType(ORG_TYPE_RETAIL_ID, "Reseau Retail", "Centres de services physiques"),
                new OrganizationType(ORG_TYPE_PUBLIC_ID, "Collectivite", "Partenaires publics et collectivites")
        );
    }

    private List<Organization> buildOrganizations() {
        Address hqAddress = new Address(
                "12 Rue du Faubourg",
                "Paris",
                "Ile-de-France",
                "75010",
                "France"
        );

        ScheduleConfig scheduleConfig = defaultScheduleConfig();
        GeoLocation location = new GeoLocation(48.8765, 2.3541);

        Organization aurora = new Organization(
                ORG_AURORA_ID,
                "Aurora Service Center",
                "Retail & Services",
                ORG_TYPE_RETAIL_ID,
                "+33 1 86 65 00 11",
                hqAddress,
                location,
                scheduleConfig
        );

        return List.of(aurora);
    }

    private List<Resource> buildResources() {
        ScheduleConfig saturdayOverride = defaultScheduleConfig();
        saturdayOverride.setWorkingDays(EnumSet.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY,
                DayOfWeek.SATURDAY
        ));
        List<TimeWindow> saturdayHours = List.of(
                new TimeWindow(LocalTime.of(9, 0), LocalTime.of(12, 0)),
                new TimeWindow(LocalTime.of(13, 0), LocalTime.of(16, 0))
        );
        saturdayOverride.getBusinessHours().put(DayOfWeek.SATURDAY, saturdayHours);
        saturdayOverride.getBreaks().put(
                DayOfWeek.SATURDAY,
                List.of(new TimeWindow(LocalTime.of(12, 0), LocalTime.of(13, 0)))
        );

        Resource crmDesk = new Resource(
                RESOURCE_CRM_DESK_ID,
                ORG_AURORA_ID,
                "Espace accueil CRM",
                "inhouse",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CONSULTATION_ID)),
                null,
                1,
                true
        );

        Resource onsiteCrew = new Resource(
                RESOURCE_ONSITE_CREW_ID,
                ORG_AURORA_ID,
                "Equipe installation mobile",
                "field",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_INSTALLATION_ID)),
                saturdayOverride,
                3,
                true
        );

        return List.of(crmDesk, onsiteCrew);
    }

    private List<AppointmentType> buildAppointmentTypes() {
        EnumSet<DayOfWeek> weekDays = EnumSet.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY
        );

        AppointmentType consultation = new AppointmentType(
                APPOINTMENT_TYPE_CONSULTATION_ID,
                ORG_AURORA_ID,
                "Consultation decouverte",
                "Conseil",
                30,
                List.of(30, 45),
                false,
                true,
                weekDays,
                businessHoursTemplate()
        );

        AppointmentType installation = new AppointmentType(
                APPOINTMENT_TYPE_INSTALLATION_ID,
                ORG_AURORA_ID,
                "Installation sur site",
                "Logistique",
                90,
                List.of(60, 90, 120),
                true,
                true,
                EnumSet.copyOf(weekDays),
                businessHoursTemplate()
        );

        return List.of(consultation, installation);
    }

    private List<Customer> buildCustomers() {
        List<CustomerInteraction> jeanInteractions = List.of(
                new CustomerInteraction(
                        "interaction-jean-1",
                        APPOINTMENT_DISCOVERY_ID,
                        AppointmentEventType.CUSTOMER_COMMENT,
                        AppointmentStatus.SCHEDULED,
                        "Preference pour les creneaux du matin",
                        "jean.dupont@example.com",
                        LocalDateTime.now().minusDays(5)
                )
        );

        Customer jean = new Customer(
                CUSTOMER_JEAN_ID,
                "Dupont",
                "Jean",
                "jean.dupont@example.com",
                "+33 6 12 34 56 70",
                "Client historique depuis 2021",
                LocalDate.of(1988, 2, 17),
                jeanInteractions
        );

        Customer emma = new Customer(
                CUSTOMER_EMMA_ID,
                "Leroy",
                "Emma",
                "emma.leroy@example.com",
                "+33 6 77 88 22 11",
                "Projet d'extension Q4",
                LocalDate.of(1992, 7, 9),
                new ArrayList<>()
        );

        return List.of(jean, emma);
    }

    private List<User> buildUsers() {
        User scheduler = new User("user-alex", "Alex Martin", "alex.martin@example.com");
        User operator = new User("user-naima", "Naima Khelifi", "naima.khelifi@example.com");
        return List.of(scheduler, operator);
    }

    private List<Appointment> buildAppointments() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        AppointmentEvent creationEvent = new AppointmentEvent(
                "appt-event-1",
                AppointmentEventType.INTERNAL_NOTE,
                AppointmentStatus.SCHEDULED,
                "Creation automatique du rendez-vous",
                "system",
                now
        );

        Appointment discoveryCall = new Appointment(
                APPOINTMENT_DISCOVERY_ID,
                ORG_AURORA_ID,
                CUSTOMER_JEAN_ID,
                APPOINTMENT_TYPE_CONSULTATION_ID,
                RESOURCE_CRM_DESK_ID,
                now.plusDays(2).withHour(10).withMinute(0),
                now.plusDays(2).withHour(10).withMinute(30),
                AppointmentStatus.SCHEDULED,
                "Decouverte des besoins CRM",
                List.of(creationEvent)
        );

        AppointmentEvent fieldUpdate = new AppointmentEvent(
                "appt-event-2",
                AppointmentEventType.CUSTOMER_UPDATE,
                AppointmentStatus.SCHEDULED,
                "Client confirme la presence d'un acces electrique",
                "emma.leroy@example.com",
                now.plusDays(1)
        );

        Appointment onsiteInstall = new Appointment(
                APPOINTMENT_INSTALL_ID,
                ORG_AURORA_ID,
                CUSTOMER_EMMA_ID,
                APPOINTMENT_TYPE_INSTALLATION_ID,
                RESOURCE_ONSITE_CREW_ID,
                now.plusDays(5).withHour(14).withMinute(0),
                now.plusDays(5).withHour(15).withMinute(30),
                AppointmentStatus.SCHEDULED,
                "Installation pilote d'equipement",
                List.of(fieldUpdate)
        );

        return List.of(discoveryCall, onsiteInstall);
    }

    private ScheduleConfig defaultScheduleConfig() {
        ScheduleConfig scheduleConfig = new ScheduleConfig();
        EnumSet<DayOfWeek> workdays = EnumSet.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY
        );
        scheduleConfig.setWorkingDays(workdays);
        scheduleConfig.setBusinessHours(businessHoursTemplate());
        scheduleConfig.setBreaks(breaksTemplate());
        scheduleConfig.setHolidays(holidaysTemplate());
        return scheduleConfig;
    }

    private Map<DayOfWeek, List<TimeWindow>> businessHoursTemplate() {
        Map<DayOfWeek, List<TimeWindow>> hours = new EnumMap<>(DayOfWeek.class);
        List<TimeWindow> windows = List.of(
                new TimeWindow(LocalTime.of(9, 0), LocalTime.of(12, 30)),
                new TimeWindow(LocalTime.of(13, 30), LocalTime.of(18, 0))
        );
        EnumSet<DayOfWeek> workdays = EnumSet.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY
        );
        workdays.forEach(day -> hours.put(day, windows));
        return hours;
    }

    private Map<DayOfWeek, List<TimeWindow>> breaksTemplate() {
        Map<DayOfWeek, List<TimeWindow>> breaks = new EnumMap<>(DayOfWeek.class);
        List<TimeWindow> lunch = List.of(new TimeWindow(LocalTime.of(12, 30), LocalTime.of(13, 30)));
        EnumSet<DayOfWeek> workdays = EnumSet.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY
        );
        workdays.forEach(day -> breaks.put(day, lunch));
        return breaks;
    }

    private List<Holiday> holidaysTemplate() {
        int year = Year.now().getValue();
        return List.of(
                new Holiday(LocalDate.of(year, 1, 1), true, List.of(), "Jour de l'an"),
                new Holiday(LocalDate.of(year, 5, 1), true, List.of(), "Fete du Travail"),
                new Holiday(LocalDate.of(year, 12, 25), true, List.of(), "Noel")
        );
    }
}
