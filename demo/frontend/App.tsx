import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { useCallback, useEffect, useMemo, useState } from 'react';

type LoginFormState = {
  identifier: string;
  password: string;
  remember: boolean;
};

type FormErrors = {
  email?: string;
  password?: string;
};

type InputFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'email' | 'password';
};

type PrimaryButtonProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

type DayName = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

type TimeWindowInput = { start: string; end: string };

type HolidayInput = {
  date: string;
  allDay: boolean;
  closedWindows: TimeWindowInput[];
  description: string;
};

type ScheduleConfigDto = {
  workingDays?: DayName[];
  businessHours?: Record<DayName, TimeWindowInput[]>;
  breaks?: Record<DayName, TimeWindowInput[]>;
  holidays?: HolidayInput[];
};

type ScheduleFormState = {
  workingDays: DayName[];
  businessHours: Record<DayName, TimeWindowInput[]>;
  breaks: Record<DayName, TimeWindowInput[]>;
  holidays: HolidayInput[];
};

type Organization = {
  id?: string;
  name: string;
  marketingName?: string;
  industry?: string;
  type: string;
  phone?: string;
  databaseName?: string;
  createdBy?: string;
  scheduleConfig?: ScheduleConfigDto;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type OrganizationType = {
  id?: string;
  name: string;
  description?: string;
};

type OrgFormState = {
  id?: string | null;
  name: string;
  marketingName: string;
  industry: string;
  type: string;
  phone: string;
  databaseName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
};

type UserRole =
  | 'SUPER_PLATFORM_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'SERVICE_MANAGER'
  | 'AGENT'
  | 'AUDITOR'
  | 'PRACTITIONER';
type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'BLOCKED';

type User = {
  id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roles: UserRole[];
  homeOrganizationId?: string;
  status?: UserStatus;
  expiresAt?: string;
  createdAt?: string;
};

type UserFormState = {
  id?: string | null;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: UserRole[];
  homeOrganizationId: string;
  status: UserStatus;
  expiresAt: string;
};

type CustomerInteraction = {
  id?: string;
  appointmentId?: string;
  type?: 'CUSTOMER_COMMENT' | 'CUSTOMER_CANCEL' | 'CUSTOMER_UPDATE' | 'INTERNAL_NOTE' | 'PRACTITIONER_NOTE';
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  comment?: string;
  createdBy?: string;
  createdAt?: string;
};

type Customer = {
  id?: string;
  orgId?: string;
  name?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  dateOfBirth?: string;
  interactions?: CustomerInteraction[];
};

type CustomerFormState = {
  id?: string | null;
  orgId: string;
  name: string;
  firstName: string;
  email: string;
  phone: string;
  notes: string;
  dateOfBirth: string;
};

type CustomerInteractionFormState = {
  id?: string | null;
  type: NonNullable<CustomerInteraction['type']>;
  status: NonNullable<CustomerInteraction['status']>;
  comment: string;
  appointmentId: string;
  createdBy: string;
  createdAt: string;
};

type TabKey =
  | 'orgs'
  | 'types'
  | 'schedule'
  | 'users'
  | 'customers'
  | 'resources'
  | 'appointments'
  | 'appointmentTypes';

type Resource = {
  id?: string;
  orgId?: string;
  name?: string;
  type?: string;
  allowedAppointmentTypeIds?: string[];
  capacity?: number;
  active?: boolean;
  kind?: 'HUMAN' | 'ASSET';
  practitionerUserId?: string;
};

type ResourceFormState = {
  id?: string | null;
  orgId: string;
  name: string;
  type: string;
  allowedAppointmentTypeIds: string;
  capacity: string;
  active: boolean;
  kind: 'HUMAN' | 'ASSET';
  practitionerUserId: string;
};

type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
type AppointmentEventType =
  | 'CUSTOMER_COMMENT'
  | 'CUSTOMER_CANCEL'
  | 'CUSTOMER_UPDATE'
  | 'INTERNAL_NOTE'
  | 'PRACTITIONER_NOTE';

type AppointmentEvent = {
  id?: string;
  type?: AppointmentEventType;
  status?: AppointmentStatus;
  comment?: string;
  createdBy?: string;
  createdAt?: string;
};

type Appointment = {
  id?: string;
  orgId?: string;
  customerId?: string;
  resourceId?: string;
  appointmentTypeId?: string;
  start?: string;
  end?: string;
  status?: AppointmentStatus;
  events?: AppointmentEvent[];
};

type AppointmentFormState = {
  id?: string | null;
  orgId: string;
  customerId: string;
  resourceId: string;
  appointmentTypeId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
};

type AppointmentEventFormState = {
  id?: string | null;
  type: AppointmentEventType;
  status: AppointmentStatus;
  comment: string;
  createdBy: string;
  createdAt: string;
};

type AppointmentTypeDto = {
  id?: string;
  orgId?: string;
  name?: string;
  category?: string;
  defaultDurationMinutes?: number;
  allowedDurations?: number[];
  requiresResource?: boolean;
  active?: boolean;
};

type AppointmentTypeFormState = {
  id?: string | null;
  orgId: string;
  name: string;
  category: string;
  defaultDurationMinutes: string;
  allowedDurations: string;
  requiresResource: boolean;
  active: boolean;
};

const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const inferLocalApiBase = () => {
  const hostUri =
    (Constants as any).expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.debuggerHost;

  if (!hostUri || typeof hostUri !== 'string') {
    return null;
  }
  const host = hostUri.split(':')[0];
  return host ? `http://${host}:8080` : null;
};

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE || inferLocalApiBase() || DEFAULT_API_BASE).replace(
  /\/$/,
  '',
);
const LOGIN_ENDPOINT = `${API_BASE}/api/auth/token`;
const DAY_NAMES: DayName[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<DayName, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};
const USER_ROLES: UserRole[] = [
  'SUPER_PLATFORM_ADMIN',
  'PLATFORM_ADMIN',
  'ORGANIZATION_ADMIN',
  'SERVICE_MANAGER',
  'AGENT',
  'AUDITOR',
  'PRACTITIONER',
];
const PLATFORM_ROLES: UserRole[] = ['SUPER_PLATFORM_ADMIN', 'PLATFORM_ADMIN'];
const USER_STATUSES: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'BLOCKED'];
const INTERACTION_TYPES: CustomerInteractionFormState['type'][] = [
  'CUSTOMER_COMMENT',
  'CUSTOMER_CANCEL',
  'CUSTOMER_UPDATE',
  'INTERNAL_NOTE',
  'PRACTITIONER_NOTE',
];
const INTERACTION_STATUSES: CustomerInteractionFormState['status'][] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
const RESOURCE_KINDS: ResourceFormState['kind'][] = ['HUMAN', 'ASSET'];
const APPOINTMENT_STATUSES: AppointmentStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
const APPOINTMENT_EVENT_TYPES: AppointmentEventFormState['type'][] = [
  'CUSTOMER_COMMENT',
  'CUSTOMER_CANCEL',
  'CUSTOMER_UPDATE',
  'INTERNAL_NOTE',
  'PRACTITIONER_NOTE',
];

function decodeRolesFromToken(token: string): UserRole[] {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const base = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base + '='.repeat((4 - (base.length % 4 || 4)) % 4);
    const decoded = typeof globalThis.atob === 'function' ? globalThis.atob(padded) : '';
    if (!decoded) return [];
    const payload = JSON.parse(decoded) as { roles?: unknown };
    if (!Array.isArray(payload.roles)) return [];
    return payload.roles.filter((role): role is UserRole => typeof role === 'string');
  } catch {
    return [];
  }
}
const APPOINTMENT_TYPE_STATUSES = ['active'];

const emptyDayMap = () =>
  DAY_NAMES.reduce(
    (acc, day) => {
      acc[day] = [];
      return acc;
    },
    {} as Record<DayName, TimeWindowInput[]>,
  );

const defaultScheduleForm = (): ScheduleFormState => {
  const businessHours = emptyDayMap();
  const breaks = emptyDayMap();
  DAY_NAMES.forEach((day) => {
    businessHours[day] =
      day === 'SATURDAY' || day === 'SUNDAY' ? [] : [{ start: '09:00', end: '17:00' }];
    breaks[day] = day === 'SATURDAY' || day === 'SUNDAY' ? [] : [{ start: '12:00', end: '13:00' }];
  });
  return {
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    businessHours,
    breaks,
    holidays: [],
  };
};

const normalizeScheduleForm = (config?: ScheduleConfigDto): ScheduleFormState => {
  if (!config) return defaultScheduleForm();
  const defaults = defaultScheduleForm();
  const businessHours = emptyDayMap();
  const breaks = emptyDayMap();
  DAY_NAMES.forEach((day) => {
    businessHours[day] = (config.businessHours?.[day] ?? []).map((tw) => ({
      start: tw?.start || '',
      end: tw?.end || '',
    }));
    breaks[day] = (config.breaks?.[day] ?? []).map((tw) => ({
      start: tw?.start || '',
      end: tw?.end || '',
    }));
  });

  return {
    workingDays: (config.workingDays && config.workingDays.length > 0 ? config.workingDays : defaults.workingDays) as DayName[],
    businessHours,
    breaks,
    holidays: (config.holidays ?? []).map((h) => ({
      date: h?.date || '',
      allDay: h?.allDay ?? true,
      description: h?.description || '',
      closedWindows: (h?.closedWindows ?? []).map((tw) => ({
        start: tw?.start || '',
        end: tw?.end || '',
      })),
    })),
  };
};

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoComplete,
}: InputFieldProps) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(107,114,128,0.55)"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={autoComplete === 'password' ? 'password' : 'emailAddress'}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function PrimaryButton({ label, disabled, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <LinearGradient
        colors={['#1D4ED8', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const parseErrorMessage = async (response: Response) => {
  const bodyText = await response.text();
  if (!bodyText) {
    return `Request failed (${response.status})`;
  }
  try {
    const parsed = JSON.parse(bodyText);
    if (typeof parsed === 'object' && parsed !== null) {
      return (
        (parsed as { message?: string; error?: string }).message ||
        (parsed as { message?: string; error?: string }).error ||
        bodyText
      );
    }
  } catch {
    // not JSON
  }
  return bodyText;
};

function LoginScreen({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const [form, setForm] = useState<LoginFormState>({
    identifier: '',
    password: '',
    remember: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.identifier.trim()) {
      nextErrors.email = 'Enter your email or username.';
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setStatus(null);
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus('Checking credentials...');

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        setStatus(message || 'Unable to sign in.');
        return;
      }

      const data = (await response.json()) as { token?: string };
      if (!data.token) {
        setStatus('Signed in, but no token was returned.');
        return;
      }

      setStatus('Signed in. Redirecting to admin...');
      onAuthenticated(data.token);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.centered}
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Unified Access</Text>
        </View>
        <Text style={styles.title}>Sign in once, stay synced everywhere.</Text>
        <Text style={styles.subtitle}>
          SUPER_PLATFORM_ADMIN can jump straight into org management after logging in.
        </Text>
      </View>

      <View style={styles.card}>
        <InputField
          label="Email or username"
          placeholder="you@company.com or username"
          value={form.identifier}
          onChangeText={(identifier) => setForm((prev) => ({ ...prev, identifier }))}
          error={errors.email}
          keyboardType="email-address"
          autoComplete="email"
        />
        <InputField
          label="Password"
          placeholder="********"
          value={form.password}
          onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
          error={errors.password}
          secureTextEntry
          autoComplete="password"
        />

        <View style={styles.row}>
          <Pressable
            onPress={() => setForm((prev) => ({ ...prev, remember: !prev.remember }))}
            style={styles.rememberRow}
          >
            <View style={[styles.checkbox, form.remember && styles.checkboxChecked]}>
              {form.remember ? <View style={styles.checkboxDot} /> : null}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>

        {status ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? 'Signing in...' : 'Sign in'}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function OrganizationAdminScreen({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgTypes, setOrgTypes] = useState<OrganizationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeMessage, setTypeMessage] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [typeSearch, setTypeSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('orgs');
  const [orgPage, setOrgPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [resourcePage, setResourcePage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentTypePage, setAppointmentTypePage] = useState(1);
  const [typePage, setTypePage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const roles = useMemo(() => decodeRolesFromToken(token), [token]);
  const isSuperAdmin = roles.includes('SUPER_PLATFORM_ADMIN');
  const isPlatformAdminOnly = roles.includes('PLATFORM_ADMIN') && !isSuperAdmin;
  const canViewCustomers = !isPlatformAdminOnly;
  const canViewAppointments = !isPlatformAdminOnly;
  const availableTabs = useMemo<TabKey[]>(() => {
    const tabs: TabKey[] = ['orgs', 'types', 'schedule', 'users'];
    if (canViewCustomers) {
      tabs.push('customers');
    }
    tabs.push('resources');
    if (canViewAppointments) {
      tabs.push('appointments');
    }
    tabs.push('appointmentTypes');
    return tabs;
  }, [canViewAppointments, canViewCustomers]);
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] ?? 'orgs');
    }
  }, [activeTab, availableTabs]);
  const [scheduleOrgId, setScheduleOrgId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(defaultScheduleForm());
  const [activeDay, setActiveDay] = useState<DayName>('MONDAY');
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [newBusinessWindow, setNewBusinessWindow] = useState<TimeWindowInput>({ start: '09:00', end: '17:00' });
  const [newBreakWindow, setNewBreakWindow] = useState<TimeWindowInput>({ start: '12:00', end: '13:00' });
  const [newHoliday, setNewHoliday] = useState<HolidayInput>({ date: '', allDay: true, description: '', closedWindows: [] });
  const [holidayWindow, setHolidayWindow] = useState<TimeWindowInput>({ start: '09:00', end: '12:00' });

  const [form, setForm] = useState<OrgFormState>({
    id: null,
    name: '',
    marketingName: '',
    industry: '',
    type: '',
    phone: '',
    databaseName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: '',
  });

  const [typeForm, setTypeForm] = useState<OrganizationType>({
    id: '',
    name: '',
    description: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userOrgFilter, setUserOrgFilter] = useState('');
  const [userForm, setUserForm] = useState<UserFormState>({
    id: null,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roles: [],
    homeOrganizationId: '',
    status: 'ACTIVE',
    expiresAt: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerMessage, setCustomerMessage] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOrgFilter, setCustomerOrgFilter] = useState('');
  const [customerForm, setCustomerForm] = useState<CustomerFormState>({
    id: null,
    orgId: '',
    name: '',
    firstName: '',
    email: '',
    phone: '',
    notes: '',
    dateOfBirth: '',
  });
  const [interactionSearch, setInteractionSearch] = useState('');
  const [interactionsWorking, setInteractionsWorking] = useState<CustomerInteraction[]>([]);
  const [interactionForm, setInteractionForm] = useState<CustomerInteractionFormState>({
    id: null,
    type: INTERACTION_TYPES[0],
    status: INTERACTION_STATUSES[0],
    comment: '',
    appointmentId: '',
    createdBy: '',
    createdAt: new Date().toISOString(),
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceMessage, setResourceMessage] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceOrgFilter, setResourceOrgFilter] = useState('');
  const [resourceForm, setResourceForm] = useState<ResourceFormState>({
    id: null,
    orgId: '',
    name: '',
    type: '',
    allowedAppointmentTypeIds: '',
    capacity: '',
    active: true,
    kind: 'ASSET',
    practitionerUserId: '',
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [appointmentMessage, setAppointmentMessage] = useState<string | null>(null);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentOrgFilter, setAppointmentOrgFilter] = useState('');
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>({
    id: null,
    orgId: '',
    customerId: '',
    resourceId: '',
    appointmentTypeId: '',
    start: '',
    end: '',
    status: 'SCHEDULED',
  });
  const [appointmentEventsWorking, setAppointmentEventsWorking] = useState<AppointmentEvent[]>([]);
  const [appointmentEventForm, setAppointmentEventForm] = useState<AppointmentEventFormState>({
    id: null,
    type: APPOINTMENT_EVENT_TYPES[0],
    status: 'SCHEDULED',
    comment: '',
    createdBy: '',
    createdAt: new Date().toISOString(),
  });
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeDto[]>([]);
  const [appointmentTypeLoading, setAppointmentTypeLoading] = useState(false);
  const [appointmentTypeSaving, setAppointmentTypeSaving] = useState(false);
  const [appointmentTypeMessage, setAppointmentTypeMessage] = useState<string | null>(null);
  const [appointmentTypeError, setAppointmentTypeError] = useState<string | null>(null);
  const [appointmentTypeSearch, setAppointmentTypeSearch] = useState('');
  const [appointmentTypeOrgFilter, setAppointmentTypeOrgFilter] = useState('');
  const [appointmentTypeForm, setAppointmentTypeForm] = useState<AppointmentTypeFormState>({
    id: null,
    orgId: '',
    name: '',
    category: '',
    defaultDurationMinutes: '',
    allowedDurations: '',
    requiresResource: false,
    active: true,
  });

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token],
  );

  const authFetch = useCallback(
    (path: string, init?: RequestInit) =>
      fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          ...authHeaders,
          ...(init?.headers || {}),
        },
      }),
    [authHeaders],
  );

  const loadOrgTypes = useCallback(async () => {
    const res = await authFetch('/api/organization-types');
    if (!res.ok) {
      setMessage(await parseErrorMessage(res));
      return;
    }
    const data = (await res.json()) as OrganizationType[];
    setOrgTypes(data);
    if (!form.type && data.length > 0) {
      setForm((prev) => ({ ...prev, type: data[0].name }));
    }
    if (!typeForm.id && data.length > 0) {
      // keep type form empty unless editing
      setTypeForm((prev) => ({ ...prev, id: '', name: '', description: '' }));
    }
  }, [authFetch, form.type]);

  const loadOrganizations = useCallback(async () => {
    setMessage('Loading organizations...');
    const res = await authFetch('/api/organizations');
    if (!res.ok) {
      setMessage(await parseErrorMessage(res));
      return;
    }
    const data = (await res.json()) as Organization[];
    setOrgs(data);
    setMessage(null);
  }, [authFetch]);

  const loadUsers = useCallback(
    async (orgFilter?: string) => {
      const filter = (orgFilter ?? userOrgFilter).trim();
      setUserLoading(true);
      setUserMessage('Loading users...');
      setUserError(null);
      try {
        const query = filter ? `?orgId=${encodeURIComponent(filter)}` : '';
        const res = await authFetch(`/api/users${query}`);
        if (!res.ok) {
          setUserError(await parseErrorMessage(res));
          setUserMessage(null);
          return;
        }
        const data = (await res.json()) as User[];
        setUsers(data);
        setUserMessage(null);
      } catch (error) {
        setUserError(error instanceof Error ? error.message : 'Unable to load users.');
      } finally {
        setUserLoading(false);
      }
    },
    [authFetch, userOrgFilter],
  );

  const loadCustomers = useCallback(
    async (orgFilter?: string) => {
      if (isPlatformAdminOnly && !isSuperAdmin) {
        setCustomers([]);
        setCustomerLoading(false);
        setCustomerMessage(null);
        setCustomerError(null);
        return;
      }
      const filter = (orgFilter ?? customerOrgFilter).trim();
      setCustomerLoading(true);
      setCustomerMessage('Loading customers...');
      setCustomerError(null);
      try {
        const query = filter ? `?orgId=${encodeURIComponent(filter)}` : '';
        const res = await authFetch(`/api/customers${query}`);
        if (!res.ok) {
          setCustomerError(await parseErrorMessage(res));
          setCustomerMessage(null);
          return;
        }
        const data = (await res.json()) as Customer[];
        setCustomers(data);
        setCustomerMessage(null);
      } catch (error) {
        setCustomerError(error instanceof Error ? error.message : 'Unable to load customers.');
      } finally {
        setCustomerLoading(false);
      }
    },
    [authFetch, customerOrgFilter, isPlatformAdminOnly, isSuperAdmin],
  );

  const loadResources = useCallback(
    async (orgFilter?: string) => {
      const filter = (orgFilter ?? resourceOrgFilter).trim();
      setResourceLoading(true);
      setResourceMessage('Loading resources...');
      setResourceError(null);
      try {
        const query = filter ? `?orgId=${encodeURIComponent(filter)}` : '';
        const res = await authFetch(`/api/resources${query}`);
        if (!res.ok) {
          setResourceError(await parseErrorMessage(res));
          setResourceMessage(null);
          return;
        }
        const data = (await res.json()) as Resource[];
        setResources(data);
        setResourceMessage(null);
      } catch (error) {
        setResourceError(error instanceof Error ? error.message : 'Unable to load resources.');
      } finally {
        setResourceLoading(false);
      }
    },
    [authFetch, resourceOrgFilter],
  );

  const loadAppointments = useCallback(
    async (orgFilter?: string) => {
      if (isPlatformAdminOnly && !isSuperAdmin) {
        setAppointments([]);
        setAppointmentLoading(false);
        setAppointmentMessage(null);
        setAppointmentError(null);
        return;
      }
      const filter = (orgFilter ?? appointmentOrgFilter).trim();
      setAppointmentLoading(true);
      setAppointmentMessage('Loading appointments...');
      setAppointmentError(null);
      try {
        const query = filter ? `?orgId=${encodeURIComponent(filter)}` : '';
        const res = await authFetch(`/api/appointments${query}`);
        if (!res.ok) {
          setAppointmentError(await parseErrorMessage(res));
          setAppointmentMessage(null);
          return;
        }
        const data = (await res.json()) as Appointment[];
        setAppointments(data);
        setAppointmentMessage(null);
      } catch (error) {
        setAppointmentError(error instanceof Error ? error.message : 'Unable to load appointments.');
      } finally {
        setAppointmentLoading(false);
      }
    },
    [authFetch, appointmentOrgFilter, isPlatformAdminOnly, isSuperAdmin],
  );

  const loadAppointmentTypes = useCallback(
    async (orgFilter?: string) => {
      const filter = (orgFilter ?? appointmentTypeOrgFilter).trim();
      setAppointmentTypeLoading(true);
      setAppointmentTypeMessage('Loading appointment types...');
      setAppointmentTypeError(null);
      try {
        const query = filter ? `?orgId=${encodeURIComponent(filter)}` : '';
        const res = await authFetch(`/api/appointment-types${query}`);
        if (!res.ok) {
          setAppointmentTypeError(await parseErrorMessage(res));
          setAppointmentTypeMessage(null);
          return;
        }
        const data = (await res.json()) as AppointmentTypeDto[];
        setAppointmentTypes(data);
        setAppointmentTypeMessage(null);
      } catch (error) {
        setAppointmentTypeError(error instanceof Error ? error.message : 'Unable to load appointment types.');
      } finally {
        setAppointmentTypeLoading(false);
      }
    },
    [authFetch, appointmentTypeOrgFilter],
  );

  const resetForm = useCallback(() => {
    setForm({
      id: null,
      name: '',
      marketingName: '',
      industry: '',
      type: orgTypes[0]?.name ?? '',
      phone: '',
      databaseName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      latitude: '',
      longitude: '',
    });
    setFormError(null);
  }, [orgTypes]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadOrgTypes(), loadOrganizations()]);
      setLoading(false);
      const loaders = [loadUsers(), loadResources(), loadAppointmentTypes()];
      if (canViewCustomers) {
        loaders.push(loadCustomers());
      }
      if (canViewAppointments) {
        loaders.push(loadAppointments());
      }
      await Promise.all(loaders);
    })();
  }, [
    loadOrgTypes,
    loadOrganizations,
    loadUsers,
    loadCustomers,
    loadResources,
    loadAppointments,
    loadAppointmentTypes,
    canViewCustomers,
    canViewAppointments,
  ]);

  const resetUserForm = useCallback(() => {
    setUserForm({
      id: null,
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: [],
      homeOrganizationId: '',
      status: 'ACTIVE',
      expiresAt: '',
    });
    setUserError(null);
    setUserMessage(null);
  }, []);

  const resetCustomerForm = useCallback(() => {
    setCustomerForm({
      id: null,
      orgId: '',
      name: '',
      firstName: '',
      email: '',
      phone: '',
      notes: '',
      dateOfBirth: '',
    });
    setCustomerError(null);
    setCustomerMessage(null);
    setInteractionsWorking([]);
    setInteractionForm({
      id: null,
      type: INTERACTION_TYPES[0],
      status: INTERACTION_STATUSES[0],
      comment: '',
      appointmentId: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    });
    setInteractionSearch('');
  }, []);

  const startUserEdit = (user: User) => {
    setUserForm({
      id: user.id ?? null,
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      password: '',
      roles: user.roles ?? [],
      homeOrganizationId: user.homeOrganizationId ?? '',
      status: user.status ?? 'ACTIVE',
      expiresAt: user.expiresAt ?? '',
    });
    setUserError(null);
    setUserMessage(`Editing ${user.username || user.email || user.id || 'user'}`);
  };

  const startCustomerEdit = (customer: Customer) => {
    setCustomerForm({
      id: customer.id ?? null,
      orgId: customer.orgId ?? '',
      name: customer.name ?? '',
      firstName: customer.firstName ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      notes: customer.notes ?? '',
      dateOfBirth: customer.dateOfBirth ?? '',
    });
    setCustomerError(null);
    setCustomerMessage(`Editing ${customer.name || customer.email || customer.id || 'customer'}`);
    setInteractionsWorking(customer.interactions ?? []);
    setInteractionForm({
      id: null,
      type: INTERACTION_TYPES[0],
      status: INTERACTION_STATUSES[0],
      comment: '',
      appointmentId: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    });
    setInteractionSearch('');
  };

  const resetResourceForm = useCallback(() => {
    setResourceForm({
      id: null,
      orgId: '',
      name: '',
      type: '',
      allowedAppointmentTypeIds: '',
      capacity: '',
      active: true,
      kind: 'ASSET',
      practitionerUserId: '',
    });
    setResourceError(null);
    setResourceMessage(null);
  }, []);

  const resetAppointmentForm = useCallback(() => {
    setAppointmentForm({
      id: null,
      orgId: '',
      customerId: '',
      resourceId: '',
      appointmentTypeId: '',
      start: '',
      end: '',
      status: 'SCHEDULED',
    });
    setAppointmentEventsWorking([]);
    setAppointmentEventForm({
      id: null,
      type: APPOINTMENT_EVENT_TYPES[0],
      status: 'SCHEDULED',
      comment: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    });
    setAppointmentError(null);
    setAppointmentMessage(null);
    setAppointmentSearch('');
  }, []);

  const startResourceEdit = (resource: Resource) => {
    setResourceForm({
      id: resource.id ?? null,
      orgId: resource.orgId ?? '',
      name: resource.name ?? '',
      type: resource.type ?? '',
      allowedAppointmentTypeIds: (resource.allowedAppointmentTypeIds ?? []).join(','),
      capacity: resource.capacity != null ? String(resource.capacity) : '',
      active: resource.active ?? true,
      kind: resource.kind ?? 'ASSET',
      practitionerUserId: resource.practitionerUserId ?? '',
    });
    setResourceError(null);
    setResourceMessage(`Editing ${resource.name || resource.id || 'resource'}`);
  };

  const startAppointmentEdit = (appointment: Appointment) => {
    setAppointmentForm({
      id: appointment.id ?? null,
      orgId: appointment.orgId ?? '',
      customerId: appointment.customerId ?? '',
      resourceId: appointment.resourceId ?? '',
      appointmentTypeId: appointment.appointmentTypeId ?? '',
      start: appointment.start ?? '',
      end: appointment.end ?? '',
      status: appointment.status ?? 'SCHEDULED',
    });
    setAppointmentEventsWorking(appointment.events ?? []);
    setAppointmentEventForm({
      id: null,
      type: APPOINTMENT_EVENT_TYPES[0],
      status: 'SCHEDULED',
      comment: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    });
    setAppointmentError(null);
    setAppointmentMessage(`Editing appointment ${appointment.id ?? ''}`.trim());
  };

  const startEdit = (org: Organization) => {
    setForm({
      id: org.id ?? null,
      name: org.name ?? '',
      marketingName: org.marketingName ?? '',
      industry: org.industry ?? '',
      type: org.type ?? '',
      phone: org.phone ?? '',
      databaseName: org.databaseName ?? '',
      street: org.address?.street ?? '',
      city: org.address?.city ?? '',
      state: org.address?.state ?? '',
      postalCode: org.address?.postalCode ?? '',
      country: org.address?.country ?? '',
      latitude: org.location?.latitude != null ? String(org.location.latitude) : '',
      longitude: org.location?.longitude != null ? String(org.location.longitude) : '',
    });
    setFormError(null);
    setMessage(`Editing ${org.name}`);
  };

  const startScheduleEdit = (org: Organization) => {
    setScheduleOrgId(org.id ?? null);
    setScheduleForm(normalizeScheduleForm(org.scheduleConfig));
    setActiveDay('MONDAY');
    setScheduleMessage(`Editing schedule for ${org.name}`);
    setScheduleError(null);
  };

  const clearScheduleForm = () => {
    setScheduleOrgId(null);
    setScheduleForm(defaultScheduleForm());
    setActiveDay('MONDAY');
    setScheduleMessage(null);
    setScheduleError(null);
  };

  const filteredOrgs = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((org) => {
      return [
        org.id,
        org.name,
        org.marketingName,
        org.phone,
        org.createdBy,
        org.type,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [orgs, searchQuery]);

  useEffect(() => {
    setOrgPage(1);
  }, [searchQuery]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    const orgFilter = userOrgFilter.trim().toLowerCase();
    return users.filter((user) => {
      if (orgFilter && (user.homeOrganizationId ?? '').toLowerCase() !== orgFilter) {
        return false;
      }
      if (!term) return true;
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
      const fields = [
        user.username,
        user.email,
        fullName,
        user.homeOrganizationId,
        user.status,
        user.id,
      ]
        .filter(Boolean)
        .map((v) => v!.toLowerCase());
      const roleMatch = (user.roles ?? []).some((role) => role.toLowerCase().includes(term));
      return roleMatch || fields.some((field) => field.includes(term));
    });
  }, [users, userSearch, userOrgFilter]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    const orgFilter = customerOrgFilter.trim().toLowerCase();
    return customers.filter((customer) => {
      if (orgFilter && (customer.orgId ?? '').toLowerCase() !== orgFilter) {
        return false;
      }
      if (!term) return true;
      return [customer.id, customer.name, customer.firstName, customer.email, customer.phone]
        .filter(Boolean)
        .map((v) => v!.toLowerCase())
        .some((val) => val.includes(term));
    });
  }, [customers, customerSearch, customerOrgFilter]);

  const filteredResources = useMemo(() => {
    const term = resourceSearch.trim().toLowerCase();
    const orgFilter = resourceOrgFilter.trim().toLowerCase();
    return resources.filter((resource) => {
      if (orgFilter && (resource.orgId ?? '').toLowerCase() !== orgFilter) {
        return false;
      }
      if (!term) return true;
      return [
        resource.id,
        resource.name,
        resource.type,
        resource.orgId,
        resource.kind,
        resource.practitionerUserId,
      ]
        .filter(Boolean)
        .map((v) => v!.toLowerCase())
        .some((val) => val.includes(term));
    });
  }, [resources, resourceSearch, resourceOrgFilter]);

  const filteredAppointments = useMemo(() => {
    const term = appointmentSearch.trim().toLowerCase();
    const orgFilter = appointmentOrgFilter.trim().toLowerCase();
    return appointments.filter((appt) => {
      if (orgFilter && (appt.orgId ?? '').toLowerCase() !== orgFilter) {
        return false;
      }
      if (!term) return true;
      return [
        appt.id,
        appt.orgId,
        appt.customerId,
        appt.resourceId,
        appt.appointmentTypeId,
        appt.status,
        appt.start,
        appt.end,
      ]
        .filter(Boolean)
        .map((v) => v!.toLowerCase())
        .some((val) => val.includes(term));
    });
  }, [appointments, appointmentSearch, appointmentOrgFilter]);

  const filteredAppointmentTypes = useMemo(() => {
    const term = appointmentTypeSearch.trim().toLowerCase();
    const orgFilter = appointmentTypeOrgFilter.trim().toLowerCase();
    return appointmentTypes.filter((type) => {
      if (orgFilter && (type.orgId ?? '').toLowerCase() !== orgFilter) {
        return false;
      }
      if (!term) return true;
      return [type.id, type.name, type.category, type.orgId, type.defaultDurationMinutes]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((val) => val.includes(term));
    });
  }, [appointmentTypes, appointmentTypeSearch, appointmentTypeOrgFilter]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
  }, [filteredUsers]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const aTime = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
      const bTime = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
      return bTime - aTime;
    });
  }, [filteredCustomers]);

  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      const aTime = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
      const bTime = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
      return bTime - aTime;
    });
  }, [filteredResources]);

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const aTime = a.start ? Date.parse(a.start) : 0;
      const bTime = b.start ? Date.parse(b.start) : 0;
      return bTime - aTime;
    });
  }, [filteredAppointments]);

  const sortedAppointmentTypes = useMemo(() => {
    return [...filteredAppointmentTypes].sort((a, b) => {
      const aTime = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
      const bTime = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
      return bTime - aTime;
    });
  }, [filteredAppointmentTypes]);

  const sortedFilteredOrgs = useMemo(() => {
    return [...filteredOrgs].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
  }, [filteredOrgs]);

  const ORG_PAGE_SIZE = 10;
  const PAGE_SIZE = 10;
  const totalOrgPages = useMemo(
    () => Math.max(1, Math.ceil(sortedFilteredOrgs.length / ORG_PAGE_SIZE)),
    [sortedFilteredOrgs.length],
  );

  useEffect(() => {
    if (orgPage > totalOrgPages) {
      setOrgPage(totalOrgPages);
    }
  }, [orgPage, totalOrgPages]);

  const visibleOrgs = useMemo(
    () => sortedFilteredOrgs.slice((orgPage - 1) * ORG_PAGE_SIZE, orgPage * ORG_PAGE_SIZE),
    [sortedFilteredOrgs, orgPage],
  );

  const totalUserPages = useMemo(
    () => Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE)),
    [sortedUsers.length],
  );
  const visibleUsers = useMemo(
    () => sortedUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE),
    [sortedUsers, userPage],
  );
  useEffect(() => {
    setUserPage(1);
  }, [filteredUsers]);
  useEffect(() => {
    if (userPage > totalUserPages) setUserPage(totalUserPages);
  }, [userPage, totalUserPages]);

  const totalCustomerPages = useMemo(
    () => Math.max(1, Math.ceil(sortedCustomers.length / PAGE_SIZE)),
    [sortedCustomers.length],
  );
  const visibleCustomers = useMemo(
    () => sortedCustomers.slice((customerPage - 1) * PAGE_SIZE, customerPage * PAGE_SIZE),
    [sortedCustomers, customerPage],
  );
  useEffect(() => {
    setCustomerPage(1);
  }, [filteredCustomers]);
  useEffect(() => {
    if (customerPage > totalCustomerPages) setCustomerPage(totalCustomerPages);
  }, [customerPage, totalCustomerPages]);

  const totalResourcePages = useMemo(
    () => Math.max(1, Math.ceil(sortedResources.length / PAGE_SIZE)),
    [sortedResources.length],
  );
  const visibleResources = useMemo(
    () => sortedResources.slice((resourcePage - 1) * PAGE_SIZE, resourcePage * PAGE_SIZE),
    [sortedResources, resourcePage],
  );
  useEffect(() => {
    setResourcePage(1);
  }, [filteredResources]);
  useEffect(() => {
    if (resourcePage > totalResourcePages) setResourcePage(totalResourcePages);
  }, [resourcePage, totalResourcePages]);

  const totalAppointmentPages = useMemo(
    () => Math.max(1, Math.ceil(sortedAppointments.length / PAGE_SIZE)),
    [sortedAppointments.length],
  );
  const visibleAppointments = useMemo(
    () => sortedAppointments.slice((appointmentPage - 1) * PAGE_SIZE, appointmentPage * PAGE_SIZE),
    [sortedAppointments, appointmentPage],
  );
  useEffect(() => {
    setAppointmentPage(1);
  }, [filteredAppointments]);
  useEffect(() => {
    if (appointmentPage > totalAppointmentPages) setAppointmentPage(totalAppointmentPages);
  }, [appointmentPage, totalAppointmentPages]);

  const totalAppointmentTypePages = useMemo(
    () => Math.max(1, Math.ceil(sortedAppointmentTypes.length / PAGE_SIZE)),
    [sortedAppointmentTypes.length],
  );
  const visibleAppointmentTypes = useMemo(
    () => sortedAppointmentTypes.slice((appointmentTypePage - 1) * PAGE_SIZE, appointmentTypePage * PAGE_SIZE),
    [sortedAppointmentTypes, appointmentTypePage],
  );
  useEffect(() => {
    setAppointmentTypePage(1);
  }, [filteredAppointmentTypes]);
  useEffect(() => {
    if (appointmentTypePage > totalAppointmentTypePages) setAppointmentTypePage(totalAppointmentTypePages);
  }, [appointmentTypePage, totalAppointmentTypePages]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerForm.id),
    [customers, customerForm.id],
  );

  const filteredInteractions = useMemo(() => {
    const term = interactionSearch.trim().toLowerCase();
    if (!term) return interactionsWorking;
    return interactionsWorking.filter((interaction) =>
      [
        interaction.id,
        interaction.type,
        interaction.status,
        interaction.comment,
        interaction.createdBy,
        interaction.appointmentId,
        interaction.createdAt,
      ]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(term)),
    );
  }, [interactionSearch, interactionsWorking]);

  const filteredScheduleOrgs = useMemo(() => {
    const term = scheduleSearch.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((org) =>
      [org.id, org.name, org.marketingName, org.type].filter(Boolean).some((value) => value!.toLowerCase().includes(term)),
    );
  }, [orgs, scheduleSearch]);

  const sortedScheduleOrgs = useMemo(() => {
    return [...filteredScheduleOrgs].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
  }, [filteredScheduleOrgs]);

  const totalSchedulePages = useMemo(
    () => Math.max(1, Math.ceil(sortedScheduleOrgs.length / PAGE_SIZE)),
    [sortedScheduleOrgs.length],
  );
  const visibleScheduleOrgs = useMemo(
    () => sortedScheduleOrgs.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE),
    [sortedScheduleOrgs, schedulePage],
  );
  useEffect(() => setSchedulePage(1), [filteredScheduleOrgs]);
  useEffect(() => {
    if (schedulePage > totalSchedulePages) setSchedulePage(totalSchedulePages);
  }, [schedulePage, totalSchedulePages]);

  const selectedScheduleOrg = useMemo(
    () => orgs.find((org) => org.id === scheduleOrgId),
    [orgs, scheduleOrgId],
  );

  const validateForm = () => {
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return false;
    }
    if (!form.type.trim()) {
      setFormError('Select an organization type.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setMessage('Saving organization...');
    setFormError(null);

    const addressFilled = [form.street, form.city, form.state, form.postalCode, form.country].some(
      (value) => value.trim().length > 0,
    );
    const address = addressFilled
      ? {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        }
      : undefined;

    const lat = form.latitude.trim();
    const lng = form.longitude.trim();
    const location =
      lat || lng
        ? {
            latitude: lat ? Number(lat) : undefined,
            longitude: lng ? Number(lng) : undefined,
          }
        : undefined;

    const payload: Organization = {
      name: form.name.trim(),
      marketingName: form.marketingName.trim(),
      industry: form.industry.trim(),
      type: form.type.trim(),
      phone: form.phone.trim(),
      databaseName: form.databaseName.trim(),
      address,
      location,
    };

    const path = form.id ? `/api/organizations/${form.id}` : '/api/organizations';
    const method = form.id ? 'PUT' : 'POST';

    try {
      const res = await authFetch(path, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setFormError(await parseErrorMessage(res));
        setMessage(null);
        return;
      }
      const saved = (await res.json()) as Organization;
      setMessage(form.id ? `Updated ${saved.name}` : `Created ${saved.name}`);
      await loadOrganizations();
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save organization.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (org: Organization) => {
    if (!org.id) return;

    const executeDelete = async () => {
      setMessage(`Deleting ${org.name}...`);
      try {
        const res = await authFetch(`/api/organizations/${org.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setMessage(await parseErrorMessage(res));
          return;
        }
        await loadOrganizations();
        resetForm();
        setMessage(`Deleted ${org.name}`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to delete.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete ${org.name}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete organization', `Delete ${org.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const resetTypeForm = () => {
    setTypeForm({ id: '', name: '', description: '' });
    setTypeError(null);
    setTypeMessage(null);
  };

  const startTypeEdit = (type: OrganizationType) => {
    setTypeForm(type);
    setTypeError(null);
    setTypeMessage(`Editing type ${type.name}`);
  };

  const handleTypeSave = async () => {
    if (!typeForm.name.trim()) {
      setTypeError('Name is required.');
      return;
    }
    setTypeSaving(true);
    setTypeError(null);
    setTypeMessage(typeForm.id ? 'Updating type...' : 'Creating type...');
    const payload: OrganizationType = {
      name: typeForm.name.trim(),
      description: typeForm.description?.trim() ?? '',
    };
    const path = typeForm.id ? `/api/organization-types/${typeForm.id}` : '/api/organization-types';
    const method = typeForm.id ? 'PUT' : 'POST';
    try {
      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        setTypeError(await parseErrorMessage(res));
        setTypeMessage(null);
        return;
      }
      setTypeMessage(typeForm.id ? 'Type updated.' : 'Type created.');
      await loadOrgTypes();
      await loadOrganizations(); // refresh org list if types changed
      resetTypeForm();
    } catch (error) {
      setTypeError(error instanceof Error ? error.message : 'Unable to save type.');
    } finally {
      setTypeSaving(false);
    }
  };

  const handleTypeDelete = (type: OrganizationType) => {
    if (!type.id) return;

    const executeDelete = async () => {
      setTypeMessage(`Deleting type ${type.name}...`);
      try {
        const res = await authFetch(`/api/organization-types/${type.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setTypeMessage(await parseErrorMessage(res));
          return;
        }
        await loadOrgTypes();
        setTypeMessage(`Deleted type ${type.name}`);
        if (form.type === type.name) {
          setForm((prev) => ({ ...prev, type: orgTypes.find((t) => t.id !== type.id)?.name ?? '' }));
        }
        resetTypeForm();
      } catch (error) {
        setTypeMessage(error instanceof Error ? error.message : 'Unable to delete type.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete type ${type.name}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete organization type', `Delete ${type.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const toggleRole = (role: UserRole) => {
    setUserForm((prev) => {
      const exists = prev.roles.includes(role);
      const roles = exists ? prev.roles.filter((r) => r !== role) : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const validateUserForm = () => {
    if (!userForm.username.trim()) {
      setUserError('Username is required.');
      return false;
    }
    if (!userForm.email.trim()) {
      setUserError('Email is required.');
      return false;
    }
    if (userForm.roles.length === 0) {
      setUserError('Select at least one role.');
      return false;
    }
    const needsOrg = userForm.roles.some((role) => !PLATFORM_ROLES.includes(role));
    if (needsOrg && !userForm.homeOrganizationId.trim()) {
      setUserError('homeOrganizationId is required for organization-scoped roles.');
      return false;
    }
    const password = userForm.password.trim();
    if (password && password.length < 8) {
      setUserError('Use at least 8 characters for the password.');
      return false;
    }
    if (!userForm.id && password.length < 8) {
      setUserError('Set a password of at least 8 characters.');
      return false;
    }
    setUserError(null);
    return true;
  };

  const handleUserSave = async () => {
    if (!validateUserForm()) return;
    setUserSaving(true);
    setUserMessage('Saving user...');

    const payload: Partial<User> = {
      username: userForm.username.trim(),
      firstName: userForm.firstName.trim(),
      lastName: userForm.lastName.trim(),
      email: userForm.email.trim(),
      roles: userForm.roles,
      status: userForm.status,
    };

    const homeOrg = userForm.homeOrganizationId.trim();
    if (homeOrg) {
      payload.homeOrganizationId = homeOrg;
    }
    const password = userForm.password.trim();
    if (password) {
      payload.password = password;
    }
    const expiresAt = userForm.expiresAt.trim();
    if (expiresAt) {
      payload.expiresAt = expiresAt;
    }

    const path = userForm.id ? `/api/users/${userForm.id}` : '/api/users';
    const method = userForm.id ? 'PUT' : 'POST';

    try {
      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        setUserError(await parseErrorMessage(res));
        setUserMessage(null);
        return;
      }
      const saved = (await res.json()) as User;
      setUserMessage(userForm.id ? `Updated ${saved.username}` : `Created ${saved.username}`);
      await loadUsers();
      if (userForm.id) {
        startUserEdit(saved);
      } else {
        resetUserForm();
      }
    } catch (error) {
      setUserError(error instanceof Error ? error.message : 'Unable to save user.');
    } finally {
      setUserSaving(false);
    }
  };

  const handleUserDelete = (user: User) => {
    if (!user.id) return;

    const executeDelete = async () => {
      setUserMessage(`Deleting ${user.username || user.email || 'user'}...`);
      try {
        const res = await authFetch(`/api/users/${user.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setUserMessage(await parseErrorMessage(res));
          return;
        }
        await loadUsers();
        if (userForm.id === user.id) {
          resetUserForm();
        }
        setUserMessage(`Deleted ${user.username || user.email || 'user'}`);
      } catch (error) {
        setUserMessage(error instanceof Error ? error.message : 'Unable to delete user.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete ${user.username || user.email || 'user'}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete user', `Delete ${user.username || user.email || 'user'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const validateCustomerForm = () => {
    if (!customerForm.name.trim() && !customerForm.firstName.trim()) {
      setCustomerError('Provide a full name or first name.');
      return false;
    }
    if (!customerForm.email.trim() && !customerForm.phone.trim()) {
      setCustomerError('Provide at least an email or phone.');
      return false;
    }
    setCustomerError(null);
    return true;
  };

  const handleCustomerSave = async () => {
    if (!validateCustomerForm()) return;
    setCustomerSaving(true);
    setCustomerMessage('Saving customer...');

    const payload: Customer = {
      name: customerForm.name.trim(),
      firstName: customerForm.firstName.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      notes: customerForm.notes.trim(),
      dateOfBirth: customerForm.dateOfBirth.trim() || undefined,
      interactions: interactionsWorking,
    };
    const orgId = customerForm.orgId.trim();
    if (orgId) {
      payload.orgId = orgId;
    }

    const path = customerForm.id ? `/api/customers/${customerForm.id}` : '/api/customers';
    const method = customerForm.id ? 'PUT' : 'POST';

    try {
      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        setCustomerError(await parseErrorMessage(res));
        setCustomerMessage(null);
        return;
      }
      const saved = (await res.json()) as Customer;
      setCustomerMessage(customerForm.id ? `Updated ${saved.name || saved.email || saved.id}` : 'Customer created.');
      await loadCustomers();
      if (customerForm.id) {
        startCustomerEdit(saved);
      } else {
        resetCustomerForm();
      }
    } catch (error) {
      setCustomerError(error instanceof Error ? error.message : 'Unable to save customer.');
    } finally {
      setCustomerSaving(false);
    }
  };

  const handleCustomerDelete = (customer: Customer) => {
    if (!customer.id) return;

    const executeDelete = async () => {
      setCustomerMessage(`Deleting ${customer.name || customer.email || 'customer'}...`);
      try {
        const res = await authFetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setCustomerMessage(await parseErrorMessage(res));
          return;
        }
        await loadCustomers();
        if (customerForm.id === customer.id) {
          resetCustomerForm();
        }
        setCustomerMessage(`Deleted ${customer.name || customer.email || 'customer'}`);
      } catch (error) {
        setCustomerMessage(error instanceof Error ? error.message : 'Unable to delete customer.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete ${customer.name || customer.email || 'customer'}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete customer', `Delete ${customer.name || customer.email || 'customer'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const validateResourceForm = () => {
    if (!resourceForm.name.trim()) {
      setResourceError('Name is required.');
      return false;
    }
    if (!resourceForm.type.trim()) {
      setResourceError('Type is required.');
      return false;
    }
    setResourceError(null);
    return true;
  };

  const handleResourceSave = async () => {
    if (!validateResourceForm()) return;
    setResourceSaving(true);
    setResourceMessage('Saving resource...');

    const payload: Resource = {
      name: resourceForm.name.trim(),
      type: resourceForm.type.trim(),
      kind: resourceForm.kind,
      active: resourceForm.active,
      practitionerUserId: resourceForm.practitionerUserId.trim() || undefined,
    };
    const orgId = resourceForm.orgId.trim();
    if (orgId) {
      payload.orgId = orgId;
    }
    const allowed = resourceForm.allowedAppointmentTypeIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (allowed.length > 0) {
      payload.allowedAppointmentTypeIds = allowed;
    }
    const capacityNum = resourceForm.capacity.trim();
    if (capacityNum) {
      const parsed = Number(capacityNum);
      if (!Number.isNaN(parsed)) {
        payload.capacity = parsed;
      }
    }

    const path = resourceForm.id ? `/api/resources/${resourceForm.id}` : '/api/resources';
    const method = resourceForm.id ? 'PUT' : 'POST';

    try {
      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        setResourceError(await parseErrorMessage(res));
        setResourceMessage(null);
        return;
      }
      const saved = (await res.json()) as Resource;
      setResourceMessage(resourceForm.id ? `Updated ${saved.name}` : `Created ${saved.name}`);
      await loadResources();
      if (resourceForm.id) {
        startResourceEdit(saved);
      } else {
        resetResourceForm();
      }
    } catch (error) {
      setResourceError(error instanceof Error ? error.message : 'Unable to save resource.');
    } finally {
      setResourceSaving(false);
    }
  };

  const handleResourceDelete = (resource: Resource) => {
    if (!resource.id) return;

    const executeDelete = async () => {
      setResourceMessage(`Deleting ${resource.name || resource.id || 'resource'}...`);
      try {
        const res = await authFetch(`/api/resources/${resource.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setResourceMessage(await parseErrorMessage(res));
          return;
        }
        await loadResources();
        if (resourceForm.id === resource.id) {
          resetResourceForm();
        }
        setResourceMessage(`Deleted ${resource.name || resource.id || 'resource'}`);
      } catch (error) {
        setResourceMessage(error instanceof Error ? error.message : 'Unable to delete resource.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete ${resource.name || resource.id || 'resource'}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete resource', `Delete ${resource.name || resource.id || 'resource'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const validateAppointmentForm = () => {
    if (!appointmentForm.customerId.trim() && !appointmentForm.resourceId.trim()) {
      setAppointmentError('Provide a customerId or resourceId.');
      return false;
    }
    if (!appointmentForm.appointmentTypeId.trim()) {
      setAppointmentError('Appointment type is required.');
      return false;
    }
    if (!appointmentForm.start.trim() || !appointmentForm.end.trim()) {
      setAppointmentError('Start and end are required.');
      return false;
    }
    setAppointmentError(null);
    return true;
  };

  const handleAppointmentSave = async () => {
    if (!validateAppointmentForm()) return;
    setAppointmentSaving(true);
    setAppointmentMessage('Saving appointment...');

    const payload: Appointment = {
      orgId: appointmentForm.orgId.trim() || undefined,
      customerId: appointmentForm.customerId.trim() || undefined,
      resourceId: appointmentForm.resourceId.trim() || undefined,
      appointmentTypeId: appointmentForm.appointmentTypeId.trim(),
      start: appointmentForm.start.trim(),
      end: appointmentForm.end.trim(),
      status: appointmentForm.status,
      events: appointmentEventsWorking,
    };

    const path = appointmentForm.id ? `/api/appointments/${appointmentForm.id}` : '/api/appointments';
    const method = appointmentForm.id ? 'PUT' : 'POST';

    try {
      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        setAppointmentError(await parseErrorMessage(res));
        setAppointmentMessage(null);
        return;
      }
      const saved = (await res.json()) as Appointment;
      setAppointmentMessage(appointmentForm.id ? `Updated ${saved.id}` : `Created ${saved.id}`);
      await loadAppointments();
      if (appointmentForm.id) {
        startAppointmentEdit(saved);
      } else {
        resetAppointmentForm();
      }
    } catch (error) {
      setAppointmentError(error instanceof Error ? error.message : 'Unable to save appointment.');
    } finally {
      setAppointmentSaving(false);
    }
  };

  const handleAppointmentDelete = (appointment: Appointment) => {
    if (!appointment.id) return;

    const executeDelete = async () => {
      setAppointmentMessage(`Deleting ${appointment.id}...`);
      try {
        const res = await authFetch(`/api/appointments/${appointment.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setAppointmentMessage(await parseErrorMessage(res));
          return;
        }
        await loadAppointments();
        if (appointmentForm.id === appointment.id) {
          resetAppointmentForm();
        }
        setAppointmentMessage(`Deleted ${appointment.id}`);
      } catch (error) {
        setAppointmentMessage(error instanceof Error ? error.message : 'Unable to delete appointment.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete appointment ${appointment.id}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete appointment', `Delete appointment ${appointment.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const resetInteractionForm = () => {
    setInteractionForm({
      id: null,
      type: INTERACTION_TYPES[0],
      status: INTERACTION_STATUSES[0],
      comment: '',
      appointmentId: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    });
  };

  const startInteractionEdit = (interaction: CustomerInteraction) => {
    setInteractionForm({
      id: interaction.id ?? null,
      type: interaction.type ?? INTERACTION_TYPES[0],
      status: interaction.status ?? INTERACTION_STATUSES[0],
      comment: interaction.comment ?? '',
      appointmentId: interaction.appointmentId ?? '',
      createdBy: interaction.createdBy ?? '',
      createdAt: interaction.createdAt ?? new Date().toISOString(),
    });
  };

  const handleInteractionSave = () => {
    if (!customerForm.id && !customerForm.name.trim() && !customerForm.email.trim() && !customerForm.phone.trim()) {
      setCustomerError('Select or create a customer first before adding interactions.');
      return;
    }
    if (!interactionForm.comment.trim()) {
      setCustomerError('Interaction comment is required.');
      return;
    }
    setCustomerError(null);
    const normalized: CustomerInteraction = {
      id: interactionForm.id ?? `interaction-${Date.now()}`,
      type: interactionForm.type,
      status: interactionForm.status,
      comment: interactionForm.comment.trim(),
      appointmentId: interactionForm.appointmentId.trim() || undefined,
      createdBy: interactionForm.createdBy.trim() || undefined,
      createdAt: interactionForm.createdAt || new Date().toISOString(),
    };
    setInteractionsWorking((prev) => {
      const exists = prev.find((i) => i.id === normalized.id);
      if (exists) {
        return prev.map((i) => (i.id === normalized.id ? normalized : i));
      }
      return [...prev, normalized];
    });
    resetInteractionForm();
    setCustomerMessage('Interaction saved locally. Click "Save customer" to persist.');
  };

  const handleInteractionDelete = (interaction: CustomerInteraction) => {
    setInteractionsWorking((prev) => prev.filter((i) => i.id !== interaction.id));
    if (interactionForm.id === interaction.id) {
      resetInteractionForm();
    }
    setCustomerMessage('Interaction removed locally. Click "Save customer" to persist.');
  };

  const resetAppointmentEventForm = () => {
    setAppointmentEventForm({
      id: null,
      type: APPOINTMENT_EVENT_TYPES[0],
      status: 'SCHEDULED',
      comment: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    });
  };

  const startAppointmentEventEdit = (event: AppointmentEvent) => {
    setAppointmentEventForm({
      id: event.id ?? null,
      type: event.type ?? APPOINTMENT_EVENT_TYPES[0],
      status: event.status ?? 'SCHEDULED',
      comment: event.comment ?? '',
      createdBy: event.createdBy ?? '',
      createdAt: event.createdAt ?? new Date().toISOString(),
    });
  };

  const handleAppointmentEventSave = () => {
    if (!appointmentForm.customerId.trim() && !appointmentForm.resourceId.trim()) {
      setAppointmentError('Provide at least customerId or resourceId before adding events.');
      return;
    }
    if (!appointmentEventForm.comment.trim()) {
      setAppointmentError('Event comment is required.');
      return;
    }
    setAppointmentError(null);
    const normalized: AppointmentEvent = {
      id: appointmentEventForm.id ?? `event-${Date.now()}`,
      type: appointmentEventForm.type,
      status: appointmentEventForm.status,
      comment: appointmentEventForm.comment.trim(),
      createdBy: appointmentEventForm.createdBy.trim() || undefined,
      createdAt: appointmentEventForm.createdAt || new Date().toISOString(),
    };
    setAppointmentEventsWorking((prev) => {
      const exists = prev.find((e) => e.id === normalized.id);
      if (exists) {
        return prev.map((e) => (e.id === normalized.id ? normalized : e));
      }
      return [...prev, normalized];
    });
    resetAppointmentEventForm();
    setAppointmentMessage('Event saved locally. Click "Save appointment" to persist.');
  };

  const handleAppointmentEventDelete = (event: AppointmentEvent) => {
    setAppointmentEventsWorking((prev) => prev.filter((e) => e.id !== event.id));
    if (appointmentEventForm.id === event.id) {
      resetAppointmentEventForm();
    }
    setAppointmentMessage('Event removed locally. Click "Save appointment" to persist.');
  };

  const resetAppointmentTypeForm = useCallback(() => {
    setAppointmentTypeForm({
      id: null,
      orgId: '',
      name: '',
      category: '',
      defaultDurationMinutes: '',
      allowedDurations: '',
      requiresResource: false,
      active: true,
    });
    setAppointmentTypeError(null);
    setAppointmentTypeMessage(null);
    setAppointmentTypeSearch('');
  }, []);

  const startAppointmentTypeEdit = (type: AppointmentTypeDto) => {
    setAppointmentTypeForm({
      id: type.id ?? null,
      orgId: type.orgId ?? '',
      name: type.name ?? '',
      category: type.category ?? '',
      defaultDurationMinutes: type.defaultDurationMinutes != null ? String(type.defaultDurationMinutes) : '',
      allowedDurations: (type.allowedDurations ?? []).join(','),
      requiresResource: type.requiresResource ?? false,
      active: type.active ?? true,
    });
    setAppointmentTypeError(null);
    setAppointmentTypeMessage(`Editing ${type.name || type.id || 'appointment type'}`);
  };

  const validateAppointmentTypeForm = () => {
    if (!appointmentTypeForm.name.trim()) {
      setAppointmentTypeError('Name is required.');
      return false;
    }
    setAppointmentTypeError(null);
    return true;
  };

  const handleAppointmentTypeSave = async () => {
    if (!validateAppointmentTypeForm()) return;
    setAppointmentTypeSaving(true);
    setAppointmentTypeMessage('Saving appointment type...');

    const payload: AppointmentTypeDto = {
      name: appointmentTypeForm.name.trim(),
      category: appointmentTypeForm.category.trim(),
      requiresResource: appointmentTypeForm.requiresResource,
      active: appointmentTypeForm.active,
    };
    const orgId = appointmentTypeForm.orgId.trim();
    if (orgId) {
      payload.orgId = orgId;
    }
    const defaultDuration = appointmentTypeForm.defaultDurationMinutes.trim();
    if (defaultDuration) {
      const parsed = Number(defaultDuration);
      if (!Number.isNaN(parsed)) {
        payload.defaultDurationMinutes = parsed;
      }
    }
    const allowedDurations = appointmentTypeForm.allowedDurations
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => Number(d))
      .filter((n) => !Number.isNaN(n));
    if (allowedDurations.length > 0) {
      payload.allowedDurations = allowedDurations;
    }

    const path = appointmentTypeForm.id ? `/api/appointment-types/${appointmentTypeForm.id}` : '/api/appointment-types';
    const method = appointmentTypeForm.id ? 'PUT' : 'POST';

    try {
      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        setAppointmentTypeError(await parseErrorMessage(res));
        setAppointmentTypeMessage(null);
        return;
      }
      const saved = (await res.json()) as AppointmentTypeDto;
      setAppointmentTypeMessage(appointmentTypeForm.id ? `Updated ${saved.name}` : `Created ${saved.name}`);
      await loadAppointmentTypes();
      if (appointmentTypeForm.id) {
        startAppointmentTypeEdit(saved);
      } else {
        resetAppointmentTypeForm();
      }
    } catch (error) {
      setAppointmentTypeError(error instanceof Error ? error.message : 'Unable to save appointment type.');
    } finally {
      setAppointmentTypeSaving(false);
    }
  };

  const handleAppointmentTypeDelete = (type: AppointmentTypeDto) => {
    if (!type.id) return;

    const executeDelete = async () => {
      setAppointmentTypeMessage(`Deleting ${type.name || type.id || 'appointment type'}...`);
      try {
        const res = await authFetch(`/api/appointment-types/${type.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setAppointmentTypeMessage(await parseErrorMessage(res));
          return;
        }
        await loadAppointmentTypes();
        if (appointmentTypeForm.id === type.id) {
          resetAppointmentTypeForm();
        }
        setAppointmentTypeMessage(`Deleted ${type.name || type.id || 'appointment type'}`);
      } catch (error) {
        setAppointmentTypeMessage(error instanceof Error ? error.message : 'Unable to delete appointment type.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete ${type.name || type.id || 'appointment type'}?`);
      if (confirmed) {
        void executeDelete();
      }
      return;
    }

    Alert.alert('Delete appointment type', `Delete ${type.name || type.id || 'appointment type'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void executeDelete() },
    ]);
  };

  const filteredTypes = useMemo(() => {
    const term = typeSearch.trim().toLowerCase();
    if (!term) return orgTypes;
    return orgTypes.filter((type) =>
      [type.name, type.description, type.id].filter(Boolean).some((value) => value!.toLowerCase().includes(term)),
    );
  }, [orgTypes, typeSearch]);

  const sortedTypes = useMemo(() => {
    return [...filteredTypes].sort((a, b) => (b.createdAt != null ? Date.parse(b.createdAt) : 0) - (a.createdAt != null ? Date.parse(a.createdAt) : 0));
  }, [filteredTypes]);

  const totalTypePages = useMemo(
    () => Math.max(1, Math.ceil(sortedTypes.length / PAGE_SIZE)),
    [sortedTypes.length],
  );
  const visibleTypes = useMemo(
    () => sortedTypes.slice((typePage - 1) * PAGE_SIZE, typePage * PAGE_SIZE),
    [sortedTypes, typePage],
  );
  useEffect(() => setTypePage(1), [filteredTypes]);
  useEffect(() => {
    if (typePage > totalTypePages) setTypePage(totalTypePages);
  }, [typePage, totalTypePages]);

  const toggleWorkingDay = (day: DayName) => {
    setScheduleForm((prev) => {
      const exists = prev.workingDays.includes(day);
      const workingDays = exists ? prev.workingDays.filter((d) => d !== day) : [...prev.workingDays, day];
      return { ...prev, workingDays };
    });
  };

  const addBusinessWindow = () => {
    if (!newBusinessWindow.start.trim() || !newBusinessWindow.end.trim()) {
      setScheduleError('Provide start and end time for business hours.');
      return;
    }
    setScheduleForm((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [activeDay]: [...prev.businessHours[activeDay], { start: newBusinessWindow.start.trim(), end: newBusinessWindow.end.trim() }],
      },
    }));
    setNewBusinessWindow({ start: '09:00', end: '17:00' });
    setScheduleError(null);
  };

  const addBreakWindow = () => {
    if (!newBreakWindow.start.trim() || !newBreakWindow.end.trim()) {
      setScheduleError('Provide start and end time for breaks.');
      return;
    }
    setScheduleForm((prev) => ({
      ...prev,
      breaks: {
        ...prev.breaks,
        [activeDay]: [...prev.breaks[activeDay], { start: newBreakWindow.start.trim(), end: newBreakWindow.end.trim() }],
      },
    }));
    setNewBreakWindow({ start: '12:00', end: '13:00' });
    setScheduleError(null);
  };

  const removeBusinessWindow = (day: DayName, index: number) => {
    setScheduleForm((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: prev.businessHours[day].filter((_, idx) => idx !== index),
      },
    }));
  };

  const removeBreakWindow = (day: DayName, index: number) => {
    setScheduleForm((prev) => ({
      ...prev,
      breaks: {
        ...prev.breaks,
        [day]: prev.breaks[day].filter((_, idx) => idx !== index),
      },
    }));
  };

  const addHoliday = () => {
    if (!newHoliday.date.trim()) {
      setScheduleError('Holiday date is required.');
      return;
    }
    if (!newHoliday.allDay && (!holidayWindow.start.trim() || !holidayWindow.end.trim())) {
      setScheduleError('Provide start and end for partial-day holiday.');
      return;
    }
    const closedWindows =
      newHoliday.allDay || !holidayWindow.start.trim() || !holidayWindow.end.trim()
        ? []
        : [{ start: holidayWindow.start.trim(), end: holidayWindow.end.trim() }];
    setScheduleForm((prev) => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        {
          date: newHoliday.date.trim(),
          allDay: newHoliday.allDay,
          description: newHoliday.description.trim(),
          closedWindows,
        },
      ],
    }));
    setNewHoliday({ date: '', allDay: true, description: '', closedWindows: [] });
    setHolidayWindow({ start: '09:00', end: '12:00' });
    setScheduleError(null);
  };

  const removeHoliday = (index: number) => {
    setScheduleForm((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, idx) => idx !== index),
    }));
  };

  const buildDayMap = (record: Record<DayName, TimeWindowInput[]>) => {
    const map: Record<DayName, TimeWindowInput[]> = {} as Record<DayName, TimeWindowInput[]>;
    DAY_NAMES.forEach((day) => {
      const windows = (record[day] ?? [])
        .filter((tw) => tw.start.trim() && tw.end.trim())
        .map((tw) => ({ start: tw.start.trim(), end: tw.end.trim() }));
      if (windows.length > 0) {
        map[day] = windows;
      }
    });
    return map;
  };

  const handleScheduleSave = async () => {
    if (!scheduleOrgId) {
      setScheduleError('Select an organization to edit its schedule.');
      return;
    }
    const current = orgs.find((org) => org.id === scheduleOrgId);
    if (!current) {
      setScheduleError('Organization not found.');
      return;
    }
    setScheduleSaving(true);
    setScheduleError(null);
    setScheduleMessage('Saving schedule...');

    const schedulePayload: ScheduleConfigDto = {
      workingDays: scheduleForm.workingDays,
      businessHours: buildDayMap(scheduleForm.businessHours),
      breaks: buildDayMap(scheduleForm.breaks),
      holidays: scheduleForm.holidays
        .filter((h) => h.date.trim())
        .map((h) => ({
          date: h.date.trim(),
          allDay: h.allDay,
          description: h.description.trim(),
          closedWindows:
            h.allDay || !h.closedWindows
              ? []
              : h.closedWindows
                  .filter((tw) => tw.start.trim() && tw.end.trim())
                  .map((tw) => ({ start: tw.start.trim(), end: tw.end.trim() })),
        })),
    };

    const payload: Organization = {
      name: current.name ?? '',
      marketingName: current.marketingName ?? '',
      industry: current.industry ?? '',
      type: current.type ?? '',
      phone: current.phone ?? '',
      databaseName: current.databaseName ?? '',
      address: current.address,
      location: current.location,
      scheduleConfig: schedulePayload,
    };

    try {
      const res = await authFetch(`/api/organizations/${scheduleOrgId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setScheduleError(await parseErrorMessage(res));
        setScheduleMessage(null);
        return;
      }
      const saved = (await res.json()) as Organization;
      setScheduleMessage(`Updated schedule for ${saved.name}`);
      setScheduleForm(normalizeScheduleForm(saved.scheduleConfig));
      await loadOrganizations();
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : 'Unable to save schedule.');
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{roles.join(', ') || 'Authenticated'}</Text>
          </View>
          <Text style={styles.title}>Platform control center</Text>
          <Text style={styles.subtitle}>
            Manage organizations, types, and subscriptions. Start with create/update/delete.
          </Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutLabel}>Sign out</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.cardWide]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          <Pressable
            style={[styles.tabButton, activeTab === 'orgs' && styles.tabButtonActive]}
            onPress={() => setActiveTab('orgs')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'orgs' && styles.tabButtonTextActive]}>
              Organizations
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'types' && styles.tabButtonActive]}
            onPress={() => setActiveTab('types')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'types' && styles.tabButtonTextActive]}>
              Organization types
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'schedule' && styles.tabButtonActive]}
            onPress={() => setActiveTab('schedule')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'schedule' && styles.tabButtonTextActive]}>
              Schedule
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'users' && styles.tabButtonActive]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'users' && styles.tabButtonTextActive]}>
              Users
            </Text>
          </Pressable>
          {canViewCustomers ? (
            <Pressable
              style={[styles.tabButton, activeTab === 'customers' && styles.tabButtonActive]}
              onPress={() => setActiveTab('customers')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'customers' && styles.tabButtonTextActive]}>
                Customers
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.tabButton, activeTab === 'resources' && styles.tabButtonActive]}
            onPress={() => setActiveTab('resources')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'resources' && styles.tabButtonTextActive]}>
              Resources
            </Text>
          </Pressable>
          {canViewAppointments ? (
            <Pressable
              style={[styles.tabButton, activeTab === 'appointments' && styles.tabButtonActive]}
              onPress={() => setActiveTab('appointments')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'appointments' && styles.tabButtonTextActive]}>
                Appointments
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.tabButton, activeTab === 'appointmentTypes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('appointmentTypes')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'appointmentTypes' && styles.tabButtonTextActive]}>
              Appointment types
            </Text>
          </Pressable>
        </ScrollView>

        {activeTab === 'orgs' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Organizations ({visibleOrgs.length}/{orgs.length})</Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New</Text>
                  </Pressable>
                  <Pressable onPress={loadOrganizations} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by id, name, marketing name, phone, createdBy"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {orgPage} / {totalOrgPages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={orgPage <= 1}
                    onPress={() => setOrgPage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, orgPage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={orgPage >= totalOrgPages}
                    onPress={() => setOrgPage((p) => Math.min(totalOrgPages, p + 1))}
                    style={[styles.secondaryChip, orgPage >= totalOrgPages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {message ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{message}</Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleOrgs.map((org) => (
                  <Pressable
                    key={org.id ?? org.name}
                    style={[styles.orgCard, form.id === org.id && styles.orgCardActive]}
                    onPress={() => startEdit(org)}
                  >
                    <View style={styles.orgHeader}>
                      <Text style={styles.orgName}>{org.name}</Text>
                      <Text style={styles.orgType}>{org.type}</Text>
                    </View>
                    <Text style={styles.orgMeta}>
                      {org.marketingName || 'No marketing name'} - {org.industry || 'No industry'}
                    </Text>
                    <Text style={styles.orgMeta}>
                      {org.phone || 'No phone'} - DB: {org.databaseName || 'N/A'}
                    </Text>
                    <Text style={styles.orgMeta}>
                      Created: {org.createdAt ? new Date(org.createdAt).toLocaleString() : 'Unknown'} by{' '}
                      {org.createdBy || 'unknown'}
                    </Text>
                    <View style={styles.orgActions}>
                      <Pressable onPress={() => startEdit(org)} style={styles.orgAction}>
                        <Text style={styles.link}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDelete(org)} style={styles.orgAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                {visibleOrgs.length === 0 ? (
                  <Text style={styles.statusText}>No organizations match the filters.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{form.id ? 'Edit organization' : 'Create organization'}</Text>
              {form.id ? (
                <Pressable onPress={resetForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            {formError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <InputField
              label="Name"
              placeholder="Legal name"
              value={form.name}
              onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
            />
            <InputField
              label="Marketing name"
              placeholder="Public-facing name"
              value={form.marketingName}
              onChangeText={(marketingName) => setForm((prev) => ({ ...prev, marketingName }))}
            />
            <InputField
              label="Industry"
              placeholder="Industry"
              value={form.industry}
              onChangeText={(industry) => setForm((prev) => ({ ...prev, industry }))}
            />
            <View style={styles.inputField}>
              <Text style={styles.label}>Organization type</Text>
              <View style={styles.typeChips}>
                {orgTypes.map((type) => {
                  const selected = form.type === type.name;
                  return (
                    <Pressable
                      key={type.id}
                      onPress={() => setForm((prev) => ({ ...prev, type: type.name }))}
                      style={[styles.typeChip, selected && styles.typeChipSelected]}
                    >
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
                        {type.name}
                      </Text>
                    </Pressable>
                  );
                })}
                {orgTypes.length === 0 ? (
                  <Text style={styles.statusText}>No organization types available.</Text>
                ) : null}
              </View>
            </View>
            <InputField
              label="Phone"
              placeholder="+33 1 23 45 67 89"
              value={form.phone}
              onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))}
              keyboardType="default"
            />
            <InputField
              label="Database name"
              placeholder="org-database-name"
              value={form.databaseName}
              onChangeText={(databaseName) => setForm((prev) => ({ ...prev, databaseName }))}
            />

            <View style={styles.addressRow}>
              <InputField
                label="Street"
                placeholder="123 Main St"
                value={form.street}
                onChangeText={(street) => setForm((prev) => ({ ...prev, street }))}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="City"
                  placeholder="City"
                  value={form.city}
                  onChangeText={(city) => setForm((prev) => ({ ...prev, city }))}
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="State / Region"
                  placeholder="State or region"
                  value={form.state}
                  onChangeText={(state) => setForm((prev) => ({ ...prev, state }))}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="Postal code"
                  placeholder="Postal code"
                  value={form.postalCode}
                  onChangeText={(postalCode) => setForm((prev) => ({ ...prev, postalCode }))}
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="Country"
                  placeholder="Country"
                  value={form.country}
                  onChangeText={(country) => setForm((prev) => ({ ...prev, country }))}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="Latitude"
                  placeholder="48.8566"
                  value={form.latitude}
                  onChangeText={(latitude) => setForm((prev) => ({ ...prev, latitude }))}
                  keyboardType="default"
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="Longitude"
                  placeholder="2.3522"
                  value={form.longitude}
                  onChangeText={(longitude) => setForm((prev) => ({ ...prev, longitude }))}
                  keyboardType="default"
                />
              </View>
            </View>

            <PrimaryButton
              label={saving ? 'Saving...' : form.id ? 'Update organization' : 'Create organization'}
              onPress={handleSave}
              disabled={saving}
            />
          </>
        ) : activeTab === 'types' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Organization types ({visibleTypes.length}/{orgTypes.length})
                </Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetTypeForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New type</Text>
                  </Pressable>
                  <Pressable onPress={loadOrgTypes} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={typeSearch}
                  onChangeText={setTypeSearch}
                  placeholder="Search types by id, name, description"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {typePage} / {totalTypePages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={typePage <= 1}
                    onPress={() => setTypePage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, typePage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={typePage >= totalTypePages}
                    onPress={() => setTypePage((p) => Math.min(totalTypePages, p + 1))}
                    style={[styles.secondaryChip, typePage >= totalTypePages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {typeMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{typeMessage}</Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleTypes.map((type) => (
                  <Pressable
                    key={type.id}
                    style={[styles.orgCard, typeForm.id === type.id && styles.orgCardActive]}
                    onPress={() => startTypeEdit(type)}
                  >
                    <View style={styles.orgHeader}>
                      <Text style={styles.orgName}>{type.name}</Text>
                      <Text style={styles.orgType}>{type.id ? `#${type.id}` : 'New type'}</Text>
                    </View>
                    <Text style={styles.orgMeta}>{type.description || 'No description'}</Text>
                    <View style={styles.orgActions}>
                      <Pressable onPress={() => startTypeEdit(type)} style={styles.orgAction}>
                        <Text style={styles.link}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleTypeDelete(type)} style={styles.orgAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                {visibleTypes.length === 0 ? (
                  <Text style={styles.statusText}>No organization types yet.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {typeForm.id ? 'Edit organization type' : 'Create organization type'}
              </Text>
              {typeForm.id ? (
                <Pressable onPress={resetTypeForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            {typeError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{typeError}</Text>
              </View>
            ) : null}

            <InputField
              label="Type name"
              placeholder="Retail, Public, etc."
              value={typeForm.name}
              onChangeText={(name) => setTypeForm((prev) => ({ ...prev, name }))}
            />
            <InputField
              label="Description"
              placeholder="Short description"
              value={typeForm.description ?? ''}
              onChangeText={(description) => setTypeForm((prev) => ({ ...prev, description }))}
            />

            <PrimaryButton
              label={typeSaving ? 'Saving type...' : typeForm.id ? 'Update type' : 'Create type'}
              onPress={handleTypeSave}
              disabled={typeSaving}
            />
          </>
        ) : activeTab === 'schedule' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Schedules ({filteredScheduleOrgs.length}/{orgs.length})
                </Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={clearScheduleForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Clear</Text>
                  </Pressable>
                  <Pressable onPress={loadOrganizations} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={scheduleSearch}
                  onChangeText={setScheduleSearch}
                  placeholder="Search organizations to edit schedule"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {schedulePage} / {totalSchedulePages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={schedulePage <= 1}
                    onPress={() => setSchedulePage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, schedulePage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={schedulePage >= totalSchedulePages}
                    onPress={() => setSchedulePage((p) => Math.min(totalSchedulePages, p + 1))}
                    style={[styles.secondaryChip, schedulePage >= totalSchedulePages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {scheduleMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{scheduleMessage}</Text>
              </View>
            ) : null}
            {scheduleError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{scheduleError}</Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleScheduleOrgs.map((org) => {
                  const isSelected = scheduleOrgId === org.id;
                  const holidaysCount = org.scheduleConfig?.holidays?.length ?? 0;
                  const workingCount = org.scheduleConfig?.workingDays?.length ?? 0;
                  return (
                    <Pressable
                      key={org.id ?? org.name}
                      style={[styles.orgCard, isSelected && styles.orgCardActive]}
                      onPress={() => startScheduleEdit(org)}
                    >
                      <View style={styles.orgHeader}>
                        <Text style={styles.orgName}>{org.name}</Text>
                        <Text style={styles.orgType}>{org.type}</Text>
                      </View>
                      <Text style={styles.orgMeta}>
                        {workingCount} working days / {holidaysCount} holidays
                      </Text>
                      <View style={styles.orgActions}>
                        <Pressable onPress={() => startScheduleEdit(org)} style={styles.orgAction}>
                          <Text style={styles.link}>Edit schedule</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
                {visibleScheduleOrgs.length === 0 ? (
                  <Text style={styles.statusText}>No organizations yet.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            {scheduleOrgId ? (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Schedule for {selectedScheduleOrg?.name ?? 'organization'}
                  </Text>
                  <Pressable
                    onPress={() => selectedScheduleOrg && startScheduleEdit(selectedScheduleOrg)}
                    style={styles.secondaryChip}
                  >
                    <Text style={styles.secondaryChipText}>Reset</Text>
                  </Pressable>
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.label}>Working days</Text>
                  <View style={styles.typeChips}>
                    {DAY_NAMES.map((day) => {
                      const enabled = scheduleForm.workingDays.includes(day);
                      return (
                        <Pressable
                          key={day}
                          onPress={() => toggleWorkingDay(day)}
                          style={[styles.typeChip, enabled && styles.typeChipSelected]}
                        >
                          <Text style={[styles.typeChipText, enabled && styles.typeChipTextSelected]}>
                            {DAY_LABELS[day]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.label}>Day focus</Text>
                  <View style={styles.typeChips}>
                    {DAY_NAMES.map((day) => (
                      <Pressable
                        key={`${day}-focus`}
                        onPress={() => setActiveDay(day)}
                        style={[styles.typeChip, activeDay === day && styles.typeChipSelected]}
                      >
                        <Text style={[styles.typeChipText, activeDay === day && styles.typeChipTextSelected]}>
                          {DAY_LABELS[day]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Business hours ({DAY_LABELS[activeDay]})</Text>
                <View style={styles.windowRow}>
                  {scheduleForm.businessHours[activeDay].length === 0 ? (
                    <Text style={styles.statusText}>No business hours for this day.</Text>
                  ) : (
                    scheduleForm.businessHours[activeDay].map((window, idx) => (
                      <View key={`bh-${activeDay}-${idx}`} style={[styles.typeChip, styles.windowChip]}>
                        <Text style={styles.typeChipText}>
                          {window.start || '--:--'} - {window.end || '--:--'}
                        </Text>
                        <Pressable onPress={() => removeBusinessWindow(activeDay, idx)} style={styles.orgAction}>
                          <Text style={styles.deleteText}>Remove</Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
                <View style={styles.row}>
                  <View style={styles.flexHalf}>
                    <InputField
                      label="Start (HH:mm)"
                      placeholder="09:00"
                      value={newBusinessWindow.start}
                      onChangeText={(start) => setNewBusinessWindow((prev) => ({ ...prev, start }))}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <InputField
                      label="End (HH:mm)"
                      placeholder="17:00"
                      value={newBusinessWindow.end}
                      onChangeText={(end) => setNewBusinessWindow((prev) => ({ ...prev, end }))}
                    />
                  </View>
                </View>
                <Pressable onPress={addBusinessWindow} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Add business window</Text>
                </Pressable>

                <Text style={styles.sectionTitle}>Breaks ({DAY_LABELS[activeDay]})</Text>
                <View style={styles.windowRow}>
                  {scheduleForm.breaks[activeDay].length === 0 ? (
                    <Text style={styles.statusText}>No breaks for this day.</Text>
                  ) : (
                    scheduleForm.breaks[activeDay].map((window, idx) => (
                      <View key={`br-${activeDay}-${idx}`} style={[styles.typeChip, styles.windowChip]}>
                        <Text style={styles.typeChipText}>
                          {window.start || '--:--'} - {window.end || '--:--'}
                        </Text>
                        <Pressable onPress={() => removeBreakWindow(activeDay, idx)} style={styles.orgAction}>
                          <Text style={styles.deleteText}>Remove</Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
                <View style={styles.row}>
                  <View style={styles.flexHalf}>
                    <InputField
                      label="Break start (HH:mm)"
                      placeholder="12:00"
                      value={newBreakWindow.start}
                      onChangeText={(start) => setNewBreakWindow((prev) => ({ ...prev, start }))}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <InputField
                      label="Break end (HH:mm)"
                      placeholder="13:00"
                      value={newBreakWindow.end}
                      onChangeText={(end) => setNewBreakWindow((prev) => ({ ...prev, end }))}
                    />
                  </View>
                </View>
                <Pressable onPress={addBreakWindow} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Add break window</Text>
                </Pressable>

                <View style={styles.divider} />

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Holidays</Text>
                </View>
                <View style={styles.orgList}>
                  {scheduleForm.holidays.map((holiday, idx) => (
                    <View key={`holiday-${holiday.date}-${idx}`} style={styles.orgCard}>
                      <View style={styles.orgHeader}>
                        <Text style={styles.orgName}>{holiday.date || 'Unknown date'}</Text>
                        <Pressable onPress={() => removeHoliday(idx)} style={styles.orgAction}>
                          <Text style={styles.deleteText}>Remove</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.orgType}>{holiday.allDay ? 'All day' : 'Partial day'}</Text>
                      <Text style={styles.orgMeta}>{holiday.description || 'No description'}</Text>
                      {!holiday.allDay && holiday.closedWindows.length > 0 ? (
                        <Text style={styles.orgMeta}>
                          Closed {holiday.closedWindows[0].start || '--:--'} - {holiday.closedWindows[0].end || '--:--'}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                  {scheduleForm.holidays.length === 0 ? (
                    <Text style={styles.statusText}>No holidays defined.</Text>
                  ) : null}
                </View>
                <View style={styles.row}>
                  <View style={styles.flexHalf}>
                    <InputField
                      label="Holiday date (YYYY-MM-DD)"
                      placeholder="2025-12-25"
                      value={newHoliday.date}
                      onChangeText={(date) => setNewHoliday((prev) => ({ ...prev, date }))}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <InputField
                      label="Description"
                      placeholder="Christmas"
                      value={newHoliday.description}
                      onChangeText={(description) => setNewHoliday((prev) => ({ ...prev, description }))}
                    />
                  </View>
                </View>
                <Pressable
                  onPress={() => setNewHoliday((prev) => ({ ...prev, allDay: !prev.allDay }))}
                  style={styles.rememberRow}
                >
                  <View style={[styles.checkbox, newHoliday.allDay && styles.checkboxChecked]}>
                    {newHoliday.allDay ? <View style={styles.checkboxDot} /> : null}
                  </View>
                  <Text style={styles.rememberText}>All day closure</Text>
                </Pressable>
                {!newHoliday.allDay ? (
                  <View style={styles.row}>
                    <View style={styles.flexHalf}>
                      <InputField
                        label="Closed from (HH:mm)"
                        placeholder="09:00"
                        value={holidayWindow.start}
                        onChangeText={(start) => setHolidayWindow((prev) => ({ ...prev, start }))}
                      />
                    </View>
                    <View style={styles.flexHalf}>
                      <InputField
                        label="Closed to (HH:mm)"
                        placeholder="12:00"
                        value={holidayWindow.end}
                        onChangeText={(end) => setHolidayWindow((prev) => ({ ...prev, end }))}
                      />
                    </View>
                  </View>
                ) : null}
                <Pressable onPress={addHoliday} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Add holiday</Text>
                </Pressable>
                <View style={styles.divider} />
                <PrimaryButton
                  label={scheduleSaving ? 'Saving schedule...' : 'Save schedule'}
                  onPress={handleScheduleSave}
                  disabled={scheduleSaving}
                />
              </>
            ) : (
              <Text style={styles.statusText}>Select an organization to edit its schedule.</Text>
            )}
          </>
        ) : activeTab === 'resources' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Resources ({visibleResources.length}/{resources.length})</Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetResourceForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New</Text>
                  </Pressable>
                  <Pressable onPress={() => loadResources()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={resourceSearch}
                  onChangeText={setResourceSearch}
                  placeholder="Search by id, name, type, org, kind, practitioner"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Org filter (optional)"
                    placeholder="org-aurora-retail"
                    value={resourceOrgFilter}
                    onChangeText={setResourceOrgFilter}
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadResources()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {resourcePage} / {totalResourcePages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={resourcePage <= 1}
                    onPress={() => setResourcePage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, resourcePage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={resourcePage >= totalResourcePages}
                    onPress={() => setResourcePage((p) => Math.min(totalResourcePages, p + 1))}
                    style={[styles.secondaryChip, resourcePage >= totalResourcePages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {resourceMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{resourceMessage}</Text>
              </View>
            ) : null}
            {resourceError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{resourceError}</Text>
              </View>
            ) : null}

            {resourceLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading resources...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleResources.map((resource) => (
                  <Pressable
                    key={resource.id ?? resource.name}
                    style={[styles.orgCard, resourceForm.id === resource.id && styles.orgCardActive]}
                    onPress={() => startResourceEdit(resource)}
                  >
                    <View style={styles.orgHeader}>
                      <Text style={styles.orgName}>{resource.name || 'Untitled resource'}</Text>
                      <Text style={styles.orgType}>{resource.type || 'Type N/A'}</Text>
                    </View>
                    <Text style={styles.orgMeta}>
                      Org: {resource.orgId || 'N/A'} - Kind: {resource.kind || 'ASSET'} - Active:{' '}
                      {resource.active ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.orgMeta}>
                      Allowed appt types: {(resource.allowedAppointmentTypeIds || []).join(', ') || 'Any'}
                    </Text>
                    {resource.practitionerUserId ? (
                      <Text style={styles.orgMeta}>Practitioner user: {resource.practitionerUserId}</Text>
                    ) : null}
                    <View style={styles.orgActions}>
                      <Pressable onPress={() => startResourceEdit(resource)} style={styles.orgAction}>
                        <Text style={styles.link}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleResourceDelete(resource)} style={styles.orgAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                {visibleResources.length === 0 ? (
                  <Text style={styles.statusText}>No resources match the filters.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{resourceForm.id ? 'Edit resource' : 'Create resource'}</Text>
              {resourceForm.id ? (
                <Pressable onPress={resetResourceForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            <InputField
              label="Name"
              placeholder="MRI machine, Room 101, Dr. Smith"
              value={resourceForm.name}
              onChangeText={(name) => setResourceForm((prev) => ({ ...prev, name }))}
            />
            <InputField
              label="Type"
              placeholder="facility, equipment, practitioner"
              value={resourceForm.type}
              onChangeText={(type) => setResourceForm((prev) => ({ ...prev, type }))}
            />
            <InputField
              label="Org id (required for platform admins)"
              placeholder="org-aurora-retail"
              value={resourceForm.orgId}
              onChangeText={(orgId) => setResourceForm((prev) => ({ ...prev, orgId }))}
            />
            <InputField
              label="Allowed appointment type ids (comma separated)"
              placeholder="appt-consultation, appt-followup"
              value={resourceForm.allowedAppointmentTypeIds}
              onChangeText={(allowedAppointmentTypeIds) => setResourceForm((prev) => ({ ...prev, allowedAppointmentTypeIds }))}
            />
            <InputField
              label="Capacity (optional)"
              placeholder="1"
              value={resourceForm.capacity}
              onChangeText={(capacity) => setResourceForm((prev) => ({ ...prev, capacity }))}
            />
            <View style={styles.inputField}>
              <Text style={styles.label}>Kind</Text>
              <View style={styles.typeChips}>
                {RESOURCE_KINDS.map((kind) => {
                  const selected = resourceForm.kind === kind;
                  return (
                    <Pressable
                      key={kind}
                      onPress={() => setResourceForm((prev) => ({ ...prev, kind }))}
                      style={[styles.typeChip, selected && styles.typeChipSelected]}
                    >
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{kind}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Pressable
              onPress={() => setResourceForm((prev) => ({ ...prev, active: !prev.active }))}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, resourceForm.active && styles.checkboxChecked]}>
                {resourceForm.active ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberText}>Active</Text>
            </Pressable>
            <InputField
              label="Practitioner user id (optional, for HUMAN kind)"
              placeholder="user-practitioner"
              value={resourceForm.practitionerUserId}
              onChangeText={(practitionerUserId) => setResourceForm((prev) => ({ ...prev, practitionerUserId }))}
            />

            <PrimaryButton
              label={resourceSaving ? 'Saving resource...' : resourceForm.id ? 'Update resource' : 'Create resource'}
              onPress={handleResourceSave}
              disabled={resourceSaving}
            />
          </>
        ) : activeTab === 'appointments' && canViewAppointments ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Appointments ({visibleAppointments.length}/{appointments.length})</Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetAppointmentForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New</Text>
                  </Pressable>
                  <Pressable onPress={() => loadAppointments()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={appointmentSearch}
                  onChangeText={setAppointmentSearch}
                  placeholder="Search by id, org, customer, resource, type, status"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Org filter (optional)"
                    placeholder="org-aurora-retail"
                    value={appointmentOrgFilter}
                    onChangeText={setAppointmentOrgFilter}
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadAppointments()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {appointmentPage} / {totalAppointmentPages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={appointmentPage <= 1}
                    onPress={() => setAppointmentPage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, appointmentPage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={appointmentPage >= totalAppointmentPages}
                    onPress={() => setAppointmentPage((p) => Math.min(totalAppointmentPages, p + 1))}
                    style={[styles.secondaryChip, appointmentPage >= totalAppointmentPages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {appointmentMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{appointmentMessage}</Text>
              </View>
            ) : null}
            {appointmentError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{appointmentError}</Text>
              </View>
            ) : null}

            {appointmentLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading appointments...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleAppointments.map((appt) => (
                  <Pressable
                    key={appt.id ?? `${appt.customerId}-${appt.start}`}
                    style={[styles.orgCard, appointmentForm.id === appt.id && styles.orgCardActive]}
                    onPress={() => startAppointmentEdit(appt)}
                  >
                    <View style={styles.orgHeader}>
                      <Text style={styles.orgName}>{appt.id || 'Appointment'}</Text>
                      <Text style={styles.orgType}>{appt.status || 'SCHEDULED'}</Text>
                    </View>
                    <Text style={styles.orgMeta}>
                      Customer: {appt.customerId || 'N/A'} - Resource: {appt.resourceId || 'N/A'}
                    </Text>
                    <Text style={styles.orgMeta}>
                      Type: {appt.appointmentTypeId || 'N/A'} - {appt.start || '--'} to {appt.end || '--'}
                    </Text>
                    <View style={styles.orgActions}>
                      <Pressable onPress={() => startAppointmentEdit(appt)} style={styles.orgAction}>
                        <Text style={styles.link}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleAppointmentDelete(appt)} style={styles.orgAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                {visibleAppointments.length === 0 ? (
                  <Text style={styles.statusText}>No appointments match the filters.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{appointmentForm.id ? 'Edit appointment' : 'Create appointment'}</Text>
              {appointmentForm.id ? (
                <Pressable onPress={resetAppointmentForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            <InputField
              label="Org id (required for platform admins)"
              placeholder="org-aurora-retail"
              value={appointmentForm.orgId}
              onChangeText={(orgId) => setAppointmentForm((prev) => ({ ...prev, orgId }))}
            />
            <InputField
              label="Customer id"
              placeholder="customer-123"
              value={appointmentForm.customerId}
              onChangeText={(customerId) => setAppointmentForm((prev) => ({ ...prev, customerId }))}
            />
            <InputField
              label="Resource id"
              placeholder="resource-123"
              value={appointmentForm.resourceId}
              onChangeText={(resourceId) => setAppointmentForm((prev) => ({ ...prev, resourceId }))}
            />
            <InputField
              label="Appointment type id"
              placeholder="appt-consultation"
              value={appointmentForm.appointmentTypeId}
              onChangeText={(appointmentTypeId) => setAppointmentForm((prev) => ({ ...prev, appointmentTypeId }))}
            />
            <InputField
              label="Start (ISO-8601)"
              placeholder="2025-12-01T09:00:00"
              value={appointmentForm.start}
              onChangeText={(start) => setAppointmentForm((prev) => ({ ...prev, start }))}
            />
            <InputField
              label="End (ISO-8601)"
              placeholder="2025-12-01T09:30:00"
              value={appointmentForm.end}
              onChangeText={(end) => setAppointmentForm((prev) => ({ ...prev, end }))}
            />
            <View style={styles.inputField}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.typeChips}>
                {APPOINTMENT_STATUSES.map((status) => {
                  const selected = appointmentForm.status === status;
                  return (
                    <Pressable
                      key={status}
                      onPress={() => setAppointmentForm((prev) => ({ ...prev, status }))}
                      style={[styles.typeChip, selected && styles.typeChipSelected]}
                    >
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{status}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <PrimaryButton
              label={appointmentSaving ? 'Saving appointment...' : appointmentForm.id ? 'Update appointment' : 'Create appointment'}
              onPress={handleAppointmentSave}
              disabled={appointmentSaving}
            />

            {appointmentForm.id ? (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Events</Text>
                  <Pressable onPress={resetAppointmentEventForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New event</Text>
                  </Pressable>
                </View>
                <View style={styles.searchBox}>
                  <TextInput
                    value={interactionSearch}
                    onChangeText={setInteractionSearch}
                    placeholder="Search events by type, status, comment, createdBy"
                    placeholderTextColor="rgba(107,114,128,0.7)"
                    style={styles.searchInput}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.orgList}>
                  {appointmentEventsWorking
                    .filter((event) => {
                      const term = interactionSearch.trim().toLowerCase();
                      if (!term) return true;
                      return [event.id, event.type, event.status, event.comment, event.createdBy, event.createdAt]
                        .filter(Boolean)
                        .some((value) => value!.toString().toLowerCase().includes(term));
                    })
                    .map((event) => (
                      <Pressable
                        key={event.id ?? event.createdAt}
                        style={[styles.orgCard, appointmentEventForm.id === event.id && styles.orgCardActive]}
                        onPress={() => startAppointmentEventEdit(event)}
                      >
                        <View style={styles.orgHeader}>
                          <Text style={styles.orgName}>{event.type ?? 'Event'}</Text>
                          <Text style={styles.orgType}>{event.status ?? 'N/A'}</Text>
                        </View>
                        <Text style={styles.orgMeta}>{event.comment || 'No comment'}</Text>
                        <Text style={styles.orgMeta}>
                          By {event.createdBy || 'unknown'}
                          {event.createdAt ? ` - ${event.createdAt}` : ''}
                        </Text>
                        <View style={styles.orgActions}>
                          <Pressable onPress={() => startAppointmentEventEdit(event)} style={styles.orgAction}>
                            <Text style={styles.link}>Edit</Text>
                          </Pressable>
                          <Pressable onPress={() => handleAppointmentEventDelete(event)} style={styles.orgAction}>
                            <Text style={styles.deleteText}>Delete</Text>
                          </Pressable>
                        </View>
                      </Pressable>
                    ))}
                  {appointmentEventsWorking.length === 0 ? (
                    <Text style={styles.statusText}>No events yet.</Text>
                  ) : null}
                </View>

                <View style={styles.divider} />

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    {appointmentEventForm.id ? 'Edit event' : 'Add event'}
                  </Text>
                  <Pressable onPress={resetAppointmentEventForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Reset</Text>
                  </Pressable>
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.typeChips}>
                    {APPOINTMENT_EVENT_TYPES.map((type) => {
                      const selected = appointmentEventForm.type === type;
                      return (
                        <Pressable
                          key={type}
                          onPress={() => setAppointmentEventForm((prev) => ({ ...prev, type }))}
                          style={[styles.typeChip, selected && styles.typeChipSelected]}
                        >
                          <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{type}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.typeChips}>
                    {APPOINTMENT_STATUSES.map((status) => {
                      const selected = appointmentEventForm.status === status;
                      return (
                        <Pressable
                          key={status}
                          onPress={() => setAppointmentEventForm((prev) => ({ ...prev, status }))}
                          style={[styles.typeChip, selected && styles.typeChipSelected]}
                        >
                          <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{status}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <InputField
                  label="Comment"
                  placeholder="Describe the event"
                  value={appointmentEventForm.comment}
                  onChangeText={(comment) => setAppointmentEventForm((prev) => ({ ...prev, comment }))}
                />
                <InputField
                  label="Created by"
                  placeholder="agent@example.com"
                  value={appointmentEventForm.createdBy}
                  onChangeText={(createdBy) => setAppointmentEventForm((prev) => ({ ...prev, createdBy }))}
                />
                <InputField
                  label="Created at (ISO-8601)"
                  placeholder={new Date().toISOString()}
                  value={appointmentEventForm.createdAt}
                  onChangeText={(createdAt) => setAppointmentEventForm((prev) => ({ ...prev, createdAt }))}
                />

                <PrimaryButton
                  label={appointmentEventForm.id ? 'Update event' : 'Add event'}
                  onPress={handleAppointmentEventSave}
                  disabled={appointmentSaving}
                />
              </>
            ) : null}
          </>
        ) : activeTab === 'appointmentTypes' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Appointment types ({visibleAppointmentTypes.length}/{appointmentTypes.length})
                </Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetAppointmentTypeForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New</Text>
                  </Pressable>
                  <Pressable onPress={() => loadAppointmentTypes()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={appointmentTypeSearch}
                  onChangeText={setAppointmentTypeSearch}
                  placeholder="Search by id, name, category, org, duration"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Org filter (optional)"
                    placeholder="org-aurora-retail"
                    value={appointmentTypeOrgFilter}
                    onChangeText={setAppointmentTypeOrgFilter}
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadAppointmentTypes()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {appointmentTypePage} / {totalAppointmentTypePages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={appointmentTypePage <= 1}
                    onPress={() => setAppointmentTypePage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, appointmentTypePage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={appointmentTypePage >= totalAppointmentTypePages}
                    onPress={() => setAppointmentTypePage((p) => Math.min(totalAppointmentTypePages, p + 1))}
                    style={[styles.secondaryChip, appointmentTypePage >= totalAppointmentTypePages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {appointmentTypeMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{appointmentTypeMessage}</Text>
              </View>
            ) : null}
            {appointmentTypeError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{appointmentTypeError}</Text>
              </View>
            ) : null}

            {appointmentTypeLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading appointment types...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleAppointmentTypes.map((type) => (
                  <Pressable
                    key={type.id ?? type.name}
                    style={[styles.orgCard, appointmentTypeForm.id === type.id && styles.orgCardActive]}
                    onPress={() => startAppointmentTypeEdit(type)}
                  >
                    <View style={styles.orgHeader}>
                      <Text style={styles.orgName}>{type.name || 'Appointment type'}</Text>
                      <Text style={styles.orgType}>{type.category || 'No category'}</Text>
                    </View>
                    <Text style={styles.orgMeta}>
                      Org: {type.orgId || 'N/A'} - Default duration: {type.defaultDurationMinutes ?? 'N/A'} mins
                    </Text>
                    <Text style={styles.orgMeta}>
                      Allowed durations: {(type.allowedDurations ?? []).join(', ') || 'Any'} - Requires resource:{' '}
                      {type.requiresResource ? 'Yes' : 'No'} - Active: {type.active ? 'Yes' : 'No'}
                    </Text>
                    <View style={styles.orgActions}>
                      <Pressable onPress={() => startAppointmentTypeEdit(type)} style={styles.orgAction}>
                        <Text style={styles.link}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleAppointmentTypeDelete(type)} style={styles.orgAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                {visibleAppointmentTypes.length === 0 ? (
                  <Text style={styles.statusText}>No appointment types match the filters.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {appointmentTypeForm.id ? 'Edit appointment type' : 'Create appointment type'}
              </Text>
              {appointmentTypeForm.id ? (
                <Pressable onPress={resetAppointmentTypeForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            <InputField
              label="Name"
              placeholder="Consultation"
              value={appointmentTypeForm.name}
              onChangeText={(name) => setAppointmentTypeForm((prev) => ({ ...prev, name }))}
            />
            <InputField
              label="Category"
              placeholder="Medical"
              value={appointmentTypeForm.category}
              onChangeText={(category) => setAppointmentTypeForm((prev) => ({ ...prev, category }))}
            />
            <InputField
              label="Org id (required for platform admins)"
              placeholder="org-aurora-retail"
              value={appointmentTypeForm.orgId}
              onChangeText={(orgId) => setAppointmentTypeForm((prev) => ({ ...prev, orgId }))}
            />
            <InputField
              label="Default duration (minutes)"
              placeholder="30"
              value={appointmentTypeForm.defaultDurationMinutes}
              onChangeText={(defaultDurationMinutes) =>
                setAppointmentTypeForm((prev) => ({ ...prev, defaultDurationMinutes }))
              }
            />
            <InputField
              label="Allowed durations (comma separated minutes)"
              placeholder="15,30,45,60"
              value={appointmentTypeForm.allowedDurations}
              onChangeText={(allowedDurations) => setAppointmentTypeForm((prev) => ({ ...prev, allowedDurations }))}
            />
            <Pressable
              onPress={() => setAppointmentTypeForm((prev) => ({ ...prev, requiresResource: !prev.requiresResource }))}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, appointmentTypeForm.requiresResource && styles.checkboxChecked]}>
                {appointmentTypeForm.requiresResource ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberText}>Requires resource</Text>
            </Pressable>
            <Pressable
              onPress={() => setAppointmentTypeForm((prev) => ({ ...prev, active: !prev.active }))}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, appointmentTypeForm.active && styles.checkboxChecked]}>
                {appointmentTypeForm.active ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberText}>Active</Text>
            </Pressable>

            <PrimaryButton
              label={
                appointmentTypeSaving
                  ? 'Saving appointment type...'
                  : appointmentTypeForm.id
                    ? 'Update appointment type'
                    : 'Create appointment type'
              }
              onPress={handleAppointmentTypeSave}
              disabled={appointmentTypeSaving}
            />
          </>
        ) : activeTab === 'customers' && canViewCustomers ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Customers ({visibleCustomers.length}/{customers.length})</Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetCustomerForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New</Text>
                  </Pressable>
                  <Pressable onPress={() => loadCustomers()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                  placeholder="Search by id, name, email, phone"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Org filter (optional)"
                    placeholder="org-aurora-retail"
                    value={customerOrgFilter}
                    onChangeText={setCustomerOrgFilter}
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadCustomers()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {customerPage} / {totalCustomerPages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={customerPage <= 1}
                    onPress={() => setCustomerPage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, customerPage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={customerPage >= totalCustomerPages}
                    onPress={() => setCustomerPage((p) => Math.min(totalCustomerPages, p + 1))}
                    style={[styles.secondaryChip, customerPage >= totalCustomerPages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {customerMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{customerMessage}</Text>
              </View>
            ) : null}
            {customerError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{customerError}</Text>
              </View>
            ) : null}

            {customerLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading customers...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleCustomers.map((customer) => (
                  <Pressable
                    key={customer.id ?? customer.email ?? customer.phone}
                    style={[styles.orgCard, customerForm.id === customer.id && styles.orgCardActive]}
                    onPress={() => startCustomerEdit(customer)}
                  >
                    <View style={styles.orgHeader}>
                      <Text style={styles.orgName}>{customer.name || customer.firstName || 'Unknown'}</Text>
                      <Text style={styles.orgType}>{customer.orgId || 'Org scoped'}</Text>
                    </View>
                    <Text style={styles.orgMeta}>{customer.email || 'No email'} - {customer.phone || 'No phone'}</Text>
                    <Text style={styles.orgMeta}>{customer.notes || 'No notes'}</Text>
                    <View style={styles.orgActions}>
                      <Pressable onPress={() => startCustomerEdit(customer)} style={styles.orgAction}>
                        <Text style={styles.link}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleCustomerDelete(customer)} style={styles.orgAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
                {visibleCustomers.length === 0 ? (
                  <Text style={styles.statusText}>No customers match the filters.</Text>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{customerForm.id ? 'Edit customer' : 'Create customer'}</Text>
              {customerForm.id ? (
                <Pressable onPress={resetCustomerForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            <InputField
              label="Full name"
              placeholder="Jane Doe"
              value={customerForm.name}
              onChangeText={(name) => setCustomerForm((prev) => ({ ...prev, name }))}
            />
            <InputField
              label="First name"
              placeholder="Jane"
              value={customerForm.firstName}
              onChangeText={(firstName) => setCustomerForm((prev) => ({ ...prev, firstName }))}
            />
            <InputField
              label="Email"
              placeholder="jane@example.com"
              value={customerForm.email}
              onChangeText={(email) => setCustomerForm((prev) => ({ ...prev, email }))}
              keyboardType="email-address"
              autoComplete="email"
            />
            <InputField
              label="Phone"
              placeholder="+33 1 23 45 67 89"
              value={customerForm.phone}
              onChangeText={(phone) => setCustomerForm((prev) => ({ ...prev, phone }))}
            />
            <InputField
              label="Notes"
              placeholder="Additional context"
              value={customerForm.notes}
              onChangeText={(notes) => setCustomerForm((prev) => ({ ...prev, notes }))}
            />
            <InputField
              label="Date of birth (YYYY-MM-DD)"
              placeholder="1990-01-01"
              value={customerForm.dateOfBirth}
              onChangeText={(dateOfBirth) => setCustomerForm((prev) => ({ ...prev, dateOfBirth }))}
            />
            <InputField
              label="Org id (required for platform admins)"
              placeholder="org-aurora-retail"
              value={customerForm.orgId}
              onChangeText={(orgId) => setCustomerForm((prev) => ({ ...prev, orgId }))}
            />

            <PrimaryButton
              label={customerSaving ? 'Saving customer...' : customerForm.id ? 'Update customer' : 'Create customer'}
              onPress={handleCustomerSave}
              disabled={customerSaving}
            />

            {customerForm.id ? (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Interactions</Text>
                  <Pressable onPress={resetInteractionForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New interaction</Text>
                  </Pressable>
                </View>
                <View style={styles.searchBox}>
                  <TextInput
                    value={interactionSearch}
                    onChangeText={setInteractionSearch}
                    placeholder="Search interactions by type, status, comment, createdBy, appointment"
                    placeholderTextColor="rgba(107,114,128,0.7)"
                    style={styles.searchInput}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.orgList}>
                  {filteredInteractions.map((interaction) => (
                    <Pressable
                      key={interaction.id ?? interaction.createdAt}
                      style={[
                        styles.orgCard,
                        interactionForm.id === interaction.id && styles.orgCardActive,
                      ]}
                      onPress={() => startInteractionEdit(interaction)}
                    >
                      <View style={styles.orgHeader}>
                        <Text style={styles.orgName}>{interaction.type ?? 'Interaction'}</Text>
                        <Text style={styles.orgType}>{interaction.status ?? 'N/A'}</Text>
                      </View>
                      <Text style={styles.orgMeta}>{interaction.comment || 'No comment'}</Text>
                      <Text style={styles.orgMeta}>
                        By {interaction.createdBy || 'unknown'}
                        {interaction.createdAt ? ` - ${interaction.createdAt}` : ''}
                      </Text>
                      {interaction.appointmentId ? (
                        <Text style={styles.orgMeta}>Appointment: {interaction.appointmentId}</Text>
                      ) : null}
                      <View style={styles.orgActions}>
                        <Pressable onPress={() => startInteractionEdit(interaction)} style={styles.orgAction}>
                          <Text style={styles.link}>Edit</Text>
                        </Pressable>
                        <Pressable onPress={() => handleInteractionDelete(interaction)} style={styles.orgAction}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                  {filteredInteractions.length === 0 ? (
                    <Text style={styles.statusText}>No interactions match the filters.</Text>
                  ) : null}
                </View>

                <View style={styles.divider} />

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    {interactionForm.id ? 'Edit interaction' : 'Add interaction'}
                  </Text>
                  <Pressable onPress={resetInteractionForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Reset</Text>
                  </Pressable>
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.typeChips}>
                    {INTERACTION_TYPES.map((type) => {
                      const selected = interactionForm.type === type;
                      return (
                        <Pressable
                          key={type}
                          onPress={() => setInteractionForm((prev) => ({ ...prev, type }))}
                          style={[styles.typeChip, selected && styles.typeChipSelected]}
                        >
                          <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{type}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.typeChips}>
                    {INTERACTION_STATUSES.map((status) => {
                      const selected = interactionForm.status === status;
                      return (
                        <Pressable
                          key={status}
                          onPress={() => setInteractionForm((prev) => ({ ...prev, status }))}
                          style={[styles.typeChip, selected && styles.typeChipSelected]}
                        >
                          <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{status}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <InputField
                  label="Comment"
                  placeholder="Describe the interaction"
                  value={interactionForm.comment}
                  onChangeText={(comment) => setInteractionForm((prev) => ({ ...prev, comment }))}
                />
                <InputField
                  label="Appointment ID (optional)"
                  placeholder="appt-123"
                  value={interactionForm.appointmentId}
                  onChangeText={(appointmentId) => setInteractionForm((prev) => ({ ...prev, appointmentId }))}
                />
                <InputField
                  label="Created by"
                  placeholder="agent@example.com"
                  value={interactionForm.createdBy}
                  onChangeText={(createdBy) => setInteractionForm((prev) => ({ ...prev, createdBy }))}
                />
                <InputField
                  label="Created at (ISO-8601)"
                  placeholder={new Date().toISOString()}
                  value={interactionForm.createdAt}
                  onChangeText={(createdAt) => setInteractionForm((prev) => ({ ...prev, createdAt }))}
                />

                <PrimaryButton
                  label={interactionForm.id ? 'Update interaction' : 'Add interaction'}
                  onPress={handleInteractionSave}
                  disabled={customerSaving}
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Users ({visibleUsers.length}/{users.length})</Text>
                <View style={styles.sectionActions}>
                  <Pressable onPress={resetUserForm} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>New</Text>
                  </Pressable>
                  <Pressable onPress={() => loadUsers()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.searchBox}>
                <TextInput
                  value={userSearch}
                  onChangeText={setUserSearch}
                  placeholder="Search by username, email, name, org, status, role"
                  placeholderTextColor="rgba(107,114,128,0.7)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Home org filter (optional)"
                    placeholder="org-aurora-retail"
                    value={userOrgFilter}
                    onChangeText={setUserOrgFilter}
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadUsers()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.paginationRow}>
                <Text style={styles.statusText}>
                  Page {userPage} / {totalUserPages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Pressable
                    disabled={userPage <= 1}
                    onPress={() => setUserPage((p) => Math.max(1, p - 1))}
                    style={[styles.secondaryChip, userPage <= 1 && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Prev</Text>
                  </Pressable>
                  <Pressable
                    disabled={userPage >= totalUserPages}
                    onPress={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                    style={[styles.secondaryChip, userPage >= totalUserPages && styles.secondaryChipDisabled]}
                  >
                    <Text style={styles.secondaryChipText}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {userMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{userMessage}</Text>
              </View>
            ) : null}
            {userError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{userError}</Text>
              </View>
            ) : null}

            {userLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading users...</Text>
              </View>
            ) : (
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList}>
                {visibleUsers.map((user) => {
                  const name =
                    user.firstName || user.lastName
                      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                      : user.username;
                  return (
                    <Pressable
                      key={user.id ?? user.username}
                      style={[styles.orgCard, userForm.id === user.id && styles.orgCardActive]}
                      onPress={() => startUserEdit(user)}
                    >
                      <View style={styles.orgHeader}>
                        <Text style={styles.orgName}>{name}</Text>
                        <Text style={styles.orgType}>{user.status || 'ACTIVE'}</Text>
                      </View>
                      <Text style={styles.orgMeta}>
                        {user.username} - {user.email || 'No email'}
                      </Text>
                      <Text style={styles.orgMeta}>Roles: {(user.roles ?? []).join(', ') || 'None'}</Text>
                      <Text style={styles.orgMeta}>
                        Home org: {user.homeOrganizationId || 'Platform'}
                        {user.createdAt ? ` - Created ${user.createdAt}` : ''}
                      </Text>
                      <View style={styles.orgActions}>
                        <Pressable onPress={() => startUserEdit(user)} style={styles.orgAction}>
                          <Text style={styles.link}>Edit</Text>
                        </Pressable>
                        <Pressable onPress={() => handleUserDelete(user)} style={styles.orgAction}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
                {visibleUsers.length === 0 ? <Text style={styles.statusText}>No users match the filters.</Text> : null}
              </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{userForm.id ? 'Edit user' : 'Create user'}</Text>
              {userForm.id ? (
                <Pressable onPress={resetUserForm} style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Reset</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="Username"
                  placeholder="john.doe"
                  value={userForm.username}
                  onChangeText={(username) => setUserForm((prev) => ({ ...prev, username }))}
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="Email"
                  placeholder="john.doe@example.com"
                  value={userForm.email}
                  onChangeText={(email) => setUserForm((prev) => ({ ...prev, email }))}
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="First name"
                  placeholder="John"
                  value={userForm.firstName}
                  onChangeText={(firstName) => setUserForm((prev) => ({ ...prev, firstName }))}
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="Last name"
                  placeholder="Doe"
                  value={userForm.lastName}
                  onChangeText={(lastName) => setUserForm((prev) => ({ ...prev, lastName }))}
                />
              </View>
            </View>
            <InputField
              label="Password"
              placeholder={userForm.id ? 'Leave blank to keep current password' : 'At least 8 characters'}
              value={userForm.password}
              onChangeText={(password) => setUserForm((prev) => ({ ...prev, password }))}
              secureTextEntry
              autoComplete="password"
            />
            <Text style={styles.helperText}>Leave blank when editing to keep the existing password.</Text>
            <InputField
              label="Home organization id (optional for platform admins)"
              placeholder="org-aurora-retail"
              value={userForm.homeOrganizationId}
              onChangeText={(homeOrganizationId) => setUserForm((prev) => ({ ...prev, homeOrganizationId }))}
            />
            <InputField
              label="Expires at (ISO-8601, optional)"
              placeholder="2026-01-01T00:00:00"
              value={userForm.expiresAt}
              onChangeText={(expiresAt) => setUserForm((prev) => ({ ...prev, expiresAt }))}
            />
            <View style={styles.inputField}>
              <Text style={styles.label}>Roles</Text>
              <View style={styles.typeChips}>
                {USER_ROLES.map((role) => {
                  const selected = userForm.roles.includes(role);
                  return (
                    <Pressable
                      key={role}
                      onPress={() => toggleRole(role)}
                      style={[styles.typeChip, selected && styles.typeChipSelected]}
                    >
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{role}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.typeChips}>
                {USER_STATUSES.map((status) => {
                  const selected = userForm.status === status;
                  return (
                    <Pressable
                      key={status}
                      onPress={() => setUserForm((prev) => ({ ...prev, status }))}
                      style={[styles.typeChip, selected && styles.typeChipSelected]}
                    >
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{status}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <PrimaryButton
              label={userSaving ? 'Saving user...' : userForm.id ? 'Update user' : 'Create user'}
              onPress={handleUserSave}
              disabled={userSaving}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [authToken, setAuthToken] = useState<string | null>(null);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#1D4ED8" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#F9FAFB', '#F9FAFB', '#F9FAFB']} style={styles.background}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {authToken ? (
          <OrganizationAdminScreen token={authToken} onLogout={() => setAuthToken(null)} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <LoginScreen onAuthenticated={setAuthToken} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#F9FAFB' },
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  centered: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  hero: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeText: {
    color: '#1D4ED8',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  title: {
    color: '#0F172A',
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 16,
    elevation: 4,
  },
  cardWide: { maxWidth: 1100 },
  inputField: { gap: 6 },
  label: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  inputShell: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputShellError: { borderColor: '#DC2626' },
  input: {
    color: '#0F172A',
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
  },
  errorText: {
    color: '#DC2626',
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  flexHalf: {
    flex: 1,
  },
  addressRow: {
    width: '100%',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#1D4ED8',
    backgroundColor: '#E0E7FF',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1D4ED8',
  },
  rememberText: {
    color: '#0F172A',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  link: {
    color: '#1D4ED8',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    backgroundColor: '#E0E7FF',
  },
  statusText: {
    color: '#0F172A',
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },
  helperText: {
    color: '#6B7280',
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 6,
  },
  errorPill: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  tokenBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  tokenLabel: {
    color: '#6B7280',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  tokenValue: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  topBar: {
    width: '100%',
    maxWidth: 900,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  topBarLeft: { flex: 1, gap: 8 },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoutLabel: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tabButtonActive: {
    borderColor: '#1D4ED8',
    backgroundColor: '#1D4ED8',
  },
  tabButtonText: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#0F172A',
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
  },
  searchBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    color: '#0F172A',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F97316',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  secondaryChipText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
  },
  secondaryChipDisabled: {
    opacity: 0.4,
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orgListScroll: {
    maxHeight: 520,
  },
  orgList: { gap: 12 },
  orgCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  orgCardActive: {
    borderColor: '#1D4ED8',
    backgroundColor: '#E0E7FF',
  },
  orgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgName: {
    color: '#0F172A',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  orgType: {
    color: '#1D4ED8',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  orgMeta: {
    color: '#6B7280',
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
  },
  orgActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  orgAction: { paddingVertical: 4 },
  deleteText: {
    color: '#DC2626',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  typeChipSelected: {
    borderColor: '#1D4ED8',
    backgroundColor: '#E0E7FF',
  },
  typeChipText: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  typeChipTextSelected: { color: '#0F172A' },
  windowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  windowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
