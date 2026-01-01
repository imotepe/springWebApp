import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

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
  autoComplete?: 'email' | 'password' | 'off' | 'name' | 'tel' | 'url';
};

type DatePickerFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  testID?: string;
};

type TimeInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
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
  createdBy?: string;
  createdAt?: string;
  scheduleConfig?: ScheduleConfigDto;
  mapsLink?: string;
  facebookPage?: string;
  facebookGroup?: string;
  instagram?: string;
  whatsappContact?: string;
  logoImage?: string;
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

type OrganizationPickerFieldProps = {
  label: string;
  value: string;
  onSelect: (orgId: string) => void;
  organizations: Organization[];
  placeholder?: string;
  allowEmptyOption?: boolean;
  emptyLabel?: string;
};

type AppointmentPickerFieldProps = {
  label: string;
  value: string;
  onSelect: (appointmentId: string) => void;
  appointments: Appointment[];
  placeholder?: string;
  allowEmptyOption?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  disabledMessage?: string;
};

type CustomerPickerFieldProps = {
  label: string;
  value: string;
  onSelect: (customerId: string) => void;
  customers: Customer[];
  placeholder?: string;
  allowEmptyOption?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  disabledMessage?: string;
};

type ResourcePickerFieldProps = {
  label: string;
  value: string;
  onSelect: (resourceId: string) => void;
  resources: Resource[];
  placeholder?: string;
  allowEmptyOption?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  disabledMessage?: string;
};

type AppointmentTypePickerFieldProps = {
  label: string;
  value: string;
  onSelect: (appointmentTypeId: string) => void;
  appointmentTypes: AppointmentTypeDto[];
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
};

type PractitionerPickerFieldProps = {
  label: string;
  value: string;
  onSelect: (userId: string) => void;
  practitioners: User[];
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  loading?: boolean;
};

type AppointmentTypeMultiSelectFieldProps = {
  label: string;
  value: string;
  appointmentTypes: AppointmentTypeDto[];
  onChangeValue: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  loading?: boolean;
  error?: string | null;
};

type DurationOption = {
  label: string;
  minutes: number;
};

type DurationSelectFieldProps = {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string | null;
};

type DurationMultiSelectFieldProps = {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string | null;
};

type OrganizationType = {
  id?: string;
  name: string;
  description?: string;
  createdAt?: string;
};

type OrgFormState = {
  id?: string | null;
  name: string;
  marketingName: string;
  industry: string;
  type: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
   mapsLink: string;
   facebookPage: string;
   facebookGroup: string;
   instagram: string;
   whatsappContact: string;
   logoImage: string;
};

type UserRole =
  | 'SUPER_PLATFORM_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'AGENT'
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
  passwordConfirm: string;
  roles: UserRole[];
  homeOrganizationId: string;
  status: UserStatus;
  expiresAt: string;
  expiresDate: string;
  expiresTime: string;
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
  createdAt?: string;
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
  createdAt?: string;
  allowedAppointmentTypeIds?: string[];
  scheduleOverride?: ScheduleConfigDto | null;
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
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string;
  events?: AppointmentEvent[];
};

type AppointmentFormState = {
  id?: string | null;
  orgId: string;
  customerId: string;
  resourceId: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  notes: string;
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
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
  'AGENT',
  'PRACTITIONER',
];
const USER_ROLE_SET = new Set<UserRole>(USER_ROLES);
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
const DURATION_PRESET_OPTIONS: DurationOption[] = [
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '45 minutes', minutes: 45 },
  { label: '60 minutes', minutes: 60 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hour', minutes: 120 },
  { label: '1 day', minutes: 1440 },
];
const DURATION_PRESET_MINUTES = new Set(DURATION_PRESET_OPTIONS.map((option) => option.minutes));
type DatePickerView = 'day' | 'month' | 'year';
const HOURS_24 = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
const MINUTES = Array.from({ length: 60 }, (_, idx) => String(idx).padStart(2, '0'));

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
    return payload.roles.filter(
      (role): role is UserRole => typeof role === 'string' && USER_ROLE_SET.has(role as UserRole),
    );
  } catch {
    return [];
  }
}

function decodeUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base + '='.repeat((4 - (base.length % 4 || 4)) % 4);
    const decoded = typeof globalThis.atob === 'function' ? globalThis.atob(padded) : '';
    if (!decoded) return null;
    const payload = JSON.parse(decoded) as { sub?: string; userId?: string; id?: string };
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
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

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (raw: string): Date | null => {
  if (!raw) return null;
  const normalized = raw.replace(/\//g, '-').trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const candidate = new Date(year, month, day);
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month ||
    candidate.getDate() !== day
  ) {
    return null;
  }
  return candidate;
};

const parseTimeToParts = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return { hour: '09', minute: '00' };
  }
  const hour24 = Math.min(23, Math.max(0, Number(match[1])));
  const minute = match[2].padStart(2, '0');
  const hour = `${hour24}`.padStart(2, '0');
  return { hour, minute };
};

const normalizeTimeString = (value: string, fallback = '00:00') => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return fallback;
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const splitDateTime = (raw: string) => {
  if (!raw) return { date: '', time: '00:00' };
  const match = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/.exec(raw.trim());
  if (match) {
    return { date: match[1], time: normalizeTimeString(match[2]) };
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '00:00' };
  const date = formatIsoDate(parsed);
  const hour = parsed.getHours().toString().padStart(2, '0');
  const minute = parsed.getMinutes().toString().padStart(2, '0');
  return { date, time: `${hour}:${minute}` };
};

const buildDateTimeValue = (date: string, time: string) => {
  const safeDate = date.trim();
  if (!safeDate) return '';
  const safeTime = normalizeTimeString(time, '00:00');
  return `${safeDate}T${safeTime}:00`;
};

const DEFAULT_USER_EXPIRY_DAYS = 90;

const buildDefaultUserExpiry = () => {
  const expiresTime = '00:00';
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_USER_EXPIRY_DAYS);
  const expiresDate = formatIsoDate(date);
  return {
    expiresAt: buildDateTimeValue(expiresDate, expiresTime),
    expiresDate,
    expiresTime,
  };
};

const buildDefaultUserForm = (): UserFormState => {
  const expiry = buildDefaultUserExpiry();
  return {
    id: null,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    roles: [],
    homeOrganizationId: '',
    status: 'ACTIVE',
    expiresAt: expiry.expiresAt,
    expiresDate: expiry.expiresDate,
    expiresTime: expiry.expiresTime,
  };
};

const formatTimeFromParts = (hour: string, minute: string) => {
  const h = Math.max(0, Math.min(23, parseInt(hour, 10) || 0))
    .toString()
    .padStart(2, '0');
  const m = minute.padStart(2, '0');
  return `${h}:${m}`;
};

const parseCommaList = (value: string) => {
  const seen = new Set<string>();
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
};

const formatCommaList = (items: string[]) => items.join(', ');

const getOrganizationLabel = (organizations: Organization[], value: string) => {
  if (!value) return '';
  const match = organizations.find((org) => org.id === value);
  if (!match) return value;
  return match.marketingName || match.name || value;
};

const formatCustomerName = (customer: Customer) => {
  const parts = [customer.firstName, customer.name].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ').trim();
  }
  return customer.email || customer.phone || customer.id || 'Customer';
};

const formatResourceName = (resource: Resource) => {
  return resource.name || resource.type || resource.id || 'Resource';
};

const formatUserRoles = (roles?: UserRole[]) => {
  const visible = (roles ?? []).filter((role) => USER_ROLE_SET.has(role));
  return visible.length ? visible.join(', ') : 'None';
};

const resolveLogoUri = (logoImage: string) => {
  const trimmed = logoImage.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return `${API_BASE}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const parseDurationMinutes = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const minutes = Number(trimmed);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return minutes;
};

const formatDurationLabel = (minutes: number) => {
  const preset = DURATION_PRESET_OPTIONS.find((option) => option.minutes === minutes);
  if (preset) return preset.label;
  return `${minutes} minutes`;
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

function OrganizationPickerField({
  label,
  value,
  onSelect,
  organizations,
  placeholder = 'Select organization',
  allowEmptyOption = false,
  emptyLabel = 'All organizations',
}: OrganizationPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedLabel = getOrganizationLabel(organizations, value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return organizations;
    return organizations.filter((org) =>
      [org.id, org.name, org.marketingName, org.phone, org.createdBy]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    );
  }, [organizations, query]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value]);

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.dropdownTrigger, styles.dropdownTriggerRow]}
        onPress={() =>
          setOpen((prev) => {
            const next = !prev;
            if (next) setQuery('');
            return next;
          })
        }
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value ? selectedLabel : placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open ? '^' : 'v'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by id, name, marketing name, phone, createdBy"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {allowEmptyOption ? (
              <Pressable
                onPress={() => {
                  onSelect('');
                  setOpen(false);
                }}
                style={[styles.dropdownItem, value === '' && styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, value === '' && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  {emptyLabel}
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  Show all organizations
                </Text>
              </Pressable>
            ) : null}
            {filtered.length === 0 ? (
              <Text style={styles.statusText}>No organizations match the search.</Text>
            ) : (
              filtered.map((org) => (
                <Pressable
                  key={org.id ?? org.name}
                  onPress={() => {
                    onSelect(org.id || '');
                    setOpen(false);
                  }}
                  style={[styles.dropdownItem, value === org.id && styles.dropdownItemSelected]}
                >
                  <Text
                    style={[styles.dropdownItemLabel, value === org.id && styles.dropdownItemLabelSelected]}
                    numberOfLines={1}
                  >
                    {org.marketingName || org.name || org.id}
                  </Text>
                  <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                    {org.name || org.marketingName || 'Unnamed'} - {org.createdBy || 'unknown'}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function AppointmentPickerField({
  label,
  value,
  onSelect,
  appointments,
  placeholder = 'Select appointment',
  allowEmptyOption = true,
  emptyLabel = 'No appointment',
  disabled = false,
  disabledMessage = 'Select or save a customer to see appointments',
}: AppointmentPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((appt) =>
      [appt.id, appt.resourceId, appt.appointmentTypeId, appt.status, appt.startTime, appt.endTime]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    );
  }, [appointments, query]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {disabled ? disabledMessage : value || placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by id, resource, type, status"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {allowEmptyOption ? (
              <Pressable
                onPress={() => {
                  onSelect('');
                  setOpen(false);
                }}
                style={[styles.dropdownItem, value === '' && styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, value === '' && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  {emptyLabel}
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  No appointment linked
                </Text>
              </Pressable>
            ) : null}
            {filtered.length === 0 ? (
              <Text style={styles.statusText}>No appointments match the search.</Text>
            ) : (
              filtered.map((appt) => (
                <Pressable
                  key={appt.id ?? appt.startTime ?? appt.appointmentTypeId}
                  onPress={() => {
                    if (appt.id) {
                      onSelect(appt.id);
                      setOpen(false);
                    }
                  }}
                  style={[styles.dropdownItem, value === appt.id && styles.dropdownItemSelected]}
                >
                  <Text
                    style={[styles.dropdownItemLabel, value === appt.id && styles.dropdownItemLabelSelected]}
                    numberOfLines={1}
                  >
                    {appt.id || appt.appointmentTypeId || 'Appointment'}
                  </Text>
                  <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                    {appt.startTime || '--'} → {appt.endTime || '--'} · {appt.appointmentTypeId || 'type'} ·{' '}
                    {appt.status || 'SCHEDULED'}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function CustomerPickerField({
  label,
  value,
  onSelect,
  customers,
  placeholder = 'Select customer',
  allowEmptyOption = true,
  emptyLabel = 'No customer',
  disabled = false,
  disabledMessage = 'Select an organization to load customers',
}: CustomerPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      if (aTime !== bTime) {
        return bTime - aTime;
      }
      const aName = formatCustomerName(a).toLowerCase();
      const bName = formatCustomerName(b).toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [customers]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sortedCustomers;
    return sortedCustomers.filter((customer) => {
      const label = formatCustomerName(customer);
      return [
        customer.id,
        customer.email,
        customer.phone,
        customer.name,
        customer.firstName,
        label,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term));
    });
  }, [query, sortedCustomers]);

  const selectedLabel = useMemo(() => {
    const selected = customers.find((customer) => customer.id === value);
    if (!selected) return value;
    return formatCustomerName(selected);
  }, [customers, value]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  const displayValue = disabled
    ? value
      ? selectedLabel || value
      : disabledMessage
    : selectedLabel || placeholder;
  const displayStyle = value ? styles.dropdownValue : styles.dropdownPlaceholder;

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={displayStyle}>{displayValue}</Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, email, phone"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {allowEmptyOption ? (
              <Pressable
                onPress={() => {
                  onSelect('');
                  setOpen(false);
                }}
                style={[styles.dropdownItem, value === '' && styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, value === '' && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  {emptyLabel}
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  No customer selected
                </Text>
              </Pressable>
            ) : null}
            {filtered.length === 0 ? (
              <Text style={styles.statusText}>No customers match the search.</Text>
            ) : (
              filtered.map((customer) => {
                const label = formatCustomerName(customer);
                const descriptionParts = [customer.email, customer.phone, customer.id].filter(Boolean);
                return (
                  <Pressable
                    key={customer.id ?? label}
                    onPress={() => {
                      if (customer.id) {
                        onSelect(customer.id);
                        setOpen(false);
                      }
                    }}
                    style={[styles.dropdownItem, value === customer.id && styles.dropdownItemSelected]}
                  >
                    <Text
                      style={[styles.dropdownItemLabel, value === customer.id && styles.dropdownItemLabelSelected]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                    <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                      {descriptionParts.join(' - ') || 'No details'}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function ResourcePickerField({
  label,
  value,
  onSelect,
  resources,
  placeholder = 'Select resource',
  allowEmptyOption = true,
  emptyLabel = 'No resource',
  disabled = false,
  disabledMessage = 'Select an organization to load resources',
}: ResourcePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      if (aTime !== bTime) {
        return bTime - aTime;
      }
      const aName = formatResourceName(a).toLowerCase();
      const bName = formatResourceName(b).toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [resources]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sortedResources;
    return sortedResources.filter((resource) => {
      const label = formatResourceName(resource);
      return [resource.id, resource.name, resource.type, resource.kind, label]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term));
    });
  }, [query, sortedResources]);

  const selectedLabel = useMemo(() => {
    const selected = resources.find((resource) => resource.id === value);
    if (!selected) return value;
    return formatResourceName(selected);
  }, [resources, value]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  const displayValue = disabled
    ? value
      ? selectedLabel || value
      : disabledMessage
    : selectedLabel || placeholder;
  const displayStyle = value ? styles.dropdownValue : styles.dropdownPlaceholder;

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={displayStyle}>{displayValue}</Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, type, kind"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {allowEmptyOption ? (
              <Pressable
                onPress={() => {
                  onSelect('');
                  setOpen(false);
                }}
                style={[styles.dropdownItem, value === '' && styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, value === '' && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  {emptyLabel}
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  No resource selected
                </Text>
              </Pressable>
            ) : null}
            {filtered.length === 0 ? (
              <Text style={styles.statusText}>No resources match the search.</Text>
            ) : (
              filtered.map((resource) => {
                const label = formatResourceName(resource);
                const descriptionParts = [resource.type, resource.kind, resource.id].filter(Boolean);
                return (
                  <Pressable
                    key={resource.id ?? label}
                    onPress={() => {
                      if (resource.id) {
                        onSelect(resource.id);
                        setOpen(false);
                      }
                    }}
                    style={[styles.dropdownItem, value === resource.id && styles.dropdownItemSelected]}
                  >
                    <Text
                      style={[styles.dropdownItemLabel, value === resource.id && styles.dropdownItemLabelSelected]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                    <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                      {descriptionParts.join(' - ') || 'No details'}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function AppointmentTypePickerField({
  label,
  value,
  onSelect,
  appointmentTypes,
  placeholder = 'Select appointment type',
  disabled = false,
  disabledMessage = 'Select a resource to load appointment types',
}: AppointmentTypePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return appointmentTypes;
    return appointmentTypes.filter((type) =>
      [type.id, type.name, type.category]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    );
  }, [appointmentTypes, query]);

  const selectedLabel = useMemo(() => {
    const selected = appointmentTypes.find((type) => type.id === value);
    if (!selected) return value;
    return selected.name || selected.id || value;
  }, [appointmentTypes, value]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  const displayValue = disabled
    ? value
      ? selectedLabel || value
      : disabledMessage
    : selectedLabel || placeholder;
  const displayStyle = value ? styles.dropdownValue : styles.dropdownPlaceholder;

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={displayStyle}>{displayValue}</Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, id, category"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {filtered.length === 0 ? (
              <Text style={styles.statusText}>No appointment types match the search.</Text>
            ) : (
              filtered.map((type) => {
                const label = type.name || type.id || 'Appointment type';
                const details = [type.category, type.defaultDurationMinutes != null ? `${type.defaultDurationMinutes} mins` : null]
                  .filter(Boolean)
                  .join(' - ');
                return (
                  <Pressable
                    key={type.id ?? label}
                    onPress={() => {
                      if (type.id) {
                        onSelect(type.id);
                        setOpen(false);
                      }
                    }}
                    style={[styles.dropdownItem, value === type.id && styles.dropdownItemSelected]}
                  >
                    <Text
                      style={[styles.dropdownItemLabel, value === type.id && styles.dropdownItemLabelSelected]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                    <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                      {details || 'No details'}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function PractitionerPickerField({
  label,
  value,
  onSelect,
  practitioners,
  placeholder = 'Select practitioner',
  disabled = false,
  disabledMessage = 'Select an organization to load practitioners',
  loading = false,
}: PractitionerPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return practitioners;
    return practitioners.filter((user) => {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
      return [
        user.id,
        user.username,
        user.email,
        fullName,
        user.homeOrganizationId,
      ]
        .filter(Boolean)
        .map((field) => field!.toLowerCase())
        .some((field) => field.includes(term));
    });
  }, [practitioners, query]);

  const selectedLabel = useMemo(() => {
    const selected = practitioners.find((p) => p.id === value);
    if (!selected) return value;
    const name = `${selected.firstName ?? ''} ${selected.lastName ?? ''}`.trim();
    const handle = selected.username || selected.email || selected.id || '';
    return name ? `${name} (${handle})` : handle;
  }, [practitioners, value]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {disabled ? disabledMessage : selectedLabel || placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by id, username, email, name"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          {loading ? (
            <View style={[styles.dropdownList, { padding: 12 }]}>
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading practitioners...</Text>
              </View>
            </View>
          ) : (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              <Pressable
                onPress={() => {
                  onSelect('');
                  setOpen(false);
                }}
                style={[styles.dropdownItem, value === '' && styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, value === '' && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  No practitioner
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  Leave practitioner user empty
                </Text>
              </Pressable>
              {filtered.length === 0 ? (
                <Text style={styles.statusText}>No practitioners found for this org.</Text>
              ) : (
                filtered.map((user) => {
                  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
                  const handle = user.username || user.email || user.id || 'Unknown user';
                  return (
                    <Pressable
                      key={user.id ?? handle}
                      onPress={() => {
                        if (user.id) {
                          onSelect(user.id);
                          setOpen(false);
                        }
                      }}
                      style={[styles.dropdownItem, value === user.id && styles.dropdownItemSelected]}
                    >
                      <Text
                        style={[styles.dropdownItemLabel, value === user.id && styles.dropdownItemLabelSelected]}
                        numberOfLines={1}
                      >
                        {name ? `${name} (${handle})` : handle}
                      </Text>
                      <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                        {user.homeOrganizationId ? `Org: ${user.homeOrganizationId}` : 'No org set'}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      ) : null}
    </View>
  );
}

function AppointmentTypeMultiSelectField({
  label,
  value,
  appointmentTypes,
  onChangeValue,
  placeholder = 'Any appointment type',
  disabled = false,
  disabledMessage = 'Select an organization to load appointment types',
  loading = false,
  error = null,
}: AppointmentTypeMultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedIds = useMemo(() => parseCommaList(value), [value]);
  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    appointmentTypes.forEach((type) => {
      if (type.id) {
        map.set(type.id, type.name || type.id);
      }
    });
    return map;
  }, [appointmentTypes]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return appointmentTypes;
    return appointmentTypes.filter((type) =>
      [type.id, type.name, type.category]
        .filter(Boolean)
        .map((field) => field!.toLowerCase())
        .some((field) => field.includes(term)),
    );
  }, [appointmentTypes, query]);

  const selectedLabel = useMemo(() => {
    if (selectedIds.length === 0) return '';
    return selectedIds.map((id) => labelById.get(id) || id).join(', ');
  }, [labelById, selectedIds]);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  const toggleSelection = (typeId: string) => {
    const exists = selectedIds.includes(typeId);
    const next = exists ? selectedIds.filter((id) => id !== typeId) : [...selectedIds, typeId];
    onChangeValue(formatCommaList(next));
  };

  const clearSelection = () => onChangeValue('');

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {disabled ? disabledMessage : selectedLabel || placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by id, name, category"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          {loading ? (
            <View style={[styles.dropdownList, { padding: 12 }]}>
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.statusText}>Loading appointment types...</Text>
              </View>
            </View>
          ) : (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              <Pressable
                onPress={() => {
                  clearSelection();
                  setOpen(false);
                }}
                style={[styles.dropdownItem, selectedIds.length === 0 && styles.dropdownItemSelected]}
              >
                <Text
                  style={[styles.dropdownItemLabel, selectedIds.length === 0 && styles.dropdownItemLabelSelected]}
                  numberOfLines={1}
                >
                  Any appointment type
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  No restrictions
                </Text>
              </Pressable>
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : filtered.length === 0 ? (
                <Text style={styles.statusText}>No appointment types found.</Text>
              ) : (
                filtered.map((type, idx) => {
                  const typeId = type.id ?? '';
                  const selected = typeId ? selectedIds.includes(typeId) : false;
                  const labelText = type.name || typeId || 'Appointment type';
                  const details: string[] = [];
                  if (typeId) details.push(`ID: ${typeId}`);
                  if (type.category) details.push(type.category);
                  if (type.defaultDurationMinutes != null) details.push(`${type.defaultDurationMinutes} mins`);
                  if (type.active === false) details.push('inactive');
                  const description = details.join(' - ') || 'No details';
                  return (
                    <Pressable
                      key={typeId || `${labelText}-${idx}`}
                      onPress={() => {
                        if (typeId) {
                          toggleSelection(typeId);
                        }
                      }}
                      style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                    >
                      <Text
                        style={[styles.dropdownItemLabel, selected && styles.dropdownItemLabelSelected]}
                        numberOfLines={1}
                      >
                        {labelText}
                      </Text>
                      <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                        {description}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      ) : null}
    </View>
  );
}

function DurationSelectField({
  label,
  value,
  onChangeValue,
  placeholder = 'Select duration',
  disabled = false,
  disabledMessage = 'Select a duration',
  error = null,
}: DurationSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedMinutes = useMemo(() => parseDurationMinutes(value), [value]);
  const selectedLabel = useMemo(() => {
    if (selectedMinutes == null) return '';
    return formatDurationLabel(selectedMinutes);
  }, [selectedMinutes]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return DURATION_PRESET_OPTIONS;
    return DURATION_PRESET_OPTIONS.filter(
      (option) => option.label.toLowerCase().includes(term) || String(option.minutes).includes(term),
    );
  }, [query]);

  const customMinutes = useMemo(() => parseDurationMinutes(query), [query]);
  const hasCustomSelection = selectedMinutes != null && !DURATION_PRESET_MINUTES.has(selectedMinutes);
  const showCustomOption =
    customMinutes != null && !DURATION_PRESET_MINUTES.has(customMinutes) && customMinutes !== selectedMinutes;

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  const handleSelect = (minutes: number | null) => {
    onChangeValue(minutes == null ? '' : String(minutes));
    setOpen(false);
  };

  const isEmpty = value.trim().length === 0;

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {disabled ? disabledMessage : selectedLabel || placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search durations or enter minutes"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            <Pressable
              onPress={() => handleSelect(null)}
              style={[styles.dropdownItem, isEmpty && styles.dropdownItemSelected]}
            >
              <Text style={[styles.dropdownItemLabel, isEmpty && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                No default duration
              </Text>
              <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                Leave default duration empty
              </Text>
            </Pressable>
            {hasCustomSelection && selectedMinutes != null ? (
              <Pressable
                onPress={() => handleSelect(selectedMinutes)}
                style={[styles.dropdownItem, styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  Custom: {selectedMinutes} minutes
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  Custom value
                </Text>
              </Pressable>
            ) : null}
            {showCustomOption && customMinutes != null ? (
              <Pressable onPress={() => handleSelect(customMinutes)} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemLabel} numberOfLines={1}>
                  Use {customMinutes} minutes
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  Custom value
                </Text>
              </Pressable>
            ) : null}
            {filtered.length === 0 ? (
              <Text style={styles.statusText}>No durations match the search.</Text>
            ) : (
              filtered.map((option, idx) => {
                const selected = selectedMinutes != null && option.minutes === selectedMinutes;
                return (
                  <Pressable
                    key={`${option.label}-${option.minutes}-${idx}`}
                    onPress={() => handleSelect(option.minutes)}
                    style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                  >
                    <Text style={[styles.dropdownItemLabel, selected && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                      {option.label}
                    </Text>
                    <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                      {option.minutes} minutes
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function DurationMultiSelectField({
  label,
  value,
  onChangeValue,
  placeholder = 'Any duration',
  disabled = false,
  disabledMessage = 'Select durations',
  error = null,
}: DurationMultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedMinutes = useMemo(() => {
    const minutes: number[] = [];
    const seen = new Set<number>();
    parseCommaList(value).forEach((item) => {
      const parsed = parseDurationMinutes(item);
      if (parsed != null && !seen.has(parsed)) {
        seen.add(parsed);
        minutes.push(parsed);
      }
    });
    return minutes;
  }, [value]);

  const selectedLabel = useMemo(() => {
    if (selectedMinutes.length === 0) return '';
    return selectedMinutes.map(formatDurationLabel).join(', ');
  }, [selectedMinutes]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return DURATION_PRESET_OPTIONS;
    return DURATION_PRESET_OPTIONS.filter(
      (option) => option.label.toLowerCase().includes(term) || String(option.minutes).includes(term),
    );
  }, [query]);

  const customMinutes = useMemo(() => parseDurationMinutes(query), [query]);
  const customSelected = useMemo(
    () => selectedMinutes.filter((minutes) => !DURATION_PRESET_MINUTES.has(minutes)),
    [selectedMinutes],
  );
  const showCustomOption =
    customMinutes != null && !DURATION_PRESET_MINUTES.has(customMinutes) && !selectedMinutes.includes(customMinutes);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [value, disabled]);

  const toggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery('');
      return next;
    });
  };

  const toggleSelection = (minutes: number) => {
    const exists = selectedMinutes.includes(minutes);
    const next = exists ? selectedMinutes.filter((entry) => entry !== minutes) : [...selectedMinutes, minutes];
    onChangeValue(formatCommaList(next.map(String)));
  };

  const clearSelection = () => onChangeValue('');

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.dropdownTrigger,
          styles.dropdownTriggerRow,
          disabled && { backgroundColor: 'rgba(229,231,235,0.6)' },
        ]}
        onPress={toggle}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {disabled ? disabledMessage : selectedLabel || placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open && !disabled ? '^' : 'v'}</Text>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.dropdownPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search durations or enter minutes"
            placeholderTextColor="rgba(107,114,128,0.7)"
            style={styles.dropdownSearchInput}
            autoCapitalize="none"
          />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            <Pressable
              onPress={() => {
                clearSelection();
                setOpen(false);
              }}
              style={[styles.dropdownItem, selectedMinutes.length === 0 && styles.dropdownItemSelected]}
            >
              <Text
                style={[styles.dropdownItemLabel, selectedMinutes.length === 0 && styles.dropdownItemLabelSelected]}
                numberOfLines={1}
              >
                Any duration
              </Text>
              <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                No restrictions
              </Text>
            </Pressable>
            {customSelected.map((minutes) => (
              <Pressable
                key={`custom-${minutes}`}
                onPress={() => toggleSelection(minutes)}
                style={[styles.dropdownItem, styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemLabel, styles.dropdownItemLabelSelected]} numberOfLines={1}>
                  Custom: {minutes} minutes
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  Custom value
                </Text>
              </Pressable>
            ))}
            {showCustomOption && customMinutes != null ? (
              <Pressable onPress={() => toggleSelection(customMinutes)} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemLabel} numberOfLines={1}>
                  Add {customMinutes} minutes
                </Text>
                <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                  Custom value
                </Text>
              </Pressable>
            ) : null}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : filtered.length === 0 ? (
              <Text style={styles.statusText}>No durations match the search.</Text>
            ) : (
              filtered.map((option, idx) => {
                const selected = selectedMinutes.includes(option.minutes);
                return (
                  <Pressable
                    key={`${option.label}-${option.minutes}-${idx}`}
                    onPress={() => toggleSelection(option.minutes)}
                    style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                  >
                    <Text style={[styles.dropdownItemLabel, selected && styles.dropdownItemLabelSelected]} numberOfLines={1}>
                      {option.label}
                    </Text>
                    <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                      {option.minutes} minutes
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function DatePickerField({ label, placeholder = 'YYYY-MM-DD', value, onChangeText, testID }: DatePickerFieldProps) {
  const parsedValue = useMemo(() => parseDateValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => parsedValue ?? new Date());
  const [viewMode, setViewMode] = useState<DatePickerView>('day');
  const [dayCellSize, setDayCellSize] = useState<number | null>(null);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear - 120; y <= currentYear + 5; y += 1) {
      years.push(y);
    }
    return years;
  }, []);

  useEffect(() => {
    if (parsedValue) {
      setVisibleMonth(parsedValue);
    }
  }, [parsedValue]);

  const calendarCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [visibleMonth]);

  const monthLabel = `${MONTH_LABELS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;
  const visibleYear = visibleMonth.getFullYear();

  const handleSelectDay = (day: number) => {
    const nextDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    onChangeText(formatIsoDate(nextDate));
    setOpen(false);
    setViewMode('day');
  };

  const shiftMonth = (delta: number) => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const selectMonth = (monthIndex: number) => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), monthIndex, 1));
    setViewMode('day');
  };

  const selectYear = (year: number) => {
    setVisibleMonth((prev) => new Date(year, prev.getMonth(), 1));
    setViewMode('month');
  };

  const shiftYearPage = (deltaYears: number) => {
    setVisibleMonth((prev) => new Date(prev.getFullYear() + deltaYears, prev.getMonth(), 1));
  };

  const calendarBody = (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Pressable
          onPress={() =>
            viewMode === 'year' ? shiftYearPage(-12) : viewMode === 'month' ? shiftMonth(-12) : shiftMonth(-1)
          }
          style={styles.calendarArrow}
        >
          <Text style={styles.calendarArrowText}>{'<'}</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Pressable onPress={() => setViewMode('month')}>
            <Text style={styles.monthLabel}>{MONTH_LABELS[visibleMonth.getMonth()]}</Text>
          </Pressable>
          <Pressable onPress={() => setViewMode('year')}>
            <Text style={styles.monthLabel}>{visibleYear}</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() =>
            viewMode === 'year' ? shiftYearPage(12) : viewMode === 'month' ? shiftMonth(12) : shiftMonth(1)
          }
          style={styles.calendarArrow}
        >
          <Text style={styles.calendarArrowText}>{'>'}</Text>
        </Pressable>
      </View>
      {viewMode === 'month' ? (
        <View style={styles.monthGrid}>
          {MONTH_LABELS.map((name, idx) => {
            const active = idx === visibleMonth.getMonth();
            return (
              <Pressable
                key={name}
                onPress={() => selectMonth(idx)}
                style={[styles.monthGridItem, active && styles.monthGridItemActive]}
              >
                <Text style={[styles.monthGridText, active && styles.monthGridTextActive]}>{name.slice(0, 3)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : viewMode === 'year' ? (
        <View style={styles.yearGrid}>
          {Array.from({ length: 12 }).map((_, idx) => {
            const baseYear = Math.floor(visibleYear / 12) * 12;
            const year = baseYear - 1 + idx;
            const active = year === visibleYear;
            return (
              <Pressable
                key={year}
                onPress={() => selectYear(year)}
                style={[styles.yearGridItem, active && styles.yearGridItemActive]}
              >
                <Text style={[styles.yearGridText, active && styles.yearGridTextActive]}>{year}</Text>
              </Pressable>
            );
          })}
        </View>
          ) : (
            <>
              <View style={styles.weekRow}>
                {WEEKDAY_LABELS.map((name) => (
                  <Text key={name} style={styles.weekday}>
                    {name}
                  </Text>
                ))}
              </View>
              <View
                style={styles.dayGrid}
                onLayout={(e) => {
                  const width = e.nativeEvent.layout.width;
                  if (width > 0) {
                    const size = Math.floor(width / 7);
                    setDayCellSize(size > 28 ? size : 32);
                  }
                }}
              >
                {calendarCells.flat().map((day, idx) => {
                  const isSelected =
                    day !== null &&
                    parsedValue &&
                    parsedValue.getDate() === day &&
                    parsedValue.getMonth() === visibleMonth.getMonth() &&
                    parsedValue.getFullYear() === visibleMonth.getFullYear();
                  return (
                    <Pressable
                      key={`cell-${idx}-${day ?? 'empty'}`}
                      disabled={day === null}
                      onPress={() => day && handleSelectDay(day)}
                      style={[
                        styles.dayCell,
                        { width: dayCellSize ?? 44, height: dayCellSize ?? 44 },
                        day === null && styles.dayCellEmpty,
                        isSelected && styles.dayCellSelected,
                      ]}
                    >
                      <Text style={[styles.dayText, day === null && styles.dayTextEmpty, isSelected && styles.dayTextSelected]}>
                        {day ?? ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
  );

  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        onPressIn={() => setOpen(true)}
        testID={testID}
        style={({ pressed }) => [
          styles.dateInputShell,
          open && styles.dateInputShellActive,
          pressed && styles.dateInputShellPressed,
        ]}
      >
        <Text style={[styles.dateValue, !value && styles.datePlaceholder]}>{value || placeholder}</Text>
        <View style={styles.dateIcon}>
          <View style={styles.dateIconTop} />
          <View style={styles.dateIconBody} />
        </View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.calendarOverlay} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.calendarCardWrapper}
            onPress={(e) => {
              // prevent closing when interacting inside the card
              if (e && typeof (e as any).stopPropagation === 'function') {
                (e as any).stopPropagation();
              }
            }}
          >
            {calendarBody}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function TimeInput({ label, value, onChangeText }: TimeInputProps) {
  const parts = useMemo(() => parseTimeToParts(value || '09:00'), [value]);
  const { hour, minute } = parts;

  const [openPart, setOpenPart] = useState<null | 'hour' | 'minute'>(null);

  const selectValue = (part: 'hour' | 'minute', val: string) => {
    if (part === 'hour') {
      onChangeText(formatTimeFromParts(val, minute));
    } else if (part === 'minute') {
      onChangeText(formatTimeFromParts(hour, val));
    }
    setOpenPart(null);
  };

  const options = openPart === 'hour' ? HOURS_24 : MINUTES;

  return (
    <View style={styles.timeInput}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeRow}>
        <Pressable onPress={() => setOpenPart('hour')} style={styles.timePill}>
          <Text style={styles.timeValue}>{hour}</Text>
          <Text style={styles.timeCaret}>˅</Text>
        </Pressable>
        <Pressable onPress={() => setOpenPart('minute')} style={styles.timePill}>
          <Text style={styles.timeValue}>{minute}</Text>
          <Text style={styles.timeCaret}>˅</Text>
        </Pressable>
      </View>
      <Modal
        visible={openPart !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenPart(null)}
      >
        <Pressable style={styles.timeModalOverlay} onPress={() => setOpenPart(null)}>
          <View style={styles.timeModalCard}>
            <ScrollView style={styles.timeOptions}>
          {options.map((opt) => {
            const active = (openPart === 'hour' && opt === hour) || (openPart === 'minute' && opt === minute);
            return (
              <Pressable
                key={opt}
                onPress={() => selectValue(openPart as 'hour' | 'minute', opt)}
                style={[styles.timeOption, active && styles.timeOptionActive]}
              >
                <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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

type ScheduleEditorProps = {
  form: ScheduleFormState;
  activeDay: DayName;
  setActiveDay: Dispatch<SetStateAction<DayName>>;
  toggleWorkingDay: (day: DayName) => void;
  applyDays: DayName[];
  toggleApplyDay: (day: DayName) => void;
  newBusinessWindow: TimeWindowInput;
  setNewBusinessWindow: Dispatch<SetStateAction<TimeWindowInput>>;
  addBusinessWindow: () => void;
  removeBusinessWindow: (day: DayName, index: number) => void;
  newBreakWindow: TimeWindowInput;
  setNewBreakWindow: Dispatch<SetStateAction<TimeWindowInput>>;
  addBreakWindow: () => void;
  removeBreakWindow: (day: DayName, index: number) => void;
  clearHoursAndBreaks: () => void;
  newHoliday: HolidayInput;
  setNewHoliday: Dispatch<SetStateAction<HolidayInput>>;
  holidayWindow: TimeWindowInput;
  setHolidayWindow: Dispatch<SetStateAction<TimeWindowInput>>;
  addHoliday: () => void;
  removeHoliday: (index: number) => void;
  footer?: ReactNode;
};

function ScheduleEditor({
  form,
  activeDay,
  setActiveDay,
  toggleWorkingDay,
  applyDays,
  toggleApplyDay,
  newBusinessWindow,
  setNewBusinessWindow,
  addBusinessWindow,
  removeBusinessWindow,
  newBreakWindow,
  setNewBreakWindow,
  addBreakWindow,
  removeBreakWindow,
  clearHoursAndBreaks,
  newHoliday,
  setNewHoliday,
  holidayWindow,
  setHolidayWindow,
  addHoliday,
  removeHoliday,
  footer,
}: ScheduleEditorProps) {
  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Working days</Text>
      </View>
      <View style={styles.typeChips}>
        {DAY_NAMES.map((day) => {
          const enabled = form.workingDays.includes(day);
          return (
            <Pressable
              key={day}
              onPress={() => toggleWorkingDay(day)}
              style={[styles.typeChip, enabled && styles.typeChipSelected]}
            >
              <Text style={[styles.typeChipText, enabled && styles.typeChipTextSelected]}>{DAY_LABELS[day]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.inputField, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Edit day</Text>
        <View style={styles.typeChips}>
          {DAY_NAMES.map((day) => (
            <Pressable
              key={day}
              style={[styles.typeChip, activeDay === day && styles.typeChipSelected]}
              onPress={() => setActiveDay(day)}
            >
              <Text style={[styles.typeChipText, activeDay === day && styles.typeChipTextSelected]}>{DAY_LABELS[day]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.inputField, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>Apply hours & breaks to</Text>
        <Text style={styles.helperText}>Leave empty to apply only to {DAY_LABELS[activeDay]}.</Text>
        <View style={styles.typeChips}>
          {DAY_NAMES.map((day) => {
            const selected = applyDays.includes(day);
            return (
              <Pressable
                key={`apply-${day}`}
                style={[styles.typeChip, selected && styles.typeChipSelected]}
                onPress={() => toggleApplyDay(day)}
              >
                <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{DAY_LABELS[day]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={clearHoursAndBreaks} style={styles.secondaryChipCompact}>
          <Text style={styles.secondaryChipText}>Clear all hours & breaks</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Business hours ({DAY_LABELS[activeDay]})</Text>
      </View>
      <View style={styles.orgList}>
        {form.businessHours[activeDay].length === 0 ? (
          <Text style={styles.statusText}>No business hours for {DAY_LABELS[activeDay]}.</Text>
        ) : (
          form.businessHours[activeDay].map((window, idx) => (
            <View key={`bh-${activeDay}-${idx}`} style={styles.orgCard}>
              <View style={styles.orgHeader}>
                <Text style={styles.orgName}>
                  {window.start || '--:--'} - {window.end || '--:--'}
                </Text>
                <Pressable onPress={() => removeBusinessWindow(activeDay, idx)} style={styles.orgAction}>
                  <Text style={styles.deleteText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={styles.row}>
        <View style={styles.flexHalf}>
          <TimeInput
            label="Start"
            value={newBusinessWindow.start}
            onChangeText={(start) => setNewBusinessWindow((prev) => ({ ...prev, start }))}
          />
        </View>
        <View style={styles.flexHalf}>
          <TimeInput
            label="End"
            value={newBusinessWindow.end}
            onChangeText={(end) => setNewBusinessWindow((prev) => ({ ...prev, end }))}
          />
        </View>
      </View>
      <Pressable onPress={addBusinessWindow} style={styles.secondaryChipCompact}>
        <Text style={styles.secondaryChipText}>Add business window</Text>
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Breaks ({DAY_LABELS[activeDay]})</Text>
      </View>
      <View style={styles.orgList}>
        {form.breaks[activeDay].length === 0 ? (
          <Text style={styles.statusText}>No breaks for {DAY_LABELS[activeDay]}.</Text>
        ) : (
          form.breaks[activeDay].map((window, idx) => (
            <View key={`br-${activeDay}-${idx}`} style={styles.orgCard}>
              <View style={styles.orgHeader}>
                <Text style={styles.orgName}>
                  {window.start || '--:--'} - {window.end || '--:--'}
                </Text>
                <Pressable onPress={() => removeBreakWindow(activeDay, idx)} style={styles.orgAction}>
                  <Text style={styles.deleteText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={styles.row}>
        <View style={styles.flexHalf}>
          <TimeInput
            label="Break start"
            value={newBreakWindow.start}
            onChangeText={(start) => setNewBreakWindow((prev) => ({ ...prev, start }))}
          />
        </View>
        <View style={styles.flexHalf}>
          <TimeInput
            label="Break end"
            value={newBreakWindow.end}
            onChangeText={(end) => setNewBreakWindow((prev) => ({ ...prev, end }))}
          />
        </View>
      </View>
      <Pressable onPress={addBreakWindow} style={styles.secondaryChipCompact}>
        <Text style={styles.secondaryChipText}>Add break window</Text>
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Holidays</Text>
      </View>
      <View style={styles.orgList}>
        {form.holidays.map((holiday, idx) => (
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
        {form.holidays.length === 0 ? <Text style={styles.statusText}>No holidays defined.</Text> : null}
      </View>
      <View style={styles.row}>
        <View style={styles.flexHalf}>
          <DatePickerField
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
            <TimeInput
              label="Closed from"
              value={holidayWindow.start}
              onChangeText={(start) => setHolidayWindow((prev) => ({ ...prev, start }))}
            />
          </View>
          <View style={styles.flexHalf}>
            <TimeInput
              label="Closed to"
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
      {footer}
    </>
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
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadMessage, setLogoUploadMessage] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
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
  const [orgTypePickerOpen, setOrgTypePickerOpen] = useState(false);
  const [orgTypeQuery, setOrgTypeQuery] = useState('');
  const [homeOrgPickerOpen, setHomeOrgPickerOpen] = useState(false);
  const [homeOrgQuery, setHomeOrgQuery] = useState('');
  const [resourceOrgPickerOpen, setResourceOrgPickerOpen] = useState(false);
  const [resourceOrgQuery, setResourceOrgQuery] = useState('');
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;
    const maxButtons = 10;
    const start = Math.max(1, Math.min(currentPage - 4, totalPages - maxButtons + 1));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const pages = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    const goTo = (p: number) => onChange(Math.min(totalPages, Math.max(1, p)));
    return (
      <View style={styles.paginationRow}>
        <Pressable
          disabled={currentPage <= 1}
          onPress={() => goTo(currentPage - 1)}
          style={[styles.paginationLink, currentPage <= 1 && styles.paginationLinkDisabled]}
        >
          <Text style={[styles.paginationText, currentPage <= 1 && styles.paginationTextDisabled]}>{'< prev'}</Text>
        </Pressable>
        <View style={styles.paginationNumbers}>
          {pages.map((page) => {
            const active = page === currentPage;
            return (
              <Pressable
                key={page}
                onPress={() => goTo(page)}
                style={[styles.paginationNumber, active && styles.paginationNumberActive]}
              >
                <Text style={[styles.paginationText, active && styles.paginationTextActive]}>
                  {page}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          disabled={currentPage >= totalPages}
          onPress={() => goTo(currentPage + 1)}
          style={[styles.paginationLink, currentPage >= totalPages && styles.paginationLinkDisabled]}
        >
          <Text style={[styles.paginationText, currentPage >= totalPages && styles.paginationTextDisabled]}>{'next >'}</Text>
        </Pressable>
      </View>
    );
  };

  const roles = useMemo(() => decodeRolesFromToken(token), [token]);
  const currentUserId = useMemo(() => decodeUserIdFromToken(token), [token]);
  const isSuperAdmin = roles.includes('SUPER_PLATFORM_ADMIN');
  const isPlatformAdminOnly = roles.includes('PLATFORM_ADMIN') && !isSuperAdmin;
  const isPlatformUser = roles.some((role) => PLATFORM_ROLES.includes(role));
  const canManageOrganizations = isPlatformUser;
  const canManageOrgTypes = isPlatformUser;
  const assignableRoles = useMemo<UserRole[]>(() => {
    if (isSuperAdmin) return USER_ROLES;
    if (isPlatformAdminOnly) {
      return USER_ROLES.filter(
        (role) => role !== 'SUPER_PLATFORM_ADMIN' && role !== 'PLATFORM_ADMIN',
      );
    }
    return USER_ROLES.filter((role) => role !== 'SUPER_PLATFORM_ADMIN' && role !== 'PLATFORM_ADMIN');
  }, [isPlatformAdminOnly, isSuperAdmin]);
  const canViewCustomers = !isPlatformAdminOnly;
  const canViewAppointments = !isPlatformAdminOnly;
  const availableTabs = useMemo<TabKey[]>(() => {
    const tabs: TabKey[] = [];
    if (canManageOrganizations) {
      tabs.push('orgs');
    }
    if (canManageOrgTypes) {
      tabs.push('types');
    }
    tabs.push('schedule', 'users');
    if (canViewCustomers) {
      tabs.push('customers');
    }
    tabs.push('resources');
    if (canViewAppointments) {
      tabs.push('appointments');
    }
    tabs.push('appointmentTypes');
    return tabs;
  }, [canManageOrgTypes, canManageOrganizations, canViewAppointments, canViewCustomers]);
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] ?? 'orgs');
    }
  }, [activeTab, availableTabs]);
  const [scheduleOrgId, setScheduleOrgId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(defaultScheduleForm());
  const [activeDay, setActiveDay] = useState<DayName>('MONDAY');
  const [scheduleApplyDays, setScheduleApplyDays] = useState<DayName[]>([]);
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
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: '',
    mapsLink: '',
    facebookPage: '',
    facebookGroup: '',
    instagram: '',
    whatsappContact: '',
    logoImage: '',
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
  const [userForm, setUserForm] = useState<UserFormState>(buildDefaultUserForm);
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
    createdBy: currentUserId || '',
    createdAt: new Date().toISOString(),
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceMessage, setResourceMessage] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceOrgFilter, setResourceOrgFilter] = useState('');
  const [resourceAppointmentTypes, setResourceAppointmentTypes] = useState<AppointmentTypeDto[]>([]);
  const [resourceAppointmentTypeLoading, setResourceAppointmentTypeLoading] = useState(false);
  const [resourceAppointmentTypeError, setResourceAppointmentTypeError] = useState<string | null>(null);
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
  const [resourceScheduleEnabled, setResourceScheduleEnabled] = useState(false);
  const [resourceScheduleForm, setResourceScheduleForm] = useState<ScheduleFormState>(defaultScheduleForm());
  const [resourceActiveDay, setResourceActiveDay] = useState<DayName>('MONDAY');
  const [resourceApplyDays, setResourceApplyDays] = useState<DayName[]>([]);
  const [resourceScheduleError, setResourceScheduleError] = useState<string | null>(null);
  const [resourceNewBusinessWindow, setResourceNewBusinessWindow] = useState<TimeWindowInput>({
    start: '09:00',
    end: '17:00',
  });
  const [resourceNewBreakWindow, setResourceNewBreakWindow] = useState<TimeWindowInput>({
    start: '12:00',
    end: '13:00',
  });
  const [resourceNewHoliday, setResourceNewHoliday] = useState<HolidayInput>({
    date: '',
    allDay: true,
    description: '',
    closedWindows: [],
  });
  const [resourceHolidayWindow, setResourceHolidayWindow] = useState<TimeWindowInput>({
    start: '09:00',
    end: '12:00',
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
    startTime: '',
    endTime: '',
    notes: '',
    status: 'SCHEDULED',
  });
  const [appointmentStartDate, setAppointmentStartDate] = useState('');
  const [appointmentStartTime, setAppointmentStartTime] = useState('09:00');
  const [appointmentEndDate, setAppointmentEndDate] = useState('');
  const [appointmentEndTime, setAppointmentEndTime] = useState('09:30');
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
  const [interactionAppointments, setInteractionAppointments] = useState<Appointment[]>([]);
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

  const authFetchMultipart = useCallback(
    (path: string, formData: FormData) =>
      fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }),
    [token],
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
    [appointmentOrgFilter, authFetch],
  );

  const loadAppointmentsForCustomer = useCallback(
    async (customerId: string | null | undefined) => {
      const id = (customerId ?? '').trim();
      if (!id) {
        setInteractionAppointments([]);
        return;
      }
      try {
        const res = await authFetch(`/api/appointments?customerId=${encodeURIComponent(id)}`);
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as Appointment[];
        setInteractionAppointments(data);
      } catch {
        // ignore quietly; interaction picker will just be empty
      }
    },
    [authFetch],
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

  const loadResourceAppointmentTypes = useCallback(
    async (orgId?: string) => {
      setResourceAppointmentTypeLoading(true);
      setResourceAppointmentTypeError(null);
      try {
        const query = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
        const res = await authFetch(`/api/appointment-types${query}`);
        if (!res.ok) {
          setResourceAppointmentTypeError(await parseErrorMessage(res));
          setResourceAppointmentTypes([]);
          return;
        }
        const data = (await res.json()) as AppointmentTypeDto[];
        setResourceAppointmentTypes(data);
      } catch (error) {
        setResourceAppointmentTypeError(
          error instanceof Error ? error.message : 'Unable to load appointment types.',
        );
        setResourceAppointmentTypes([]);
      } finally {
        setResourceAppointmentTypeLoading(false);
      }
    },
    [authFetch],
  );

  const resetForm = useCallback(() => {
    setForm({
      id: null,
      name: '',
      marketingName: '',
      industry: '',
      type: orgTypes[0]?.name ?? '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      latitude: '',
      longitude: '',
      mapsLink: '',
      facebookPage: '',
      facebookGroup: '',
      instagram: '',
      whatsappContact: '',
      logoImage: '',
    });
    setFormError(null);
    setLogoUploadMessage(null);
    setLogoUploadError(null);
    setLogoUploading(false);
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

  useEffect(() => {
    const orgId = resourceForm.orgId.trim();
    if (!orgId || resourceForm.kind !== 'HUMAN') return;
    void loadUsers(orgId);
  }, [loadUsers, resourceForm.kind, resourceForm.orgId]);

  useEffect(() => {
    const orgId = resourceForm.orgId.trim();
    if (isPlatformUser && !orgId) {
      setResourceAppointmentTypes([]);
      setResourceAppointmentTypeError(null);
      setResourceAppointmentTypeLoading(false);
      return;
    }
    void loadResourceAppointmentTypes(orgId || undefined);
  }, [isPlatformUser, loadResourceAppointmentTypes, resourceForm.orgId]);

  const resetUserForm = useCallback(() => {
    setUserForm(buildDefaultUserForm());
    setUserError(null);
    setUserMessage(null);
    setHomeOrgPickerOpen(false);
    setHomeOrgQuery('');
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
    setInteractionAppointments([]);
    setInteractionsWorking([]);
    setInteractionForm({
      id: null,
      type: INTERACTION_TYPES[0],
      status: INTERACTION_STATUSES[0],
      comment: '',
      appointmentId: '',
      createdBy: currentUserId || '',
      createdAt: new Date().toISOString(),
    });
    setInteractionSearch('');
  }, []);

  const startUserEdit = (user: User) => {
    const { date: expiresDate, time: expiresTime } = splitDateTime(user.expiresAt ?? '');
    setUserForm({
      id: user.id ?? null,
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      password: '',
      passwordConfirm: '',
      roles: (user.roles ?? []).filter((role) => USER_ROLE_SET.has(role)),
      homeOrganizationId: user.homeOrganizationId ?? '',
      status: user.status ?? 'ACTIVE',
      expiresAt: user.expiresAt ?? '',
      expiresDate,
      expiresTime,
    });
    setUserError(null);
    setUserMessage(`Editing ${user.username || user.email || user.id || 'user'}`);
    setHomeOrgPickerOpen(false);
    setHomeOrgQuery('');
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
    setInteractionAppointments([]);
    setCustomerError(null);
    setCustomerMessage(`Editing ${customer.name || customer.email || customer.id || 'customer'}`);
    setInteractionsWorking(customer.interactions ?? []);
    setInteractionForm({
      id: null,
      type: INTERACTION_TYPES[0],
      status: INTERACTION_STATUSES[0],
      comment: '',
      appointmentId: '',
      createdBy: currentUserId || '',
      createdAt: new Date().toISOString(),
    });
    void loadAppointmentsForCustomer(customer.id);
    setInteractionSearch('');
  };

  const resetResourceSchedule = useCallback(() => {
    setResourceScheduleEnabled(false);
    setResourceScheduleForm(defaultScheduleForm());
    setResourceActiveDay('MONDAY');
    setResourceApplyDays([]);
    setResourceScheduleError(null);
    setResourceNewBusinessWindow({ start: '09:00', end: '17:00' });
    setResourceNewBreakWindow({ start: '12:00', end: '13:00' });
    setResourceNewHoliday({ date: '', allDay: true, description: '', closedWindows: [] });
    setResourceHolidayWindow({ start: '09:00', end: '12:00' });
  }, []);

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
    setResourceAppointmentTypeError(null);
    setResourceOrgPickerOpen(false);
    setResourceOrgQuery('');
    resetResourceSchedule();
  }, [resetResourceSchedule]);

  const resetAppointmentForm = useCallback(() => {
    setAppointmentForm({
      id: null,
      orgId: '',
      customerId: '',
      resourceId: '',
      appointmentTypeId: '',
      startTime: '',
      endTime: '',
      notes: '',
      status: 'SCHEDULED',
    });
    setAppointmentStartDate('');
    setAppointmentStartTime('09:00');
    setAppointmentEndDate('');
    setAppointmentEndTime('09:30');
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
      allowedAppointmentTypeIds: (resource.allowedAppointmentTypeIds ?? []).join(', '),
      capacity: resource.capacity != null ? String(resource.capacity) : '',
      active: resource.active ?? true,
      kind: resource.kind ?? 'ASSET',
      practitionerUserId: resource.practitionerUserId ?? '',
    });
    resetResourceSchedule();
    if (resource.scheduleOverride) {
      setResourceScheduleEnabled(true);
      setResourceScheduleForm(normalizeScheduleForm(resource.scheduleOverride));
    }
    setResourceError(null);
    setResourceMessage(`Editing ${resource.name || resource.id || 'resource'}`);
    setResourceOrgPickerOpen(false);
    setResourceOrgQuery('');
  };

  const startAppointmentEdit = (appointment: Appointment) => {
    const startParts = splitDateTime(appointment.startTime ?? (appointment as any).start ?? '');
    const endParts = splitDateTime(appointment.endTime ?? (appointment as any).end ?? '');
    setAppointmentForm({
      id: appointment.id ?? null,
      orgId: appointment.orgId ?? '',
      customerId: appointment.customerId ?? '',
      resourceId: appointment.resourceId ?? '',
      appointmentTypeId: appointment.appointmentTypeId ?? '',
      startTime: appointment.startTime ?? (appointment as any).start ?? '',
      endTime: appointment.endTime ?? (appointment as any).end ?? '',
      notes: appointment.notes ?? '',
      status: appointment.status ?? 'SCHEDULED',
    });
    setAppointmentStartDate(startParts.date);
    setAppointmentStartTime(startParts.time);
    setAppointmentEndDate(endParts.date);
    setAppointmentEndTime(endParts.time);
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
      street: org.address?.street ?? '',
      city: org.address?.city ?? '',
      state: org.address?.state ?? '',
      postalCode: org.address?.postalCode ?? '',
      country: org.address?.country ?? '',
      latitude: org.location?.latitude != null ? String(org.location.latitude) : '',
      longitude: org.location?.longitude != null ? String(org.location.longitude) : '',
      mapsLink: org.mapsLink ?? '',
      facebookPage: org.facebookPage ?? '',
      facebookGroup: org.facebookGroup ?? '',
      instagram: org.instagram ?? '',
      whatsappContact: org.whatsappContact ?? '',
      logoImage: org.logoImage ?? '',
    });
    setOrgTypePickerOpen(false);
    setOrgTypeQuery('');
    setFormError(null);
    setLogoUploadMessage(null);
    setLogoUploadError(null);
    setLogoUploading(false);
    setMessage((prev) => (prev ? `Editing ${org.name}` : prev));
  };

  const startScheduleEdit = (org: Organization) => {
    setScheduleOrgId(org.id ?? null);
    setScheduleForm(normalizeScheduleForm(org.scheduleConfig));
    setActiveDay('MONDAY');
    setScheduleApplyDays([]);
    setScheduleMessage(`Editing schedule for ${org.name}`);
    setScheduleError(null);
  };

  const clearScheduleForm = () => {
    setScheduleOrgId(null);
    setScheduleForm(defaultScheduleForm());
    setActiveDay('MONDAY');
    setScheduleApplyDays([]);
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
        appt.startTime,
        appt.endTime,
        (appt as any).start,
        (appt as any).end,
        appt.notes,
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

  const appointmentSelectedCustomer = useMemo(() => {
    const customerId = appointmentForm.customerId.trim();
    if (!customerId) return undefined;
    return customers.find((customer) => customer.id === customerId);
  }, [appointmentForm.customerId, customers]);

  const appointmentSelectedResource = useMemo(() => {
    const resourceId = appointmentForm.resourceId.trim();
    if (!resourceId) return undefined;
    return resources.find((resource) => resource.id === resourceId);
  }, [appointmentForm.resourceId, resources]);

  const appointmentOrgId = useMemo(() => {
    const orgId = appointmentForm.orgId.trim();
    if (orgId) return orgId;
    if (appointmentSelectedResource?.orgId) return appointmentSelectedResource.orgId;
    if (appointmentSelectedCustomer?.orgId) return appointmentSelectedCustomer.orgId;
    return '';
  }, [appointmentForm.orgId, appointmentSelectedCustomer, appointmentSelectedResource]);

  const appointmentCustomerOptions = useMemo(() => {
    const orgId = appointmentOrgId.trim().toLowerCase();
    return customers.filter((customer) => {
      if (orgId && (customer.orgId ?? '').toLowerCase() !== orgId) {
        return false;
      }
      return true;
    });
  }, [appointmentOrgId, customers]);

  const appointmentResourceOptions = useMemo(() => {
    const orgId = appointmentOrgId.trim().toLowerCase();
    return resources.filter((resource) => {
      if (orgId && (resource.orgId ?? '').toLowerCase() !== orgId) {
        return false;
      }
      return true;
    });
  }, [appointmentOrgId, resources]);

  const appointmentAllowedTypeIds = useMemo(() => {
    const allowed = appointmentSelectedResource?.allowedAppointmentTypeIds;
    if (!allowed || allowed.length === 0) return null;
    return new Set(allowed);
  }, [appointmentSelectedResource]);

  const appointmentTypeOptions = useMemo(() => {
    const orgId = appointmentOrgId.trim().toLowerCase();
    return appointmentTypes.filter((type) => {
      if (orgId && (type.orgId ?? '').toLowerCase() !== orgId) {
        return false;
      }
      if (appointmentAllowedTypeIds) {
        if (!type.id) return false;
        return appointmentAllowedTypeIds.has(type.id);
      }
      return true;
    });
  }, [appointmentAllowedTypeIds, appointmentOrgId, appointmentTypes]);

  useEffect(() => {
    const appointmentTypeId = appointmentForm.appointmentTypeId.trim();
    if (!appointmentTypeId) return;
    if (appointmentAllowedTypeIds && !appointmentAllowedTypeIds.has(appointmentTypeId)) {
      setAppointmentForm((prev) => ({ ...prev, appointmentTypeId: '' }));
    }
  }, [appointmentAllowedTypeIds, appointmentForm.appointmentTypeId]);

  useEffect(() => {
    const date = appointmentStartDate.trim();
    const next = date ? buildDateTimeValue(date, appointmentStartTime) : '';
    setAppointmentForm((prev) => (prev.startTime === next ? prev : { ...prev, startTime: next }));
  }, [appointmentStartDate, appointmentStartTime]);

  useEffect(() => {
    const date = appointmentEndDate.trim();
    const next = date ? buildDateTimeValue(date, appointmentEndTime) : '';
    setAppointmentForm((prev) => (prev.endTime === next ? prev : { ...prev, endTime: next }));
  }, [appointmentEndDate, appointmentEndTime]);

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const aStart = a.startTime ?? (a as any).start;
      const bStart = b.startTime ?? (b as any).start;
      const aTime = aStart ? Date.parse(aStart) : 0;
      const bTime = bStart ? Date.parse(bStart) : 0;
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
      address,
      location,
      mapsLink: form.mapsLink.trim() || undefined,
      facebookPage: form.facebookPage.trim() || undefined,
      facebookGroup: form.facebookGroup.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      whatsappContact: form.whatsappContact.trim() || undefined,
      logoImage: form.logoImage.trim() || undefined,
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

  const handleLogoUpload = async (file: File) => {
    if (!form.id) {
      setLogoUploadError('Save the organization before uploading a logo.');
      return;
    }
    setLogoUploading(true);
    setLogoUploadMessage('Uploading logo...');
    setLogoUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetchMultipart(`/api/organizations/${form.id}/logo`, formData);
      if (!res.ok) {
        setLogoUploadError(await parseErrorMessage(res));
        setLogoUploadMessage(null);
        return;
      }
      const saved = (await res.json()) as Organization;
      setForm((prev) => ({ ...prev, logoImage: saved.logoImage ?? '' }));
      setOrgs((prev) => prev.map((org) => (org.id === saved.id ? saved : org)));
      setLogoUploadMessage('Logo uploaded.');
    } catch (error) {
      setLogoUploadError(error instanceof Error ? error.message : 'Unable to upload logo.');
      setLogoUploadMessage(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const openLogoPicker = () => {
    setLogoUploadError(null);
    setLogoUploadMessage(null);
    if (!form.id) {
      setLogoUploadError('Save the organization before uploading a logo.');
      return;
    }
    if (Platform.OS !== 'web') {
      Alert.alert('Logo upload', 'Use the web app to upload logos.');
      return;
    }
    if (typeof document === 'undefined' || !document.body) {
      setLogoUploadError('File picker is unavailable.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        void handleLogoUpload(file);
      }
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };
    document.body.appendChild(input);
    input.click();
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
    const passwordConfirm = userForm.passwordConfirm.trim();
    if (!userForm.id && password.length < 8) {
      setUserError('Set a password of at least 8 characters.');
      return false;
    }
    if (!password && passwordConfirm) {
      setUserError('Enter a new password before confirming.');
      return false;
    }
    if (password && password.length < 8) {
      setUserError('Use at least 8 characters for the password.');
      return false;
    }
    if (password && !passwordConfirm) {
      setUserError('Confirm the password.');
      return false;
    }
    if (password && passwordConfirm && password !== passwordConfirm) {
      setUserError('Password and confirmation do not match.');
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
    if (isPlatformAdminOnly && !customerForm.orgId.trim()) {
      setCustomerError('Org id is required for platform admins.');
      return false;
    }
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
    setResourceScheduleError(null);

    const payload: Resource = {
      name: resourceForm.name.trim(),
      type: resourceForm.type.trim(),
      kind: resourceForm.kind,
      active: resourceForm.active,
    };
    if (resourceForm.kind === 'HUMAN') {
      const practitionerUserId = resourceForm.practitionerUserId.trim();
      if (practitionerUserId) {
        payload.practitionerUserId = practitionerUserId;
      }
    }
    const orgId = resourceForm.orgId.trim();
    if (orgId) {
      payload.orgId = orgId;
    }
    const allowed = parseCommaList(resourceForm.allowedAppointmentTypeIds);
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
    if (resourceScheduleEnabled) {
      payload.scheduleOverride = {
        workingDays: resourceScheduleForm.workingDays,
        businessHours: buildDayMap(resourceScheduleForm.businessHours),
        breaks: buildDayMap(resourceScheduleForm.breaks),
        holidays: resourceScheduleForm.holidays
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
    } else if (resourceForm.id) {
      payload.scheduleOverride = null;
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
    if (isPlatformAdminOnly && !appointmentForm.orgId.trim()) {
      setAppointmentError('Org id is required for platform admins.');
      return false;
    }
    if (!appointmentForm.customerId.trim() && !appointmentForm.resourceId.trim()) {
      setAppointmentError('Provide a customerId or resourceId.');
      return false;
    }
    if (!appointmentForm.appointmentTypeId.trim()) {
      setAppointmentError('Appointment type is required.');
      return false;
    }
    if (!appointmentForm.startTime.trim() || !appointmentForm.endTime.trim()) {
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
      startTime: appointmentForm.startTime.trim(),
      endTime: appointmentForm.endTime.trim(),
      notes: appointmentForm.notes.trim() || undefined,
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
      createdBy: currentUserId || '',
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
      createdBy: interaction.createdBy ?? currentUserId ?? '',
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
      createdBy: (currentUserId || interactionForm.createdBy || '').trim() || undefined,
      createdAt: new Date().toISOString(),
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
    if (isPlatformAdminOnly && !appointmentTypeForm.orgId.trim()) {
      setAppointmentTypeError('Org id is required for platform admins.');
      return false;
    }
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

  const filteredOrgTypesForPicker = useMemo(() => {
    const term = orgTypeQuery.trim().toLowerCase();
    if (!term) return orgTypes;
    return orgTypes.filter((type) =>
      [type.name, type.description, type.id].filter(Boolean).some((value) => value!.toLowerCase().includes(term)),
    );
  }, [orgTypeQuery, orgTypes]);

  const sortedHomeOrgs = useMemo(() => {
    return [...orgs].sort(
      (a, b) => (b.createdAt ? Date.parse(b.createdAt) : 0) - (a.createdAt ? Date.parse(a.createdAt) : 0),
    );
  }, [orgs]);

  const homeOrgBase = useMemo(() => {
    if (isSuperAdmin) return sortedHomeOrgs;
    if (roles.includes('PLATFORM_ADMIN')) {
      // Platform admin: only orgs created by the current user (fallback to all if id missing)
      return currentUserId ? sortedHomeOrgs.filter((org) => org.createdBy === currentUserId) : sortedHomeOrgs;
    }
    if (roles.includes('ORGANIZATION_ADMIN')) {
      // Org admin: show orgs already scoped by backend to their access
      return sortedHomeOrgs;
    }
    // Other roles: show orgs already scoped by backend (e.g., none or limited)
    return sortedHomeOrgs;
  }, [currentUserId, isSuperAdmin, roles, sortedHomeOrgs]);

  const filteredHomeOrgs = useMemo(() => {
    const term = homeOrgQuery.trim().toLowerCase();
    if (!term) return homeOrgBase;
    return homeOrgBase.filter((org) =>
      [org.id, org.name, org.marketingName, org.phone, org.createdBy]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [homeOrgBase, homeOrgQuery]);

  const filteredResourceOrgs = useMemo(() => {
    const term = resourceOrgQuery.trim().toLowerCase();
    if (!term) return homeOrgBase;
    return homeOrgBase.filter((org) =>
      [org.id, org.name, org.marketingName, org.phone, org.createdBy]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [homeOrgBase, resourceOrgQuery]);

  const resourcePractitionerUsers = useMemo(() => {
    const orgId = resourceForm.orgId.trim().toLowerCase();
    if (!orgId) return [];
    return users.filter((user) => {
      const homeOrg = (user.homeOrganizationId ?? '').toLowerCase();
      const roles = user.roles ?? [];
      return homeOrg === orgId && roles.includes('PRACTITIONER');
    });
  }, [resourceForm.orgId, users]);

  const sortedTypes = useMemo(() => {
    return [...filteredTypes].sort((a, b) => (b.createdAt != null ? Date.parse(b.createdAt) : 0) - (a.createdAt != null ? Date.parse(a.createdAt) : 0));
  }, [filteredTypes]);

  const customerAppointments = useMemo(() => {
    if (!customerForm.id) return [];
    if (interactionAppointments.length > 0) return interactionAppointments;
    return appointments.filter((appt) => appt.customerId === customerForm.id);
  }, [appointments, customerForm.id, interactionAppointments]);

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

  const toggleScheduleApplyDay = (day: DayName) => {
    setScheduleApplyDays((prev) => {
      const exists = prev.includes(day);
      const next = exists ? prev.filter((d) => d !== day) : [...prev, day];
      return DAY_NAMES.filter((name) => next.includes(name));
    });
  };

  const addBusinessWindow = () => {
    if (!newBusinessWindow.start.trim() || !newBusinessWindow.end.trim()) {
      setScheduleError('Provide start and end time for business hours.');
      return;
    }
    const start = newBusinessWindow.start.trim();
    const end = newBusinessWindow.end.trim();
    const targetDays = scheduleApplyDays.length > 0 ? scheduleApplyDays : [activeDay];
    setScheduleForm((prev) => {
      const businessHours = { ...prev.businessHours };
      targetDays.forEach((day) => {
        businessHours[day] = [...businessHours[day], { start, end }];
      });
      return { ...prev, businessHours };
    });
    setNewBusinessWindow({ start: '09:00', end: '17:00' });
    setScheduleError(null);
  };

  const addBreakWindow = () => {
    if (!newBreakWindow.start.trim() || !newBreakWindow.end.trim()) {
      setScheduleError('Provide start and end time for breaks.');
      return;
    }
    const start = newBreakWindow.start.trim();
    const end = newBreakWindow.end.trim();
    const targetDays = scheduleApplyDays.length > 0 ? scheduleApplyDays : [activeDay];
    setScheduleForm((prev) => {
      const breaks = { ...prev.breaks };
      targetDays.forEach((day) => {
        breaks[day] = [...breaks[day], { start, end }];
      });
      return { ...prev, breaks };
    });
    setNewBreakWindow({ start: '12:00', end: '13:00' });
    setScheduleError(null);
  };

  const clearScheduleHoursAndBreaks = () => {
    setScheduleForm((prev) => {
      const businessHours = { ...prev.businessHours };
      const breaks = { ...prev.breaks };
      DAY_NAMES.forEach((day) => {
        businessHours[day] = [];
        breaks[day] = [];
      });
      return { ...prev, businessHours, breaks };
    });
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

  const toggleResourceWorkingDay = (day: DayName) => {
    setResourceScheduleForm((prev) => {
      const exists = prev.workingDays.includes(day);
      const workingDays = exists ? prev.workingDays.filter((d) => d !== day) : [...prev.workingDays, day];
      return { ...prev, workingDays };
    });
  };

  const toggleResourceApplyDay = (day: DayName) => {
    setResourceApplyDays((prev) => {
      const exists = prev.includes(day);
      const next = exists ? prev.filter((d) => d !== day) : [...prev, day];
      return DAY_NAMES.filter((name) => next.includes(name));
    });
  };

  const addResourceBusinessWindow = () => {
    if (!resourceNewBusinessWindow.start.trim() || !resourceNewBusinessWindow.end.trim()) {
      setResourceScheduleError('Provide start and end time for business hours.');
      return;
    }
    const start = resourceNewBusinessWindow.start.trim();
    const end = resourceNewBusinessWindow.end.trim();
    const targetDays = resourceApplyDays.length > 0 ? resourceApplyDays : [resourceActiveDay];
    setResourceScheduleForm((prev) => {
      const businessHours = { ...prev.businessHours };
      targetDays.forEach((day) => {
        businessHours[day] = [...businessHours[day], { start, end }];
      });
      return { ...prev, businessHours };
    });
    setResourceNewBusinessWindow({ start: '09:00', end: '17:00' });
    setResourceScheduleError(null);
  };

  const addResourceBreakWindow = () => {
    if (!resourceNewBreakWindow.start.trim() || !resourceNewBreakWindow.end.trim()) {
      setResourceScheduleError('Provide start and end time for breaks.');
      return;
    }
    const start = resourceNewBreakWindow.start.trim();
    const end = resourceNewBreakWindow.end.trim();
    const targetDays = resourceApplyDays.length > 0 ? resourceApplyDays : [resourceActiveDay];
    setResourceScheduleForm((prev) => {
      const breaks = { ...prev.breaks };
      targetDays.forEach((day) => {
        breaks[day] = [...breaks[day], { start, end }];
      });
      return { ...prev, breaks };
    });
    setResourceNewBreakWindow({ start: '12:00', end: '13:00' });
    setResourceScheduleError(null);
  };

  const clearResourceHoursAndBreaks = () => {
    setResourceScheduleForm((prev) => {
      const businessHours = { ...prev.businessHours };
      const breaks = { ...prev.breaks };
      DAY_NAMES.forEach((day) => {
        businessHours[day] = [];
        breaks[day] = [];
      });
      return { ...prev, businessHours, breaks };
    });
    setResourceScheduleError(null);
  };

  const removeResourceBusinessWindow = (day: DayName, index: number) => {
    setResourceScheduleForm((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: prev.businessHours[day].filter((_, idx) => idx !== index),
      },
    }));
  };

  const removeResourceBreakWindow = (day: DayName, index: number) => {
    setResourceScheduleForm((prev) => ({
      ...prev,
      breaks: {
        ...prev.breaks,
        [day]: prev.breaks[day].filter((_, idx) => idx !== index),
      },
    }));
  };

  const addResourceHoliday = () => {
    if (!resourceNewHoliday.date.trim()) {
      setResourceScheduleError('Holiday date is required.');
      return;
    }
    if (!resourceNewHoliday.allDay && (!resourceHolidayWindow.start.trim() || !resourceHolidayWindow.end.trim())) {
      setResourceScheduleError('Provide start and end for partial-day holiday.');
      return;
    }
    const closedWindows =
      resourceNewHoliday.allDay || !resourceHolidayWindow.start.trim() || !resourceHolidayWindow.end.trim()
        ? []
        : [{ start: resourceHolidayWindow.start.trim(), end: resourceHolidayWindow.end.trim() }];
    setResourceScheduleForm((prev) => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        {
          date: resourceNewHoliday.date.trim(),
          allDay: resourceNewHoliday.allDay,
          description: resourceNewHoliday.description.trim(),
          closedWindows,
        },
      ],
    }));
    setResourceNewHoliday({ date: '', allDay: true, description: '', closedWindows: [] });
    setResourceHolidayWindow({ start: '09:00', end: '12:00' });
    setResourceScheduleError(null);
  };

  const removeResourceHoliday = (index: number) => {
    setResourceScheduleForm((prev) => ({
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
      address: current.address,
      location: current.location,
      scheduleConfig: schedulePayload,
      mapsLink: current.mapsLink,
      facebookPage: current.facebookPage,
      facebookGroup: current.facebookGroup,
      instagram: current.instagram,
      whatsappContact: current.whatsappContact,
      logoImage: current.logoImage,
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
      nestedScrollEnabled
      scrollsToTop={false}
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
          {canManageOrganizations ? (
            <Pressable
              style={[styles.tabButton, activeTab === 'orgs' && styles.tabButtonActive]}
              onPress={() => setActiveTab('orgs')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'orgs' && styles.tabButtonTextActive]}>
                Organizations
              </Text>
            </Pressable>
          ) : null}
          {canManageOrgTypes ? (
            <Pressable
              style={[styles.tabButton, activeTab === 'types' && styles.tabButtonActive]}
              onPress={() => setActiveTab('types')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'types' && styles.tabButtonTextActive]}>
                Organization types
              </Text>
            </Pressable>
          ) : null}
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

        {activeTab === 'orgs' && canManageOrganizations ? (
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
              {renderPagination(orgPage, totalOrgPages, setOrgPage)}
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
              <ScrollView
                style={styles.orgListScroll}
                contentContainerStyle={styles.orgList}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {visibleOrgs.map((org) => (
                  <Pressable
                    key={org.id ?? org.name}
                    style={[styles.orgCard, form.id === org.id && styles.orgCardActive]}
                    onPress={() => startEdit(org)}
                  >
                    <View style={styles.orgListHeader}>
                      <View style={styles.orgHeaderText}>
                        <Text style={styles.orgName} numberOfLines={1}>
                          {org.name}
                        </Text>
                        <Text style={styles.orgType} numberOfLines={1}>
                          {org.type}
                        </Text>
                      </View>
                      {org.logoImage ? (
                        <Image
                          source={{ uri: resolveLogoUri(org.logoImage) }}
                          style={styles.orgLogoThumb}
                          resizeMode="contain"
                        />
                      ) : null}
                    </View>
                    <Text style={styles.orgMeta}>
                      {org.marketingName || 'No marketing name'} - {org.industry || 'No industry'}
                    </Text>
                    <View style={styles.orgMetaRow}>
                      <Text style={styles.orgMeta}>{org.phone || 'No phone'}</Text>
                      {org.mapsLink ? (
                        <Text style={styles.link} numberOfLines={1}>
                          {org.mapsLink}
                        </Text>
                      ) : null}
                    </View>
                    {(org.facebookPage || org.instagram || org.whatsappContact) ? (
                      <View style={styles.orgMetaRow}>
                        {org.facebookPage ? (
                          <Text style={styles.orgMeta} numberOfLines={1}>
                            FB: {org.facebookPage}
                          </Text>
                        ) : null}
                        {org.instagram ? (
                          <Text style={styles.orgMeta} numberOfLines={1}>
                            IG: {org.instagram}
                          </Text>
                        ) : null}
                        {org.whatsappContact ? (
                          <Text style={styles.orgMeta} numberOfLines={1}>
                            WA: {org.whatsappContact}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
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
              <Pressable
                style={styles.dropdownTrigger}
                onPress={() =>
                  setOrgTypePickerOpen((open) => {
                    const next = !open;
                    if (next) setOrgTypeQuery('');
                    return next;
                  })
                }
              >
                <Text style={form.type ? styles.dropdownValue : styles.dropdownPlaceholder}>
                  {form.type || 'Select organization type'}
                </Text>
              </Pressable>
              {orgTypePickerOpen ? (
                <View style={styles.dropdownPanel}>
                  <TextInput
                    value={orgTypeQuery}
                    onChangeText={setOrgTypeQuery}
                    placeholder="Search types..."
                    placeholderTextColor="rgba(107,114,128,0.7)"
                    style={styles.dropdownSearchInput}
                    autoCapitalize="none"
                  />
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {filteredOrgTypesForPicker.map((type) => {
                      const selected = form.type === type.name;
                      return (
                        <Pressable
                          key={type.id}
                          onPress={() => {
                            setForm((prev) => ({ ...prev, type: type.name }));
                            setOrgTypePickerOpen(false);
                          }}
                          style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                        >
                          <Text
                            style={[styles.dropdownItemLabel, selected && styles.dropdownItemLabelSelected]}
                            numberOfLines={1}
                          >
                            {type.name}
                          </Text>
                          {type.description ? (
                            <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                              {type.description}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                    {filteredOrgTypesForPicker.length === 0 ? (
                      <Text style={styles.statusText}>No organization types available.</Text>
                    ) : null}
                  </ScrollView>
                </View>
              ) : null}
            </View>
            <InputField
              label="Phone"
              placeholder="+33 1 23 45 67 89"
              value={form.phone}
              onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))}
              keyboardType="default"
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

            <InputField
              label="Maps link"
              placeholder="https://maps.google.com/?q=48.8566,2.3522"
              value={form.mapsLink}
              onChangeText={(mapsLink) => setForm((prev) => ({ ...prev, mapsLink }))}
              autoComplete="off"
            />
            <InputField
              label="Facebook page"
              placeholder="https://www.facebook.com/yourpage"
              value={form.facebookPage}
              onChangeText={(facebookPage) => setForm((prev) => ({ ...prev, facebookPage }))}
              autoComplete="off"
            />
            <InputField
              label="Facebook group"
              placeholder="https://www.facebook.com/groups/yourgroup"
              value={form.facebookGroup}
              onChangeText={(facebookGroup) => setForm((prev) => ({ ...prev, facebookGroup }))}
              autoComplete="off"
            />
            <InputField
              label="Instagram"
              placeholder="https://www.instagram.com/yourhandle"
              value={form.instagram}
              onChangeText={(instagram) => setForm((prev) => ({ ...prev, instagram }))}
              autoComplete="off"
            />
            <InputField
              label="WhatsApp contact"
              placeholder="+33 6 00 00 00 00"
              value={form.whatsappContact}
              onChangeText={(whatsappContact) => setForm((prev) => ({ ...prev, whatsappContact }))}
              autoComplete="off"
            />
            <InputField
              label="Logo image URL"
              placeholder="https://cdn.example.com/logos/yourorg.png"
              value={form.logoImage}
              onChangeText={(logoImage) => setForm((prev) => ({ ...prev, logoImage }))}
              autoComplete="off"
            />
            <View style={styles.inputField}>
              <Text style={styles.label}>Logo upload</Text>
              <Pressable
                onPress={openLogoPicker}
                disabled={!form.id || logoUploading}
                style={[
                  styles.secondaryChip,
                  (!form.id || logoUploading) && styles.secondaryChipDisabled,
                ]}
              >
                <Text style={styles.secondaryChipText}>
                  {logoUploading ? 'Uploading...' : 'Upload logo'}
                </Text>
              </Pressable>
              <Text style={styles.helperText}>
                {form.id
                  ? 'Upload an image file; the URL will be saved to logoImage.'
                  : 'Save the organization before uploading a logo.'}
              </Text>
              {logoUploadMessage ? (
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{logoUploadMessage}</Text>
                </View>
              ) : null}
              {logoUploadError ? (
                <View style={[styles.statusPill, styles.errorPill]}>
                  <Text style={styles.errorText}>{logoUploadError}</Text>
                </View>
              ) : null}
              {form.logoImage ? (
                <Image source={{ uri: resolveLogoUri(form.logoImage) }} style={styles.orgLogo} resizeMode="contain" />
              ) : null}
            </View>

            <PrimaryButton
              label={saving ? 'Saving...' : form.id ? 'Update organization' : 'Create organization'}
              onPress={handleSave}
              disabled={saving}
            />
          </>
        ) : activeTab === 'types' && canManageOrgTypes ? (
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
              {renderPagination(typePage, totalTypePages, setTypePage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
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
              {renderPagination(schedulePage, totalSchedulePages, setSchedulePage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
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

                <ScheduleEditor
                  form={scheduleForm}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                  toggleWorkingDay={toggleWorkingDay}
                  applyDays={scheduleApplyDays}
                  toggleApplyDay={toggleScheduleApplyDay}
                  newBusinessWindow={newBusinessWindow}
                  setNewBusinessWindow={setNewBusinessWindow}
                  addBusinessWindow={addBusinessWindow}
                  removeBusinessWindow={removeBusinessWindow}
                  newBreakWindow={newBreakWindow}
                  setNewBreakWindow={setNewBreakWindow}
                  addBreakWindow={addBreakWindow}
                  removeBreakWindow={removeBreakWindow}
                  clearHoursAndBreaks={clearScheduleHoursAndBreaks}
                  newHoliday={newHoliday}
                  setNewHoliday={setNewHoliday}
                  holidayWindow={holidayWindow}
                  setHolidayWindow={setHolidayWindow}
                  addHoliday={addHoliday}
                  removeHoliday={removeHoliday}
                  footer={
                    <PrimaryButton
                      label={scheduleSaving ? 'Saving schedule...' : 'Save schedule'}
                      onPress={handleScheduleSave}
                      disabled={scheduleSaving}
                    />
                  }
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
                  <OrganizationPickerField
                    label="Org filter (optional)"
                    placeholder="All organizations"
                    value={resourceOrgFilter}
                    onSelect={setResourceOrgFilter}
                    organizations={homeOrgBase}
                    allowEmptyOption
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadResources()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              {renderPagination(resourcePage, totalResourcePages, setResourcePage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
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
                    <Text style={styles.orgMeta}>
                      Schedule: {resource.scheduleOverride ? 'Custom override' : 'Org default'}
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
            <View style={styles.inputField}>
              <Text style={styles.label}>Organization (required for platform admins)</Text>
              <Pressable
                style={[styles.dropdownTrigger, styles.dropdownTriggerRow]}
                onPress={() =>
                  setResourceOrgPickerOpen((open) => {
                    const next = !open;
                    if (next) setResourceOrgQuery('');
                    return next;
                  })
                }
              >
                <Text style={resourceForm.orgId ? styles.dropdownValue : styles.dropdownPlaceholder}>
                  {resourceForm.orgId ? getOrganizationLabel(homeOrgBase, resourceForm.orgId) : 'Select organization'}
                </Text>
                <Text style={styles.dropdownCaret}>{resourceOrgPickerOpen ? '^' : 'v'}</Text>
              </Pressable>
              {resourceOrgPickerOpen ? (
                <View style={styles.dropdownPanel}>
                  <TextInput
                    value={resourceOrgQuery}
                    onChangeText={setResourceOrgQuery}
                    placeholder="Search by id, name, marketing name, phone, createdBy"
                    placeholderTextColor="rgba(107,114,128,0.7)"
                    style={styles.dropdownSearchInput}
                    autoCapitalize="none"
                  />
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {filteredResourceOrgs.length === 0 ? (
                      <Text style={styles.statusText}>No organizations match the search.</Text>
                    ) : (
                      filteredResourceOrgs.map((org) => (
                        <Pressable
                          key={org.id ?? org.name}
                          onPress={() => {
                            const nextOrgId = org.id || '';
                            setResourceForm((prev) => ({
                              ...prev,
                              orgId: nextOrgId,
                              allowedAppointmentTypeIds:
                                prev.orgId !== nextOrgId ? '' : prev.allowedAppointmentTypeIds,
                            }));
                            setResourceOrgPickerOpen(false);
                          }}
                          style={[
                            styles.dropdownItem,
                            resourceForm.orgId === org.id && styles.dropdownItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownItemLabel,
                              resourceForm.orgId === org.id && styles.dropdownItemLabelSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {org.marketingName || org.name || org.id}
                          </Text>
                          <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                            {org.name || org.marketingName || 'Unnamed'} - {org.createdBy || 'unknown'}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </View>
            <AppointmentTypeMultiSelectField
              label="Allowed appointment type ids"
              value={resourceForm.allowedAppointmentTypeIds}
              appointmentTypes={resourceAppointmentTypes}
              onChangeValue={(allowedAppointmentTypeIds) =>
                setResourceForm((prev) => ({ ...prev, allowedAppointmentTypeIds }))
              }
              placeholder="Any appointment type"
              disabled={isPlatformUser && !resourceForm.orgId.trim()}
              disabledMessage="Select an organization to load appointment types"
              loading={resourceAppointmentTypeLoading}
              error={resourceAppointmentTypeError}
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
            {resourceForm.kind === 'HUMAN' ? (
              <PractitionerPickerField
                label="Practitioner user (optional, HUMAN only)"
                placeholder={
                  resourceForm.orgId
                    ? 'Search practitioner by id, username, email, name'
                    : 'Select an organization first'
                }
                value={resourceForm.practitionerUserId}
                onSelect={(practitionerUserId) => setResourceForm((prev) => ({ ...prev, practitionerUserId }))}
                practitioners={resourcePractitionerUsers}
                disabled={!resourceForm.orgId}
                disabledMessage="Select an organization to see practitioners"
                loading={userLoading && !!resourceForm.orgId}
              />
            ) : null}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Schedule override (optional)</Text>
              {resourceScheduleEnabled ? (
                <Pressable
                  onPress={() => {
                    setResourceScheduleEnabled(false);
                    setResourceScheduleError(null);
                  }}
                  style={styles.secondaryChip}
                >
                  <Text style={styles.secondaryChipText}>Disable</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setResourceScheduleEnabled(true);
                    setResourceScheduleError(null);
                  }}
                  style={styles.secondaryChip}
                >
                  <Text style={styles.secondaryChipText}>Enable</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => {
                setResourceScheduleEnabled((prev) => !prev);
                setResourceScheduleError(null);
              }}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, resourceScheduleEnabled && styles.checkboxChecked]}>
                {resourceScheduleEnabled ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberText}>
                {resourceScheduleEnabled ? 'Using custom schedule' : 'Inherit organization schedule'}
              </Text>
            </Pressable>
            {resourceScheduleEnabled ? (
              <Text style={styles.orgMeta}>
                {resourceScheduleForm.workingDays.length} working days / {resourceScheduleForm.holidays.length} holidays
              </Text>
            ) : null}
            {resourceScheduleError ? (
              <View style={[styles.statusPill, styles.errorPill]}>
                <Text style={styles.errorText}>{resourceScheduleError}</Text>
              </View>
            ) : null}
            {resourceScheduleEnabled ? (
              <ScheduleEditor
                form={resourceScheduleForm}
                activeDay={resourceActiveDay}
                setActiveDay={setResourceActiveDay}
                toggleWorkingDay={toggleResourceWorkingDay}
                applyDays={resourceApplyDays}
                toggleApplyDay={toggleResourceApplyDay}
                newBusinessWindow={resourceNewBusinessWindow}
                setNewBusinessWindow={setResourceNewBusinessWindow}
                addBusinessWindow={addResourceBusinessWindow}
                removeBusinessWindow={removeResourceBusinessWindow}
                newBreakWindow={resourceNewBreakWindow}
                setNewBreakWindow={setResourceNewBreakWindow}
                addBreakWindow={addResourceBreakWindow}
                removeBreakWindow={removeResourceBreakWindow}
                clearHoursAndBreaks={clearResourceHoursAndBreaks}
                newHoliday={resourceNewHoliday}
                setNewHoliday={setResourceNewHoliday}
                holidayWindow={resourceHolidayWindow}
                setHolidayWindow={setResourceHolidayWindow}
                addHoliday={addResourceHoliday}
                removeHoliday={removeResourceHoliday}
              />
            ) : null}

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
                  <OrganizationPickerField
                    label="Org filter (optional)"
                    placeholder="All organizations"
                    value={appointmentOrgFilter}
                    onSelect={setAppointmentOrgFilter}
                    organizations={homeOrgBase}
                    allowEmptyOption
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadAppointments()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              {renderPagination(appointmentPage, totalAppointmentPages, setAppointmentPage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
                {visibleAppointments.map((appt) => (
                  <Pressable
                    key={appt.id ?? `${appt.customerId}-${appt.startTime ?? (appt as any).start}`}
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
                      Type: {appt.appointmentTypeId || 'N/A'} -{' '}
                      {appt.startTime ?? (appt as any).start ?? '--'} to {appt.endTime ?? (appt as any).end ?? '--'}
                    </Text>
                    {appt.notes ? <Text style={styles.orgMeta}>Notes: {appt.notes}</Text> : null}
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

            <OrganizationPickerField
              label="Org id (required for platform admins)"
              value={appointmentForm.orgId}
              onSelect={(orgId) => setAppointmentForm((prev) => ({ ...prev, orgId }))}
              organizations={homeOrgBase}
            />
            <CustomerPickerField
              label="Customer"
              value={appointmentForm.customerId}
              onSelect={(customerId) => setAppointmentForm((prev) => ({ ...prev, customerId }))}
              customers={appointmentCustomerOptions}
              disabled={isPlatformAdminOnly && !appointmentForm.orgId.trim()}
              disabledMessage="Select an organization to load customers"
            />
            <ResourcePickerField
              label="Resource"
              value={appointmentForm.resourceId}
              onSelect={(resourceId) => setAppointmentForm((prev) => ({ ...prev, resourceId }))}
              resources={appointmentResourceOptions}
              disabled={isPlatformAdminOnly && !appointmentForm.orgId.trim()}
              disabledMessage="Select an organization to load resources"
            />
            <AppointmentTypePickerField
              label="Appointment type"
              value={appointmentForm.appointmentTypeId}
              onSelect={(appointmentTypeId) => setAppointmentForm((prev) => ({ ...prev, appointmentTypeId }))}
              appointmentTypes={appointmentTypeOptions}
              disabled={!appointmentForm.resourceId.trim()}
              disabledMessage="Select a resource to load appointment types"
            />
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <DatePickerField
                  label="Start date"
                  placeholder="YYYY-MM-DD"
                  value={appointmentStartDate}
                  onChangeText={setAppointmentStartDate}
                />
              </View>
              <View style={styles.flexHalf}>
                <TimeInput
                  label="Start time"
                  value={appointmentStartTime}
                  onChangeText={setAppointmentStartTime}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <DatePickerField
                  label="End date"
                  placeholder="YYYY-MM-DD"
                  value={appointmentEndDate}
                  onChangeText={setAppointmentEndDate}
                />
              </View>
              <View style={styles.flexHalf}>
                <TimeInput
                  label="End time"
                  value={appointmentEndTime}
                  onChangeText={setAppointmentEndTime}
                />
              </View>
            </View>
            <InputField
              label="Notes (optional)"
              placeholder="Prep call, bring documents, etc."
              value={appointmentForm.notes}
              onChangeText={(notes) => setAppointmentForm((prev) => ({ ...prev, notes }))}
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
                  <OrganizationPickerField
                    label="Org filter (optional)"
                    placeholder="All organizations"
                    value={appointmentTypeOrgFilter}
                    onSelect={setAppointmentTypeOrgFilter}
                    organizations={homeOrgBase}
                    allowEmptyOption
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadAppointmentTypes()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              {renderPagination(appointmentTypePage, totalAppointmentTypePages, setAppointmentTypePage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
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
            <OrganizationPickerField
              label="Org id (required for platform admins)"
              value={appointmentTypeForm.orgId}
              onSelect={(orgId) => setAppointmentTypeForm((prev) => ({ ...prev, orgId }))}
              organizations={homeOrgBase}
            />
            <DurationSelectField
              label="Default duration (minutes)"
              placeholder="Select duration"
              value={appointmentTypeForm.defaultDurationMinutes}
              onChangeValue={(defaultDurationMinutes) =>
                setAppointmentTypeForm((prev) => ({ ...prev, defaultDurationMinutes }))
              }
            />
            <DurationMultiSelectField
              label="Allowed durations (comma separated minutes)"
              placeholder="Any duration"
              value={appointmentTypeForm.allowedDurations}
              onChangeValue={(allowedDurations) => setAppointmentTypeForm((prev) => ({ ...prev, allowedDurations }))}
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
                  <OrganizationPickerField
                    label="Org filter (optional)"
                    placeholder="All organizations"
                    value={customerOrgFilter}
                    onSelect={setCustomerOrgFilter}
                    organizations={homeOrgBase}
                    allowEmptyOption
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadCustomers()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              {renderPagination(customerPage, totalCustomerPages, setCustomerPage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
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
            <DatePickerField
              label="Date of birth (YYYY-MM-DD)"
              placeholder="1990-01-01"
              value={customerForm.dateOfBirth}
              onChangeText={(dateOfBirth) => setCustomerForm((prev) => ({ ...prev, dateOfBirth }))}
            />
            <OrganizationPickerField
              label="Org id (required for platform admins)"
              value={customerForm.orgId}
              onSelect={(orgId) => setCustomerForm((prev) => ({ ...prev, orgId }))}
              organizations={homeOrgBase}
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
                <AppointmentPickerField
                  label="Appointment (optional)"
                  value={interactionForm.appointmentId}
                  onSelect={(appointmentId) => setInteractionForm((prev) => ({ ...prev, appointmentId }))}
                  appointments={customerAppointments}
                  placeholder="Link to an appointment"
                  allowEmptyOption
                  emptyLabel="No appointment"
                  disabled={!customerForm.id}
                  disabledMessage="Save/select a customer first"
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
                  <OrganizationPickerField
                    label="Home org filter (optional)"
                    placeholder="All organizations"
                    value={userOrgFilter}
                    onSelect={setUserOrgFilter}
                    organizations={homeOrgBase}
                    allowEmptyOption
                  />
                </View>
                <View style={[styles.flexHalf, { alignItems: 'flex-end' }]}>
                  <Pressable onPress={() => loadUsers()} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>Apply org filter</Text>
                  </Pressable>
                </View>
              </View>
              {renderPagination(userPage, totalUserPages, setUserPage)}
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
              <ScrollView style={styles.orgListScroll} contentContainerStyle={styles.orgList} nestedScrollEnabled keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ minIndexForVisible: 0 }} >
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
                      <Text style={styles.orgMeta}>Roles: {formatUserRoles(user.roles)}</Text>
                      <Text style={styles.orgMeta}>
                        Home org:{' '}
                        {user.homeOrganizationId
                          ? getOrganizationLabel(homeOrgBase, user.homeOrganizationId)
                          : 'Platform'}
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
            <InputField
              label={userForm.id ? 'Confirm new password' : 'Confirm password'}
              placeholder={userForm.id ? 'Re-enter new password' : 'Re-enter password'}
              value={userForm.passwordConfirm}
              onChangeText={(passwordConfirm) => setUserForm((prev) => ({ ...prev, passwordConfirm }))}
              secureTextEntry
              autoComplete="password"
            />
            <Text style={styles.helperText}>Leave both password fields blank when editing to keep the existing password.</Text>
            <View style={styles.inputField}>
              <Text style={styles.label}>Home organization (optional for platform admins)</Text>
              <Pressable
                style={[styles.dropdownTrigger, styles.dropdownTriggerRow]}
                onPress={() =>
                  setHomeOrgPickerOpen((open) => {
                    const next = !open;
                    if (next) setHomeOrgQuery('');
                    return next;
                  })
                }
              >
                <Text style={userForm.homeOrganizationId ? styles.dropdownValue : styles.dropdownPlaceholder}>
                  {userForm.homeOrganizationId
                    ? getOrganizationLabel(homeOrgBase, userForm.homeOrganizationId)
                    : 'Select organization'}
                </Text>
                <Text style={styles.dropdownCaret}>{homeOrgPickerOpen ? '^' : 'v'}</Text>
              </Pressable>
              {homeOrgPickerOpen ? (
                <View style={styles.dropdownPanel}>
                  <TextInput
                    value={homeOrgQuery}
                    onChangeText={setHomeOrgQuery}
                    placeholder="Search by id, name, marketing name, phone, createdBy"
                    placeholderTextColor="rgba(107,114,128,0.7)"
                    style={styles.dropdownSearchInput}
                    autoCapitalize="none"
                  />
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {filteredHomeOrgs.length === 0 ? (
                      <Text style={styles.statusText}>No organizations match the search.</Text>
                    ) : (
                      filteredHomeOrgs.map((org) => (
                        <Pressable
                          key={org.id ?? org.name}
                          onPress={() => {
                            setUserForm((prev) => ({ ...prev, homeOrganizationId: org.id || '' }));
                            setHomeOrgPickerOpen(false);
                          }}
                          style={[
                            styles.dropdownItem,
                            userForm.homeOrganizationId === org.id && styles.dropdownItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownItemLabel,
                              userForm.homeOrganizationId === org.id && styles.dropdownItemLabelSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {org.marketingName || org.name || org.id}
                          </Text>
                          <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                            {org.name || org.marketingName || 'Unnamed'} - {org.createdBy || 'unknown'}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </View>
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <DatePickerField
                  label="Expires on (optional)"
                  placeholder="2026-01-01"
                  value={userForm.expiresDate}
                  onChangeText={(expiresDate) =>
                    setUserForm((prev) => ({
                      ...prev,
                      expiresDate,
                      expiresAt: buildDateTimeValue(expiresDate, prev.expiresTime),
                    }))
                  }
                />
              </View>
              <View style={styles.flexHalf}>
                <TimeInput
                  label="Expiration time"
                  value={userForm.expiresTime}
                  onChangeText={(expiresTime) => {
                    const safeTime = normalizeTimeString(expiresTime, '00:00');
                    setUserForm((prev) => ({
                      ...prev,
                      expiresTime: safeTime,
                      expiresAt: buildDateTimeValue(prev.expiresDate, safeTime),
                    }));
                  }}
                />
              </View>
            </View>
            <Text style={styles.helperText}>Leave blank to keep the user active indefinitely.</Text>
            <View style={styles.inputField}>
              <Text style={styles.label}>Roles</Text>
              <View style={styles.typeChips}>
                {assignableRoles.map((role) => {
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
  dateInputShell: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  dateInputShellActive: {
    borderColor: '#1D4ED8',
    shadowOpacity: 0.12,
  },
  dateInputShellPressed: { opacity: 0.92 },
  dateValue: {
    color: '#0F172A',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  datePlaceholder: { color: 'rgba(107,114,128,0.75)' },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateIconTop: {
    width: '100%',
    height: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#111827',
    marginBottom: 3,
  },
  dateIconBody: {
    width: '100%',
    height: 14,
    borderWidth: 1.2,
    borderColor: '#111827',
    borderRadius: 4,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarCardWrapper: {
    width: '100%',
    maxWidth: 380,
  },
  calendarCard: {
    backgroundColor: '#2E3036',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthYearRow: {
    gap: 8,
    marginTop: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  monthGridItem: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3A3B41',
    alignItems: 'center',
  },
  monthGridItemActive: { backgroundColor: '#FFFFFF' },
  monthGridText: {
    color: '#E5E7EB',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  monthGridTextActive: { color: '#111827' },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  yearGridItem: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3A3B41',
    alignItems: 'center',
  },
  yearGridItemActive: { backgroundColor: '#FFFFFF' },
  yearGridText: {
    color: '#E5E7EB',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  yearGridTextActive: { color: '#111827' },
  monthLabel: {
    color: '#F8FAFC',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  calendarArrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#3A3B41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarArrowText: {
    color: '#E5E7EB',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: '#D1D5DB',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  dayGrid: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCell: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayCellEmpty: { opacity: 0 },
  dayCellSelected: {
    backgroundColor: '#FFFFFF',
  },
  dayText: {
    color: '#F8FAFC',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
  },
  dayTextEmpty: { color: '#9CA3AF' },
  dayTextSelected: { color: '#111827' },
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
    justifyContent: 'center',
    marginVertical: 8,
    gap: 12,
    flexWrap: 'wrap',
  },
  paginationLink: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paginationLinkDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    color: '#1D4ED8',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  paginationTextDisabled: {
    color: '#9CA3AF',
  },
  paginationTextActive: {
    color: '#FFFFFF',
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationNumber: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paginationNumberActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  secondaryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F97316',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  secondaryChipCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F97316',
    borderWidth: 1,
    borderColor: '#F97316',
    alignSelf: 'flex-start',
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
  orgTabContent: {
    width: '100%',
    paddingBottom: 24,
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
  orgListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  orgHeaderText: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    minWidth: 0,
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
  orgMetaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  orgLogo: {
    width: 80,
    height: 40,
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  orgLogoThumb: {
    width: 64,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
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
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  dropdownTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  dropdownPanel: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
    gap: 8,
    maxHeight: 260,
    elevation: 3,
    zIndex: 3,
  },
  dropdownSearchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#0F172A',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownCaret: {
    color: '#6B7280',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    marginLeft: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  dropdownItemSelected: {
    borderColor: '#1D4ED8',
    backgroundColor: '#E0E7FF',
  },
  dropdownItemLabel: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  dropdownItemLabelSelected: {
    color: '#0F172A',
  },
  dropdownItemDescription: {
    color: '#6B7280',
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
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
  timeInput: {
    gap: 6,
  },
  timeLabel: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timePill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeValue: {
    color: '#0F172A',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  timeCaret: {
    color: '#6B7280',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  timeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timeModalCard: {
    width: '70%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    maxHeight: 360,
  },
  timeOptions: { width: '100%' },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  timeOptionActive: {
    borderColor: '#1D4ED8',
    backgroundColor: '#E0E7FF',
  },
  timeOptionText: {
    color: '#0F172A',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  timeOptionTextActive: { color: '#0F172A' },
});
