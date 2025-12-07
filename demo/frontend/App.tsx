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
          placeholderTextColor="rgba(255,255,255,0.5)"
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
        colors={['#22d3ee', '#2563eb']}
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
  const [activeTab, setActiveTab] = useState<'orgs' | 'types' | 'schedule' | 'users' | 'customers'>('orgs');
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
    [authFetch, customerOrgFilter],
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
      await Promise.all([loadUsers(), loadCustomers()]);
    })();
  }, [loadOrgTypes, loadOrganizations, loadUsers, loadCustomers]);

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

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
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
        .some((value) => value!.toString().toLowerCase().includes(term));
      const roleMatch = (user.roles ?? []).some((role) => role.toLowerCase().includes(term));
      return fields || roleMatch;
    });
  }, [userSearch, users]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => {
      return [customer.id, customer.name, customer.firstName, customer.email, customer.phone, customer.orgId]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(term));
    });
  }, [customerSearch, customers]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerForm.id),
    [customers, customerForm.id],
  );

  const filteredScheduleOrgs = useMemo(() => {
    const term = scheduleSearch.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((org) =>
      [org.id, org.name, org.marketingName, org.type].filter(Boolean).some((value) => value!.toLowerCase().includes(term)),
    );
  }, [orgs, scheduleSearch]);

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

  const filteredTypes = useMemo(() => {
    const term = typeSearch.trim().toLowerCase();
    if (!term) return orgTypes;
    return orgTypes.filter((type) =>
      [type.name, type.description, type.id].filter(Boolean).some((value) => value!.toLowerCase().includes(term)),
    );
  }, [orgTypes, typeSearch]);

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
            <Text style={styles.badgeText}>SUPER_PLATFORM_ADMIN</Text>
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
        <View style={styles.tabRow}>
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
          <Pressable
            style={[styles.tabButton, activeTab === 'customers' && styles.tabButtonActive]}
            onPress={() => setActiveTab('customers')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'customers' && styles.tabButtonTextActive]}>
              Customers
            </Text>
          </Pressable>
        </View>

        {activeTab === 'orgs' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Organizations ({filteredOrgs.length}/{orgs.length})</Text>
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
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {message ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{message}</Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#7dd3fc" />
                <Text style={styles.statusText}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.orgList}>
                {filteredOrgs.map((org) => (
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
                {orgs.length === 0 ? (
                  <Text style={styles.statusText}>No organizations yet.</Text>
                ) : null}
              </View>
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
                  Organization types ({filteredTypes.length}/{orgTypes.length})
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
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {typeMessage ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{typeMessage}</Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color="#7dd3fc" />
                <Text style={styles.statusText}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.orgList}>
                {filteredTypes.map((type) => (
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
                {orgTypes.length === 0 ? (
                  <Text style={styles.statusText}>No organization types yet.</Text>
                ) : null}
              </View>
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
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
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
                <ActivityIndicator color="#7dd3fc" />
                <Text style={styles.statusText}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.orgList}>
                {filteredScheduleOrgs.map((org) => {
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
                {orgs.length === 0 ? (
                  <Text style={styles.statusText}>No organizations yet.</Text>
                ) : null}
              </View>
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
        ) : activeTab === 'customers' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Customers ({filteredCustomers.length}/{customers.length})</Text>
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
                  placeholderTextColor="rgba(255,255,255,0.6)"
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
                <ActivityIndicator color="#7dd3fc" />
                <Text style={styles.statusText}>Loading customers...</Text>
              </View>
            ) : (
              <View style={styles.orgList}>
                {filteredCustomers.map((customer) => (
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
                {filteredCustomers.length === 0 ? (
                  <Text style={styles.statusText}>No customers match the filters.</Text>
                ) : null}
              </View>
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

            {selectedCustomer?.interactions && selectedCustomer.interactions.length > 0 ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Interactions</Text>
                <View style={styles.orgList}>
                  {selectedCustomer.interactions!.map((interaction) => (
                    <View key={interaction.id ?? interaction.createdAt} style={styles.orgCard}>
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
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Users ({filteredUsers.length}/{users.length})</Text>
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
                  placeholderTextColor="rgba(255,255,255,0.6)"
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
                <ActivityIndicator color="#7dd3fc" />
                <Text style={styles.statusText}>Loading users...</Text>
              </View>
            ) : (
              <View style={styles.orgList}>
                {filteredUsers.map((user) => {
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
                {filteredUsers.length === 0 ? <Text style={styles.statusText}>No users match the filters.</Text> : null}
              </View>
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
        <ActivityIndicator color="#7dd3fc" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0a1124', '#0c1a3a', '#0f274c']} style={styles.background}>
      <StatusBar style="light" />
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
  background: { flex: 1 },
  safeArea: { flex: 1 },
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
    backgroundColor: '#0a1124',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeText: {
    color: '#a5f3fc',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  title: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 8,
  },
  cardWide: { maxWidth: 900 },
  inputField: { gap: 6 },
  label: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  inputShell: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputShellError: { borderColor: '#fca5a5' },
  input: {
    color: '#f8fafc',
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
  },
  errorText: {
    color: '#fca5a5',
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
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56,189,248,0.16)',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38bdf8',
  },
  rememberText: {
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  link: {
    color: '#7dd3fc',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.6)',
    backgroundColor: 'rgba(125,211,252,0.08)',
  },
  statusText: {
    color: '#e0f2fe',
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },
  helperText: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 6,
  },
  errorPill: {
    borderColor: '#fca5a5',
    backgroundColor: 'rgba(252,165,165,0.12)',
  },
  tokenBox: {
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.5)',
    backgroundColor: 'rgba(125,211,252,0.08)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  tokenLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  tokenValue: {
    color: '#e0f2fe',
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
    color: '#0b1124',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoutLabel: {
    color: '#e5e7eb',
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
    gap: 10,
    marginBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabButtonActive: {
    borderColor: '#7dd3fc',
    backgroundColor: 'rgba(125,211,252,0.16)',
  },
  tabButtonText: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: '#0b1124',
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
  },
  searchBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  searchInput: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  secondaryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryChipText: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orgList: { gap: 12 },
  orgCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  orgCardActive: {
    borderColor: '#7dd3fc',
    backgroundColor: 'rgba(125,211,252,0.14)',
  },
  orgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgName: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  orgType: {
    color: '#7dd3fc',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  orgMeta: {
    color: 'rgba(255,255,255,0.7)',
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
    color: '#fca5a5',
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
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  typeChipSelected: {
    borderColor: '#7dd3fc',
    backgroundColor: 'rgba(125,211,252,0.16)',
  },
  typeChipText: {
    color: '#e5e7eb',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  typeChipTextSelected: { color: '#0b1124' },
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
