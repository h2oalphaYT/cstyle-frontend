import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { App, Select, Space, Tag, Typography } from 'antd';
import type { SelectProps } from 'antd';
import { API_URL, errorMessage, http, tokenStore, type Pagination } from '../../api/client';

// ── Formatting ──────────────────────────────────────────────────────
export const money = (n?: number | null) => (n == null ? '—' : Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
export const rs = (n?: number | null) => (n == null ? '—' : `Rs ${money(n)}`);
export const label = (s?: string | null) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—');
export const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const thisPeriod = () => today().slice(0, 7);

const STATUS_COLORS: Record<string, string> = {
    active: 'green', approved: 'green', paid: 'green', processed: 'green', present: 'green', finalized: 'blue', locked: 'purple',
    pending: 'orange', draft: 'default', calculated: 'cyan', under_review: 'gold', supervisor_approved: 'gold', processing: 'blue', open: 'green',
    rejected: 'red', cancelled: 'default', failed: 'red', absent: 'red', late: 'orange', leave: 'purple', half_day: 'gold', holiday: 'cyan',
    off_day: 'default', remote: 'geekblue', early_leave: 'orange', settled: 'default', scheduled: 'blue', deducted: 'green', skipped: 'default',
    error: 'red', duplicate: 'default', ignored: 'default', inactive: 'default', probation: 'gold', suspended: 'red', resigned: 'default', terminated: 'red',
    superseded: 'default', applied: 'green',
};
export const StatusTag = ({ status }: { status?: string | null }) => (
    <Tag color={STATUS_COLORS[status || ''] || 'default'} className="m-0">{label(status)}</Tag>
);

export const PageHeader = ({ title, subtitle, extra }: { title: string; subtitle?: ReactNode; extra?: ReactNode }) => {
    const dark = document.documentElement.classList.contains('dark');
    return (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
                <h1 className={`text-2xl font-bold font-poppins m-0 ${dark ? 'text-white' : 'text-brand-black'}`}>{title}</h1>
                {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
            </div>
            {extra && <Space wrap>{extra}</Space>}
        </div>
    );
};

export const cardClass = () => (document.documentElement.classList.contains('dark') ? 'bg-gray-800 border-gray-700 rounded-xl' : 'bg-white rounded-xl');

// ── Data hooks ──────────────────────────────────────────────────────
/** Loads a paginated list from the API and reloads when params change. */
export function useList<T>(path: string | null, params: Record<string, unknown> = {}) {
    const { message } = App.useApp();
    const [data, setData] = useState<T[]>([]);
    const [pagination, setPagination] = useState<Pagination | undefined>();
    const [loading, setLoading] = useState(false);
    const key = JSON.stringify(params);
    const load = useCallback(async () => {
        if (!path) return;
        setLoading(true);
        try {
            const clean = Object.fromEntries(Object.entries(JSON.parse(key)).filter(([, v]) => v !== undefined && v !== null && v !== ''));
            const res = await http.get<T[]>(path, clean as Record<string, string>);
            setData(res.data);
            setPagination(res.pagination);
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [path, key, message]);
    useEffect(() => { load(); }, [load]);
    return { data, pagination, loading, reload: load, setData };
}

/** Wraps an API action with success / error messages. */
export const useAction = () => {
    const { message } = App.useApp();
    return useCallback(async <T,>(fn: () => Promise<T>, success?: string): Promise<T | undefined> => {
        try {
            const r = await fn();
            if (success) message.success(success);
            return r;
        } catch (err) {
            message.error(errorMessage(err));
            return undefined;
        }
    }, [message]);
};

/** Downloads a protected file (Excel, PDF) using the user's token. */
export const download = async (path: string, fallbackName = 'download') => {
    const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${tokenStore.get()}` } });
    if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Download failed');
    }
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const name = decodeURIComponent(cd.match(/filename="?([^";]+)"?/)?.[1] || fallbackName);
    const url = URL.createObjectURL(blob);
    if (blob.type === 'application/pdf' && /inline/.test(cd)) {
        window.open(url, '_blank', 'noopener');
    } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
};

/** POST multipart form data. */
export const upload = <T,>(path: string, form: FormData) => http.post<T>(path, form);

// ── Pickers ─────────────────────────────────────────────────────────
interface EmployeeOption { id: string; _id?: string; fullName: string; employeeCode: string }

/** Remote-search employee picker. */
export const EmployeeSelect = (props: SelectProps & { filter?: Record<string, string> }) => {
    const { filter, ...rest } = props;
    const [options, setOptions] = useState<EmployeeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const search = (q: string) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await http.get<EmployeeOption[]>('/employees', { search: q, limit: 30, ...(filter || {}) });
                setOptions(res.data);
            } catch { /* ignore */ } finally { setLoading(false); }
        }, 250);
    };
    useEffect(() => { search(''); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <Select
            showSearch
            allowClear
            placeholder="Select employee"
            filterOption={false}
            onSearch={search}
            loading={loading}
            options={options.map(e => ({ value: e.id || e._id, label: `${e.employeeCode} — ${e.fullName}` }))}
            {...rest}
        />
    );
};

interface Named { id: string; _id?: string; name?: string; code?: string; label?: string }
const optionCache = new Map<string, Promise<Named[]>>();

/** Select backed by an API list (org units, designations, groups, structures...). Cached per page load. */
export const RemoteSelect = ({ path, query = {}, labelKey = 'name', valueKey, ...rest }: SelectProps & { path: string; query?: Record<string, string>; labelKey?: string; valueKey?: string }) => {
    const [opts, setOpts] = useState<Named[]>([]);
    const key = `${path}?${new URLSearchParams(query)}`;
    useEffect(() => {
        if (!optionCache.has(key)) optionCache.set(key, http.get<Named[]>(path, { limit: 500, ...query }).then(r => r.data).catch(() => []));
        optionCache.get(key)!.then(setOpts);
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <Select
            allowClear
            showSearch
            optionFilterProp="label"
            options={opts.map((o) => {
                const r = o as unknown as Record<string, unknown>;
                const text = r[labelKey] ?? r.name ?? r.fullName ?? r.label ?? r.deviceCode;
                const code = r.code ?? r.employeeCode;
                return { value: valueKey ? String(r[valueKey]) : (o.id || o._id), label: `${text}${code && code !== text ? ` (${code})` : ''}` };
            })}
            {...rest}
        />
    );
};
export const clearOptionCache = () => optionCache.clear();

export const OrgSelect = ({ type, ...rest }: SelectProps & { type: string }) => (
    <RemoteSelect path="/hr/org-units" query={{ type, active: 'true' }} placeholder={label(type)} {...rest} />
);

/** Filters shared by reports, attendance and payroll screens. */
export const OrgFilters = ({ value, onChange, show = ['company', 'branch', 'hub', 'department', 'group'] }: {
    value: Record<string, string | undefined>;
    onChange: (v: Record<string, string | undefined>) => void;
    show?: string[];
}) => (
    <>
        {show.filter(k => k !== 'group').map(k => (
            <OrgSelect key={k} type={k} value={value[k]} onChange={(v) => onChange({ ...value, [k]: v as string })} className="w-44" placeholder={k === 'hub' ? 'Hub / Location' : label(k)} />
        ))}
        {show.includes('group') && (
            <RemoteSelect path="/hr/employee-groups" value={value.group} onChange={(v) => onChange({ ...value, group: v as string })} className="w-44" placeholder="Employee group" />
        )}
    </>
);

export const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank transfer' }, { value: 'cash', label: 'Cash' }, { value: 'cheque', label: 'Cheque' }, { value: 'other', label: 'Other' },
];
