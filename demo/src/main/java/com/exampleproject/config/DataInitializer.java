package com.exampleproject.config;

import com.exampleproject.model.*;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.OrganizationTypeRepository;
import com.exampleproject.repository.PlanRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.repository.SubscriptionRepository;
import com.exampleproject.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
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
@SuppressWarnings("null")
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEFAULT_USER_PASSWORD = "ChangeMe123!";
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    private static final String ORG_TYPE_RETAIL_ID = "org-type-retail";
    private static final String ORG_TYPE_PUBLIC_ID = "org-type-public";
    private static final String ORG_TYPE_HEALTH_ID = "org-type-health";
    private static final String ORG_TYPE_EDU_ID = "org-type-edu";
    private static final String ORG_TYPE_FIN_ID = "org-type-fin";
    private static final String ORG_TYPE_NONPROFIT_ID = "org-type-nonprofit";
    private static final String ORG_TYPE_HOSPITALITY_ID = "org-type-hospitality";
    private static final String ORG_TYPE_LOGISTICS_ID = "org-type-logistics";
    private static final String ORG_TYPE_GOV_ID = "org-type-gov";
    private static final String ORG_TYPE_AGRI_ID = "org-type-agri";
    private static final String ORG_TYPE_DEFENSE_ID = "org-type-defense";
    private static final String ORG_TYPE_MANUFACTURING_ID = "org-type-manufacturing";
    private static final String ORG_TYPE_MEDIA_ID = "org-type-media";
    private static final String ORG_AURORA_ID = "org-aurora-retail";
    private static final String ORG_RIVIERA_ID = "org-riviera-public";
    private static final String ORG_HELIX_ID = "org-helix-health";
    private static final String ORG_NOVA_ID = "org-nova-tech";
    private static final String ORG_ATLAS_ID = "org-atlas-services";
    private static final String ORG_LUMEN_ID = "org-lumen-digital";
    private static final String ORG_PULSE_ID = "org-pulse-care";
    private static final String ORG_TERRA_ID = "org-terra-green";
    private static final String ORG_ORBIT_ID = "org-orbit-connect";
    private static final String ORG_HORIZON_ID = "org-horizon-consulting";
    private static final String ORG_VERTEX_ID = "org-vertex-solutions";
    private static final String ORG_MOMENTUM_ID = "org-momentum-labs";
    private static final String ORG_ASTER_ID = "org-aster-network";
    private static final String RESOURCE_CRM_DESK_ID = "resource-crm-desk";
    private static final String RESOURCE_ONSITE_CREW_ID = "resource-onsite-crew";
    private static final String RESOURCE_RIVIERA_HALL_ID = "resource-riviera-hall";
    private static final String RESOURCE_NOVA_ROOM_ID = "resource-nova-room";
    private static final String RESOURCE_ATLAS_FLEET_ID = "resource-atlas-fleet";
    private static final String RESOURCE_LUMEN_LAB_ID = "resource-lumen-lab";
    private static final String RESOURCE_PULSE_CLINIC_ID = "resource-pulse-clinic";
    private static final String RESOURCE_TERRA_FIELD_ID = "resource-terra-field";
    private static final String RESOURCE_ORBIT_STATION_ID = "resource-orbit-station";
    private static final String RESOURCE_HORIZON_SUITE_ID = "resource-horizon-suite";
    private static final String RESOURCE_VERTEX_HQ_ID = "resource-vertex-hq";
    private static final String RESOURCE_MOMENTUM_POD_ID = "resource-momentum-pod";
    private static final String RESOURCE_ASTER_COMMUNITY_ID = "resource-aster-community";
    private static final String APPOINTMENT_TYPE_CONSULTATION_ID = "appt-consultation";
    private static final String APPOINTMENT_TYPE_INSTALLATION_ID = "appt-installation";
    private static final String APPOINTMENT_TYPE_WORKSHOP_ID = "appt-community-workshop";
    private static final String APPOINTMENT_TYPE_TELECONSULT_ID = "appt-teleconsultation";
    private static final String APPOINTMENT_TYPE_CHECKUP_ID = "appt-checkup";
    private static final String CUSTOMER_JEAN_ID = "customer-jean-dupont";
    private static final String CUSTOMER_EMMA_ID = "customer-emma-leroy";
    private static final String CUSTOMER_INES_ID = "customer-ines-perez";
    private static final String CUSTOMER_MARTIN_ID = "customer-martin-cho";
    private static final String APPOINTMENT_DISCOVERY_ID = "appt-discovery-call";
    private static final String APPOINTMENT_INSTALL_ID = "appt-onsite-install";
    private static final String APPOINTMENT_RIVIERA_WORKSHOP_ID = "appt-riviera-workshop";
    private static final String APPOINTMENT_HELIX_TELECONSULT_ID = "appt-helix-teleconsult";
    private static final String APPOINTMENT_HELIX_CHECKUP_ID = "appt-helix-checkup";
    private static final String APPOINTMENT_AURORA_REVIEW_ID = "appt-aurora-review";
    private static final String USER_PRACTITIONER_ID = "user-practitioner";
    private static final String SUB_AURORA_ID = "sub-aurora-default";
    private static final String SUB_RIVIERA_ID = "sub-riviera-default";
    private static final String SUB_HELIX_ID = "sub-helix-default";
    private static final String SUB_NOVA_ID = "sub-nova-default";
    private static final String SUB_ATLAS_ID = "sub-atlas-default";
    private static final String SUB_LUMEN_ID = "sub-lumen-default";
    private static final String SUB_PULSE_ID = "sub-pulse-default";
    private static final String SUB_TERRA_ID = "sub-terra-default";
    private static final String SUB_ORBIT_ID = "sub-orbit-default";
    private static final String SUB_HORIZON_ID = "sub-horizon-default";
    private static final String SUB_VERTEX_ID = "sub-vertex-default";
    private static final String SUB_MOMENTUM_ID = "sub-momentum-default";
    private static final String SUB_ASTER_ID = "sub-aster-default";
    private static final String PLAN_TRIAL_30D_ID = "plan-trial-30d";
    private static final String PLAN_TRIAL_30D_CODE = "TRIAL_30D";
    private static final String PLAN_TRIAL_180D_ID = "plan-trial-180d";
    private static final String PLAN_TRIAL_180D_CODE = "TRIAL_180D";
    private static final String PLAN_TRIAL_360D_ID = "plan-trial-360d";
    private static final String PLAN_TRIAL_360D_CODE = "TRIAL_360D";
    private static final String PLAN_SUB_MONTHLY_ID = "plan-sub-monthly";
    private static final String PLAN_SUB_MONTHLY_CODE = "SUB_MONTHLY";
    private static final String PLAN_SUB_90D_ID = "plan-sub-90d";
    private static final String PLAN_SUB_90D_CODE = "SUB_90D";
    private static final String PLAN_SUB_180D_ID = "plan-sub-180d";
    private static final String PLAN_SUB_180D_CODE = "SUB_180D";
    private static final String PLAN_SUB_360D_ID = "plan-sub-360d";
    private static final String PLAN_SUB_360D_CODE = "SUB_360D";
    private static final String PLAN_SUB_720D_ID = "plan-sub-720d";
    private static final String PLAN_SUB_720D_CODE = "SUB_720D";

    @Bean
    CommandLineRunner loadReferenceData(
            OrganizationTypeRepository organizationTypeRepository,
            OrganizationRepository organizationRepository,
            PlanRepository planRepository,
            SubscriptionRepository subscriptionRepository,
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
            planRepository.saveAll(buildPlans());
            subscriptionRepository.saveAll(buildSubscriptions());
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
                new OrganizationType(ORG_TYPE_PUBLIC_ID, "Collectivite", "Partenaires publics et collectivites"),
                new OrganizationType(ORG_TYPE_HEALTH_ID, "Sante privee", "Cabinets et reseaux med-tech"),
                new OrganizationType(ORG_TYPE_EDU_ID, "Education et Campus", "Universites, ecoles, academies"),
                new OrganizationType(ORG_TYPE_FIN_ID, "Services Financiers", "Banques, fintechs, assurances"),
                new OrganizationType(ORG_TYPE_NONPROFIT_ID, "Associations", "Fondations, ONG, non-profit"),
                new OrganizationType(ORG_TYPE_HOSPITALITY_ID, "Hospitalite", "Hotels, restauration, loisirs"),
                new OrganizationType(ORG_TYPE_LOGISTICS_ID, "Logistique & Mobilite", "Transport, logistique, mobilite"),
                new OrganizationType(ORG_TYPE_GOV_ID, "Gouvernemental", "Institutions publiques et agences"),
                new OrganizationType(ORG_TYPE_AGRI_ID, "AgriTech", "Cooperatives agricoles, agri-tech"),
                new OrganizationType(ORG_TYPE_DEFENSE_ID, "Defense & Securite", "Organisations de defense et securite"),
                new OrganizationType(ORG_TYPE_MANUFACTURING_ID, "Industrie", "Manufacturing, production, supply chain"),
                new OrganizationType(ORG_TYPE_MEDIA_ID, "Media & Divertissement", "Studios, editeurs, plateformes media")
        );
    }

    private List<Plan> buildPlans() {
        LocalDateTime now = LocalDateTime.now().withNano(0);

        Plan trial30 = new Plan(
                PLAN_TRIAL_30D_ID,
                PLAN_TRIAL_30D_CODE,
                "Trial 30 days",
                "Free 30-day trial (default)",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.MONTHLY,
                30,
                true,
                now
        );
        Plan trial180 = new Plan(
                PLAN_TRIAL_180D_ID,
                PLAN_TRIAL_180D_CODE,
                "Trial 180 days",
                "Extended 180-day trial",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.MONTHLY,
                180,
                true,
                now
        );
        Plan trial360 = new Plan(
                PLAN_TRIAL_360D_ID,
                PLAN_TRIAL_360D_CODE,
                "Trial 360 days",
                "Extended 360-day trial",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.MONTHLY,
                360,
                true,
                now
        );
        Plan subscriptionMonthly = new Plan(
                PLAN_SUB_MONTHLY_ID,
                PLAN_SUB_MONTHLY_CODE,
                "Subscription monthly",
                "Paid subscription billed monthly",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.MONTHLY,
                0,
                true,
                now
        );
        Plan subscription90 = new Plan(
                PLAN_SUB_90D_ID,
                PLAN_SUB_90D_CODE,
                "Subscription 90 days",
                "Prepaid subscription for 90 days",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.ANNUAL,
                0,
                true,
                now
        );
        Plan subscription180 = new Plan(
                PLAN_SUB_180D_ID,
                PLAN_SUB_180D_CODE,
                "Subscription 180 days",
                "Prepaid subscription for 180 days",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.ANNUAL,
                0,
                true,
                now
        );
        Plan subscription360 = new Plan(
                PLAN_SUB_360D_ID,
                PLAN_SUB_360D_CODE,
                "Subscription 360 days",
                "Prepaid subscription for 360 days",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.ANNUAL,
                0,
                true,
                now
        );
        Plan subscription720 = new Plan(
                PLAN_SUB_720D_ID,
                PLAN_SUB_720D_CODE,
                "Subscription 720 days",
                "Prepaid subscription for 720 days",
                BigDecimal.ZERO,
                "EUR",
                BillingCycle.ANNUAL,
                0,
                true,
                now
        );

        return List.of(
                trial30,
                trial180,
                trial360,
                subscriptionMonthly,
                subscription90,
                subscription180,
                subscription360,
                subscription720
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
                "Aurora",
                "Retail & Services",
                ORG_TYPE_RETAIL_ID,
                "+33 1 86 65 00 11",
                hqAddress,
                location,
                scheduleConfig,
                null
        );
        aurora.setCreatedBy("system");
        aurora.setCreatedAt(LocalDateTime.now().minusDays(60));

        Address rivieraAddress = new Address(
                "25 Avenue du Prado",
                "Marseille",
                "Provence-Alpes-Cote d'Azur",
                "13006",
                "France"
        );

        ScheduleConfig rivieraSchedule = defaultScheduleConfig();
        GeoLocation rivieraLocation = new GeoLocation(43.2857, 5.3830);

        Organization riviera = new Organization(
                ORG_RIVIERA_ID,
                "Riviera Community Hub",
                "Riviera",
                "Services publics & culture",
                ORG_TYPE_PUBLIC_ID,
                "+33 4 91 23 45 67",
                rivieraAddress,
                rivieraLocation,
                rivieraSchedule,
                null
        );
        riviera.setCreatedBy("system");
        riviera.setCreatedAt(LocalDateTime.now().minusDays(45));

        Address helixAddress = new Address(
                "7 Rue de la Croix-Rousse",
                "Lyon",
                "Auvergne-Rhone-Alpes",
                "69004",
                "France"
        );

        ScheduleConfig helixSchedule = defaultScheduleConfig();
        helixSchedule.setWorkingDays(EnumSet.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY,
                DayOfWeek.SATURDAY
        ));
        helixSchedule.getBusinessHours().put(
                DayOfWeek.SATURDAY,
                List.of(new TimeWindow(LocalTime.of(9, 0), LocalTime.of(13, 0)))
        );

        GeoLocation helixLocation = new GeoLocation(45.7790, 4.8320);

        Organization helix = new Organization(
                ORG_HELIX_ID,
                "Helix Medical Group",
                "Helix",
                "Sante & bien-etre",
                ORG_TYPE_HEALTH_ID,
                "+33 4 78 22 33 44",
                helixAddress,
                helixLocation,
                helixSchedule,
                null
        );
        helix.setCreatedBy("system");
        helix.setCreatedAt(LocalDateTime.now().minusDays(30));

        Organization nova = new Organization(
                ORG_NOVA_ID,
                "Nova Tech Collective",
                "Nova",
                "Tech & Innovation",
                ORG_TYPE_RETAIL_ID,
                "+33 1 77 22 33 44",
                hqAddress,
                location,
                defaultScheduleConfig(),
                null
        );
        nova.setCreatedBy("user-platform-admin");
        nova.setCreatedAt(LocalDateTime.now().minusDays(5));

        Organization atlas = new Organization(
                ORG_ATLAS_ID,
                "Atlas Services",
                "Atlas",
                "Field Services",
                ORG_TYPE_RETAIL_ID,
                "+33 1 55 66 77 88",
                rivieraAddress,
                rivieraLocation,
                defaultScheduleConfig(),
                null
        );
        atlas.setCreatedBy("user-platform-admin");
        atlas.setCreatedAt(LocalDateTime.now().minusDays(4));

        Organization lumen = new Organization(
                ORG_LUMEN_ID,
                "Lumen Digital",
                "Lumen",
                "Digital Care",
                ORG_TYPE_HEALTH_ID,
                "+33 1 22 33 44 55",
                helixAddress,
                helixLocation,
                defaultScheduleConfig(),
                null
        );
        lumen.setCreatedBy("user-platform-admin");
        lumen.setCreatedAt(LocalDateTime.now().minusDays(3));

        Organization pulse = new Organization(
                ORG_PULSE_ID,
                "Pulse Care",
                "Pulse",
                "Preventive Health",
                ORG_TYPE_HEALTH_ID,
                "+33 1 88 66 44 22",
                hqAddress,
                location,
                defaultScheduleConfig(),
                null
        );
        pulse.setCreatedBy("user-platform-admin");
        pulse.setCreatedAt(LocalDateTime.now().minusDays(2));

        Organization terra = new Organization(
                ORG_TERRA_ID,
                "Terra Green Alliance",
                "Terra",
                "Sustainability",
                ORG_TYPE_PUBLIC_ID,
                "+33 1 90 80 70 60",
                rivieraAddress,
                rivieraLocation,
                defaultScheduleConfig(),
                null
        );
        terra.setCreatedBy("user-platform-admin");
        terra.setCreatedAt(LocalDateTime.now().minusDays(7));

        Organization orbit = new Organization(
                ORG_ORBIT_ID,
                "Orbit Connect",
                "Orbit",
                "Connectivity",
                ORG_TYPE_RETAIL_ID,
                "+33 1 45 46 47 48",
                hqAddress,
                location,
                defaultScheduleConfig(),
                null
        );
        orbit.setCreatedBy("user-platform-admin");
        orbit.setCreatedAt(LocalDateTime.now().minusDays(6));

        Organization horizon = new Organization(
                ORG_HORIZON_ID,
                "Horizon Consulting",
                "Horizon",
                "Advisory",
                ORG_TYPE_PUBLIC_ID,
                "+33 1 11 22 33 44",
                helixAddress,
                helixLocation,
                defaultScheduleConfig(),
                null
        );
        horizon.setCreatedBy("user-platform-admin");
        horizon.setCreatedAt(LocalDateTime.now().minusDays(8));

        Organization vertex = new Organization(
                ORG_VERTEX_ID,
                "Vertex Solutions",
                "Vertex",
                "Enterprise Services",
                ORG_TYPE_RETAIL_ID,
                "+33 1 33 44 55 66",
                hqAddress,
                location,
                defaultScheduleConfig(),
                null
        );
        vertex.setCreatedBy("user-platform-admin");
        vertex.setCreatedAt(LocalDateTime.now().minusDays(9));

        Organization momentum = new Organization(
                ORG_MOMENTUM_ID,
                "Momentum Labs",
                "Momentum",
                "Research",
                ORG_TYPE_HEALTH_ID,
                "+33 1 99 88 77 66",
                rivieraAddress,
                rivieraLocation,
                defaultScheduleConfig(),
                null
        );
        momentum.setCreatedBy("user-platform-admin");
        momentum.setCreatedAt(LocalDateTime.now().minusDays(12));

        Organization aster = new Organization(
                ORG_ASTER_ID,
                "Aster Network",
                "Aster",
                "Community",
                ORG_TYPE_PUBLIC_ID,
                "+33 1 66 77 88 99",
                hqAddress,
                location,
                defaultScheduleConfig(),
                null
        );
        aster.setCreatedBy("user-platform-admin");
        aster.setCreatedAt(LocalDateTime.now().minusDays(10));

        return List.of(
                aurora,
                riviera,
                helix,
                nova,
                atlas,
                lumen,
                pulse,
                terra,
                orbit,
                horizon,
                vertex,
                momentum,
                aster
        );
    }

    private List<Subscription> buildSubscriptions() {
        LocalDateTime now = LocalDateTime.now();
        Subscription aurora = new Subscription(
                SUB_AURORA_ID,
                ORG_AURORA_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(10),
                now.plusMonths(6),
                "system",
                now.minusDays(10)
        );
        Subscription riviera = new Subscription(
                SUB_RIVIERA_ID,
                ORG_RIVIERA_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.TRIAL,
                now.minusDays(5),
                now.plusDays(20),
                "system",
                now.minusDays(5)
        );
        Subscription helix = new Subscription(
                SUB_HELIX_ID,
                ORG_HELIX_ID,
                PLAN_TRIAL_180D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(3),
                now.plusMonths(12),
                "system",
                now.minusDays(3)
        );
        Subscription nova = new Subscription(
                SUB_NOVA_ID,
                ORG_NOVA_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription atlas = new Subscription(
                SUB_ATLAS_ID,
                ORG_ATLAS_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription lumen = new Subscription(
                SUB_LUMEN_ID,
                ORG_LUMEN_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription pulse = new Subscription(
                SUB_PULSE_ID,
                ORG_PULSE_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription terra = new Subscription(
                SUB_TERRA_ID,
                ORG_TERRA_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription orbit = new Subscription(
                SUB_ORBIT_ID,
                ORG_ORBIT_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription horizon = new Subscription(
                SUB_HORIZON_ID,
                ORG_HORIZON_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription vertex = new Subscription(
                SUB_VERTEX_ID,
                ORG_VERTEX_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription momentum = new Subscription(
                SUB_MOMENTUM_ID,
                ORG_MOMENTUM_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        Subscription aster = new Subscription(
                SUB_ASTER_ID,
                ORG_ASTER_ID,
                PLAN_TRIAL_30D_CODE,
                SubscriptionStatus.ACTIVE,
                now.minusDays(2),
                now.plusMonths(3),
                "user-platform-admin",
                now.minusDays(2)
        );
        return List.of(
                aurora,
                riviera,
                helix,
                nova,
                atlas,
                lumen,
                pulse,
                terra,
                orbit,
                horizon,
                vertex,
                momentum,
                aster
        );
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
                true,
                ResourceKind.ASSET,
                null
        );

        Resource onsiteCrew = new Resource(
                RESOURCE_ONSITE_CREW_ID,
                ORG_AURORA_ID,
                "Docteur Emma Leroy",
                "field",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_INSTALLATION_ID)),
                saturdayOverride,
                1,
                true,
                ResourceKind.HUMAN,
                USER_PRACTITIONER_ID
        );

        ScheduleConfig rivieraWorkshopSchedule = defaultScheduleConfig();
        rivieraWorkshopSchedule.setWorkingDays(EnumSet.of(
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY,
                DayOfWeek.SATURDAY
        ));
        rivieraWorkshopSchedule.getBusinessHours().put(
                DayOfWeek.SATURDAY,
                List.of(new TimeWindow(LocalTime.of(10, 0), LocalTime.of(14, 0)))
        );

        Resource workshopHall = new Resource(
                RESOURCE_RIVIERA_HALL_ID,
                ORG_RIVIERA_ID,
                "Salle Atelier Mediterranee",
                "community-hall",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_WORKSHOP_ID)),
                rivieraWorkshopSchedule,
                15,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource novaRoom = new Resource(
                RESOURCE_NOVA_ROOM_ID,
                ORG_NOVA_ID,
                "Nova Training Room",
                "indoor",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CONSULTATION_ID, APPOINTMENT_TYPE_WORKSHOP_ID)),
                defaultScheduleConfig(),
                10,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource atlasFleet = new Resource(
                RESOURCE_ATLAS_FLEET_ID,
                ORG_ATLAS_ID,
                "Atlas Mobile Crew",
                "field",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_INSTALLATION_ID)),
                defaultScheduleConfig(),
                2,
                true,
                ResourceKind.HUMAN,
                null
        );

        Resource lumenLab = new Resource(
                RESOURCE_LUMEN_LAB_ID,
                ORG_LUMEN_ID,
                "Lumen Diagnostic Lab",
                "lab",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CHECKUP_ID)),
                defaultScheduleConfig(),
                4,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource pulseClinic = new Resource(
                RESOURCE_PULSE_CLINIC_ID,
                ORG_PULSE_ID,
                "Pulse Clinic Room A",
                "clinic",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CHECKUP_ID, APPOINTMENT_TYPE_TELECONSULT_ID)),
                defaultScheduleConfig(),
                3,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource terraField = new Resource(
                RESOURCE_TERRA_FIELD_ID,
                ORG_TERRA_ID,
                "Terra Outreach Team",
                "field",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_INSTALLATION_ID, APPOINTMENT_TYPE_WORKSHOP_ID)),
                defaultScheduleConfig(),
                5,
                true,
                ResourceKind.HUMAN,
                null
        );

        Resource orbitStation = new Resource(
                RESOURCE_ORBIT_STATION_ID,
                ORG_ORBIT_ID,
                "Orbit Support Station",
                "support",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CONSULTATION_ID)),
                defaultScheduleConfig(),
                6,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource horizonSuite = new Resource(
                RESOURCE_HORIZON_SUITE_ID,
                ORG_HORIZON_ID,
                "Horizon Executive Suite",
                "consulting",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CONSULTATION_ID)),
                defaultScheduleConfig(),
                2,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource vertexHq = new Resource(
                RESOURCE_VERTEX_HQ_ID,
                ORG_VERTEX_ID,
                "Vertex HQ Boardroom",
                "consulting",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CONSULTATION_ID, APPOINTMENT_TYPE_WORKSHOP_ID)),
                defaultScheduleConfig(),
                12,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource momentumPod = new Resource(
                RESOURCE_MOMENTUM_POD_ID,
                ORG_MOMENTUM_ID,
                "Momentum Research Pod",
                "lab",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_CHECKUP_ID)),
                defaultScheduleConfig(),
                1,
                true,
                ResourceKind.ASSET,
                null
        );

        Resource asterCommunity = new Resource(
                RESOURCE_ASTER_COMMUNITY_ID,
                ORG_ASTER_ID,
                "Aster Community Room",
                "community",
                new HashSet<>(Set.of(APPOINTMENT_TYPE_WORKSHOP_ID)),
                defaultScheduleConfig(),
                20,
                true,
                ResourceKind.ASSET,
                null
        );

        return List.of(
                crmDesk,
                onsiteCrew,
                workshopHall,
                novaRoom,
                atlasFleet,
                lumenLab,
                pulseClinic,
                terraField,
                orbitStation,
                horizonSuite,
                vertexHq,
                momentumPod,
                asterCommunity
        );
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

        AppointmentType communityWorkshop = new AppointmentType(
                APPOINTMENT_TYPE_WORKSHOP_ID,
                ORG_RIVIERA_ID,
                "Atelier citoyen",
                "Engagement",
                60,
                List.of(45, 60, 90),
                true,
                true,
                EnumSet.of(
                        DayOfWeek.TUESDAY,
                        DayOfWeek.WEDNESDAY,
                        DayOfWeek.THURSDAY,
                        DayOfWeek.SATURDAY
                ),
                businessHoursTemplate()
        );

        AppointmentType teleconsultation = new AppointmentType(
                APPOINTMENT_TYPE_TELECONSULT_ID,
                ORG_HELIX_ID,
                "Teleconsultation",
                "Sante",
                45,
                List.of(30, 45, 60),
                false,
                true,
                EnumSet.of(
                        DayOfWeek.MONDAY,
                        DayOfWeek.TUESDAY,
                        DayOfWeek.WEDNESDAY,
                        DayOfWeek.THURSDAY,
                        DayOfWeek.FRIDAY,
                        DayOfWeek.SATURDAY
                ),
                businessHoursTemplate()
        );

        AppointmentType preventiveCheckup = new AppointmentType(
                APPOINTMENT_TYPE_CHECKUP_ID,
                ORG_HELIX_ID,
                "Bilan preventif",
                "Suivi",
                30,
                List.of(30, 45),
                false,
                true,
                EnumSet.of(
                        DayOfWeek.MONDAY,
                        DayOfWeek.TUESDAY,
                        DayOfWeek.THURSDAY,
                        DayOfWeek.FRIDAY
                ),
                businessHoursTemplate()
        );

        return List.of(consultation, installation, communityWorkshop, teleconsultation, preventiveCheckup);
    }

    private List<Customer> buildCustomers() {
        LocalDateTime now = LocalDateTime.now();
        List<CustomerInteraction> jeanInteractions = List.of(
                new CustomerInteraction(
                        "interaction-jean-1",
                        APPOINTMENT_DISCOVERY_ID,
                        AppointmentEventType.CUSTOMER_COMMENT,
                        AppointmentStatus.SCHEDULED,
                        "Preference pour les creneaux du matin",
                        "jean.dupont@example.com",
                        now.minusDays(5)
                )
        );

        Customer jean = new Customer(
                CUSTOMER_JEAN_ID,
                ORG_AURORA_ID,
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
                ORG_AURORA_ID,
                "Leroy",
                "Emma",
                "emma.leroy@example.com",
                "+33 6 77 88 22 11",
                "Projet d'extension Q4",
                LocalDate.of(1992, 7, 9),
                new ArrayList<>()
        );

        List<CustomerInteraction> inesInteractions = List.of(
                new CustomerInteraction(
                        "interaction-ines-1",
                        APPOINTMENT_RIVIERA_WORKSHOP_ID,
                        AppointmentEventType.CUSTOMER_UPDATE,
                        AppointmentStatus.SCHEDULED,
                        "Demande d'accessibilite PMR",
                        "ines.perez@riviera.fr",
                        now.minusDays(3)
                )
        );

        Customer ines = new Customer(
                CUSTOMER_INES_ID,
                ORG_RIVIERA_ID,
                "Perez",
                "Ines",
                "ines.perez@riviera.fr",
                "+33 6 98 11 22 80",
                "Participante active aux ateliers citoyens",
                LocalDate.of(1984, 11, 3),
                inesInteractions
        );

        List<CustomerInteraction> martinInteractions = List.of(
                new CustomerInteraction(
                        "interaction-martin-1",
                        APPOINTMENT_HELIX_TELECONSULT_ID,
                        AppointmentEventType.CUSTOMER_COMMENT,
                        AppointmentStatus.SCHEDULED,
                        "Prefere la visio matinale",
                        "martin.cho@helix.fr",
                        now.minusDays(2)
                )
        );

        Customer martin = new Customer(
                CUSTOMER_MARTIN_ID,
                ORG_HELIX_ID,
                "Cho",
                "Martin",
                "martin.cho@helix.fr",
                "+33 7 88 66 55 33",
                "Patient suivi pour bilan annuel",
                LocalDate.of(1990, 4, 11),
                martinInteractions
        );

        return List.of(jean, emma, ines, martin);
    }

    private List<User> buildUsers() {
        String encodedPassword = passwordEncoder.encode(DEFAULT_USER_PASSWORD);
        String ilyesPassword = passwordEncoder.encode("Nac456*l");
        User platformAdmin = new User(
                "user-platform-admin",
                "nabil.haddad",
                "Nabil",
                "Haddad",
                "nabil.haddad@example.com",
                encodedPassword,
                EnumSet.of(UserRole.PLATFORM_ADMIN),
                null,
                UserStatus.ACTIVE,
                LocalDateTime.now().plusMonths(6),
                LocalDateTime.now().minusDays(28)
        );
        User orgAdmin = new User(
                "user-org-admin",
                "sophie.bernard",
                "Sophie",
                "Bernard",
                "sophie.bernard@example.com",
                encodedPassword,
                EnumSet.of(UserRole.ORGANIZATION_ADMIN),
                ORG_AURORA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(20)
        );
        User serviceManager = new User(
                "user-service-manager",
                "alex.martin",
                "Alex",
                "Martin",
                "alex.martin@example.com",
                encodedPassword,
                EnumSet.of(UserRole.SERVICE_MANAGER),
                ORG_AURORA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(15)
        );
        User agent = new User(
                "user-agent",
                "naima.khelifi",
                "Naima",
                "Khelifi",
                "naima.khelifi@example.com",
                encodedPassword,
                EnumSet.of(UserRole.AGENT),
                ORG_AURORA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(10)
        );
        User auditor = new User(
                "user-auditor",
                "luc.nguyen",
                "Luc",
                "Nguyen",
                "luc.nguyen@example.com",
                encodedPassword,
                EnumSet.of(UserRole.AUDITOR),
                ORG_AURORA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(25)
        );
        User practitioner = new User(
                USER_PRACTITIONER_ID,
                "emma.leroy",
                "Emma",
                "Leroy",
                "emma.leroy@example.com",
                encodedPassword,
                EnumSet.of(UserRole.PRACTITIONER),
                ORG_AURORA_ID,
                UserStatus.ACTIVE,
                LocalDateTime.now().plusDays(90),
                LocalDateTime.now().minusDays(5)
        );
        User ilyesSuperAdmin = new User(
                "user-super-admin-aitbelkacem",
                "aitbelakcemi",
                "Ilyes",
                "Ait Belkacem",
                "aitbelkacem.lyes@gmail.com",
                ilyesPassword,
                EnumSet.of(UserRole.SUPER_PLATFORM_ADMIN),
                null,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(40)
        );
        User rivieraOrgAdmin = new User(
                "user-org-admin-riviera",
                "lea.fontaine",
                "Lea",
                "Fontaine",
                "lea.fontaine@riviera.fr",
                encodedPassword,
                EnumSet.of(UserRole.ORGANIZATION_ADMIN),
                ORG_RIVIERA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(18)
        );
        User rivieraServiceManager = new User(
                "user-service-manager-riviera",
                "mohamed.benali",
                "Mohamed",
                "Benali",
                "mohamed.benali@riviera.fr",
                encodedPassword,
                EnumSet.of(UserRole.SERVICE_MANAGER),
                ORG_RIVIERA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(12)
        );
        User rivieraAgent = new User(
                "user-agent-riviera",
                "chloe.perrin",
                "Chloe",
                "Perrin",
                "chloe.perrin@riviera.fr",
                encodedPassword,
                EnumSet.of(UserRole.AGENT),
                ORG_RIVIERA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(7)
        );
        User rivieraAuditor = new User(
                "user-auditor-riviera",
                "antoine.gillet",
                "Antoine",
                "Gillet",
                "antoine.gillet@riviera.fr",
                encodedPassword,
                EnumSet.of(UserRole.AUDITOR),
                ORG_RIVIERA_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(21)
        );
        User rivieraPractitioner = new User(
                "user-practitioner-riviera",
                "julie.ferre",
                "Julie",
                "Ferre",
                "julie.ferre@riviera.fr",
                encodedPassword,
                EnumSet.of(UserRole.PRACTITIONER),
                ORG_RIVIERA_ID,
                UserStatus.ACTIVE,
                LocalDateTime.now().plusMonths(5),
                LocalDateTime.now().minusDays(6)
        );
        User helixOrgAdmin = new User(
                "user-org-admin-helix",
                "david.morel",
                "David",
                "Morel",
                "david.morel@helix.health",
                encodedPassword,
                EnumSet.of(UserRole.ORGANIZATION_ADMIN),
                ORG_HELIX_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(17)
        );
        User helixServiceManager = new User(
                "user-service-manager-helix",
                "pauline.renard",
                "Pauline",
                "Renard",
                "pauline.renard@helix.health",
                encodedPassword,
                EnumSet.of(UserRole.SERVICE_MANAGER),
                ORG_HELIX_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(9)
        );
        User helixAgent = new User(
                "user-agent-helix",
                "marc.diallo",
                "Marc",
                "Diallo",
                "marc.diallo@helix.health",
                encodedPassword,
                EnumSet.of(UserRole.AGENT),
                ORG_HELIX_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(4)
        );
        User helixAuditor = new User(
                "user-auditor-helix",
                "ines.rahman",
                "Ines",
                "Rahman",
                "ines.rahman@helix.health",
                encodedPassword,
                EnumSet.of(UserRole.AUDITOR),
                ORG_HELIX_ID,
                UserStatus.ACTIVE,
                null,
                LocalDateTime.now().minusDays(26)
        );
        User helixPractitioner = new User(
                "user-practitioner-helix",
                "samuel.lacroix",
                "Samuel",
                "Lacroix",
                "samuel.lacroix@helix.health",
                encodedPassword,
                EnumSet.of(UserRole.PRACTITIONER),
                ORG_HELIX_ID,
                UserStatus.ACTIVE,
                LocalDateTime.now().plusMonths(3),
                LocalDateTime.now().minusDays(5)
        );
        return List.of(
                platformAdmin,
                orgAdmin,
                serviceManager,
                agent,
                auditor,
                practitioner,
                ilyesSuperAdmin,
                rivieraOrgAdmin,
                rivieraServiceManager,
                rivieraAgent,
                rivieraAuditor,
                rivieraPractitioner,
                helixOrgAdmin,
                helixServiceManager,
                helixAgent,
                helixAuditor,
                helixPractitioner
        );
    }

    private List<Appointment> buildAppointments() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        List<AppointmentEvent> discoveryEvents = List.of(
                new AppointmentEvent(
                        "appt-event-1",
                        AppointmentEventType.INTERNAL_NOTE,
                        AppointmentStatus.SCHEDULED,
                        "Creation automatique du rendez-vous",
                        "system",
                        now
                ),
                new AppointmentEvent(
                        "appt-event-1b",
                        AppointmentEventType.CUSTOMER_UPDATE,
                        AppointmentStatus.SCHEDULED,
                        "Client partage les documents de cadrage",
                        "jean.dupont@example.com",
                        now.plusHours(2)
                )
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
                discoveryEvents
        );

        List<AppointmentEvent> installEvents = List.of(
                new AppointmentEvent(
                        "appt-event-2",
                        AppointmentEventType.CUSTOMER_UPDATE,
                        AppointmentStatus.SCHEDULED,
                        "Client confirme la presence d'un acces electrique",
                        "emma.leroy@example.com",
                        now.plusDays(1)
                ),
                new AppointmentEvent(
                        "appt-event-2b",
                        AppointmentEventType.INTERNAL_NOTE,
                        AppointmentStatus.SCHEDULED,
                        "Equipe terrain valide la planification",
                        "alex.martin@example.com",
                        now.plusDays(1).plusHours(3)
                )
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
                installEvents
        );

        List<AppointmentEvent> auroraReviewEvents = List.of(
                new AppointmentEvent(
                        "appt-event-3",
                        AppointmentEventType.INTERNAL_NOTE,
                        AppointmentStatus.SCHEDULED,
                        "Preparation renouvellement contrat",
                        "alex.martin@example.com",
                        now.plusDays(3)
                ),
                new AppointmentEvent(
                        "appt-event-3b",
                        AppointmentEventType.CUSTOMER_COMMENT,
                        AppointmentStatus.SCHEDULED,
                        "Client demande un focus sur le support",
                        "naima.khelifi@example.com",
                        now.plusDays(3).plusHours(1)
                )
        );

        Appointment auroraContractReview = new Appointment(
                APPOINTMENT_AURORA_REVIEW_ID,
                ORG_AURORA_ID,
                CUSTOMER_JEAN_ID,
                APPOINTMENT_TYPE_CONSULTATION_ID,
                RESOURCE_CRM_DESK_ID,
                now.plusDays(7).withHour(11).withMinute(0),
                now.plusDays(7).withHour(11).withMinute(45),
                AppointmentStatus.SCHEDULED,
                "Revue de contrat et upsell",
                auroraReviewEvents
        );

        List<AppointmentEvent> workshopEvents = List.of(
                new AppointmentEvent(
                        "appt-event-4",
                        AppointmentEventType.INTERNAL_NOTE,
                        AppointmentStatus.SCHEDULED,
                        "Atelier programme avec la mairie",
                        "lea.fontaine@riviera.fr",
                        now.plusDays(6)
                ),
                new AppointmentEvent(
                        "appt-event-4b",
                        AppointmentEventType.CUSTOMER_UPDATE,
                        AppointmentStatus.SCHEDULED,
                        "Participants confirment l'acces wifi",
                        "ines.perez@riviera.fr",
                        now.plusDays(6).plusHours(2)
                )
        );

        Appointment rivieraWorkshop = new Appointment(
                APPOINTMENT_RIVIERA_WORKSHOP_ID,
                ORG_RIVIERA_ID,
                CUSTOMER_INES_ID,
                APPOINTMENT_TYPE_WORKSHOP_ID,
                RESOURCE_RIVIERA_HALL_ID,
                now.plusDays(9).withHour(15).withMinute(0),
                now.plusDays(9).withHour(16).withMinute(30),
                AppointmentStatus.SCHEDULED,
                "Atelier citoyen numerique",
                workshopEvents
        );

        List<AppointmentEvent> teleconsultEvents = List.of(
                new AppointmentEvent(
                        "appt-event-5",
                        AppointmentEventType.INTERNAL_NOTE,
                        AppointmentStatus.SCHEDULED,
                        "Ouverture du dossier patient",
                        "samuel.lacroix@helix.health",
                        now.plusDays(2)
                ),
                new AppointmentEvent(
                        "appt-event-5b",
                        AppointmentEventType.CUSTOMER_COMMENT,
                        AppointmentStatus.SCHEDULED,
                        "Patient confirme la compatibilite audio",
                        "martin.cho@helix.fr",
                        now.plusDays(2).plusHours(1)
                )
        );

        Appointment helixTeleconsult = new Appointment(
                APPOINTMENT_HELIX_TELECONSULT_ID,
                ORG_HELIX_ID,
                CUSTOMER_MARTIN_ID,
                APPOINTMENT_TYPE_TELECONSULT_ID,
                null,
                now.plusDays(4).withHour(8).withMinute(30),
                now.plusDays(4).withHour(9).withMinute(15),
                AppointmentStatus.SCHEDULED,
                "Teleconsultation de suivi",
                teleconsultEvents
        );

        List<AppointmentEvent> checkupEvents = List.of(
                new AppointmentEvent(
                        "appt-event-6",
                        AppointmentEventType.INTERNAL_NOTE,
                        AppointmentStatus.SCHEDULED,
                        "Bilan annuel programme",
                        "pauline.renard@helix.health",
                        now.plusDays(12)
                ),
                new AppointmentEvent(
                        "appt-event-6b",
                        AppointmentEventType.CUSTOMER_UPDATE,
                        AppointmentStatus.SCHEDULED,
                        "Patient ajoute ses documents",
                        "martin.cho@helix.fr",
                        now.plusDays(12).plusHours(4)
                )
        );

        Appointment helixCheckup = new Appointment(
                APPOINTMENT_HELIX_CHECKUP_ID,
                ORG_HELIX_ID,
                CUSTOMER_MARTIN_ID,
                APPOINTMENT_TYPE_CHECKUP_ID,
                null,
                now.plusDays(15).withHour(10).withMinute(0),
                now.plusDays(15).withHour(10).withMinute(45),
                AppointmentStatus.SCHEDULED,
                "Bilan preventif annuel",
                checkupEvents
        );

        return List.of(
                discoveryCall,
                onsiteInstall,
                auroraContractReview,
                rivieraWorkshop,
                helixTeleconsult,
                helixCheckup
        );
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
