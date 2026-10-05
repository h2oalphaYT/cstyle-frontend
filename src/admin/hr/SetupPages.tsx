import { useParams } from 'react-router-dom';
import { App, Button, Tag, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import MasterData, { FieldDef } from './MasterData';
import { label, StatusTag, useAction } from './lib';

type Row = { id: string; active?: boolean; [k: string]: unknown };
const nameOf = (v: unknown) => (v && typeof v === 'object' ? (v as { name?: string; fullName?: string }).name || (v as { fullName?: string }).fullName : '') || '—';

const ORG_TITLES: Record<string, [string, string]> = {
    company: ['Companies', 'Legal entities / organisations'],
    branch: ['Branches', 'Offices and branches'],
    hub: ['Hubs & Locations', 'Hubs such as schools, restaurants, government locations or sites'],
    location: ['Work Locations', 'Physical work locations'],
    department: ['Departments', 'Departments used for reporting and approvals'],
    costCenter: ['Cost Centers', 'Cost centres used for payroll costing'],
    project: ['Projects', 'Projects employees can be assigned to'],
};

export const OrgUnitsPage = () => {
    const { type = 'department' } = useParams();
    const [title, subtitle] = ORG_TITLES[type] || ['Organisation', ''];
    const fields: FieldDef[] = [
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, pattern: /^[A-Za-z0-9_-]+$/, patternMessage: 'Letters, numbers, - and _' },
        ...(type !== 'company' ? [{ name: 'parent', label: 'Belongs to', type: 'remote', path: '/hr/org-units', help: 'Company, branch or hub this unit sits under' } as FieldDef] : []),
        ...(['hub', 'location', 'branch'].includes(type) ? [{ name: 'category', label: 'Category', help: 'e.g. School, Restaurant, Government office, Warehouse' } as FieldDef] : []),
        { name: 'address', label: 'Address' },
        { name: 'phone', label: 'Phone' },
        { name: 'description', label: 'Description', type: 'textarea', span: 2 },
        { name: 'active', label: 'Active', type: 'switch' },
    ];
    return (
        <MasterData<Row>
            key={type}
            title={title}
            subtitle={subtitle}
            path="/hr/org-units"
            query={{ type }}
            writePermission={['org.manage']}
            fields={fields}
            toForm={(r) => ({ ...r, parent: (r.parent as { _id?: string })?._id || r.parent })}
            columns={[
                { title: 'Code', dataIndex: 'code', width: 120 },
                { title: 'Name', dataIndex: 'name' },
                { title: 'Under', dataIndex: 'parent', render: nameOf },
                ...(['hub', 'location', 'branch'].includes(type) ? [{ title: 'Category', dataIndex: 'category' }] : []),
                { title: 'Phone', dataIndex: 'phone', width: 130 },
            ]}
        />
    );
};

export const DesignationsPage = () => (
    <MasterData<Row>
        title="Designations" path="/hr/designations" writePermission={['org.manage']}
        fields={[
            { name: 'name', label: 'Title', required: true }, { name: 'code', label: 'Code', required: true },
            { name: 'department', label: 'Department', type: 'org', orgType: 'department' }, { name: 'grade', label: 'Grade' },
            { name: 'description', label: 'Description', type: 'textarea' }, { name: 'active', label: 'Active', type: 'switch' },
        ]}
        toForm={(r) => ({ ...r, department: (r.department as { _id?: string })?._id })}
        columns={[{ title: 'Code', dataIndex: 'code', width: 120 }, { title: 'Title', dataIndex: 'name' }, { title: 'Department', dataIndex: 'department', render: nameOf }, { title: 'Grade', dataIndex: 'grade', width: 90 }]}
    />
);

export const EmployeeGroupsPage = () => (
    <MasterData<Row>
        title="Employee Groups"
        subtitle="Each group can use its own default salary structure and payroll rule overrides"
        path="/hr/employee-groups" writePermission={['org.manage']}
        fields={[
            { name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true },
            { name: 'defaultSalaryStructure', label: 'Default salary structure', type: 'remote', path: '/salary-structures' },
            { name: 'payFrequency', label: 'Pay frequency', type: 'select', options: ['monthly', 'semi_monthly', 'weekly', 'daily'].map(v => ({ value: v, label: label(v) })) },
            { name: ['settings', 'workingDaysPerMonth'], label: 'Working days / month (override)', type: 'number', min: 0, max: 31 },
            { name: ['settings', 'workingHoursPerDay'], label: 'Working hours / day (override)', type: 'number', min: 0, max: 24 },
            { name: ['settings', 'workdayStart'], label: 'Work starts (HH:MM)', pattern: /^([01]\d|2[0-3]):[0-5]\d$/ },
            { name: ['settings', 'workdayEnd'], label: 'Work ends (HH:MM)', pattern: /^([01]\d|2[0-3]):[0-5]\d$/ },
            { name: ['settings', 'lateGraceMinutes'], label: 'Late grace (minutes)', type: 'number', min: 0 },
            { name: ['settings', 'defaultOtMultiplier'], label: 'Default OT multiplier', type: 'number', min: 0 },
            { name: ['settings', 'missingAttendance'], label: 'Days with no attendance', type: 'select', options: [{ value: 'ignore', label: 'Ignore (warn only)' }, { value: 'absent', label: 'Count as absent' }] },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'active', label: 'Active', type: 'switch' },
        ]}
        toForm={(r) => ({ ...r, defaultSalaryStructure: (r.defaultSalaryStructure as { _id?: string })?._id })}
        toBody={(v) => ({ ...v, settings: Object.fromEntries(Object.entries((v.settings as Record<string, unknown>) || {}).filter(([, x]) => x !== undefined && x !== null && x !== '')) })}
        columns={[
            { title: 'Code', dataIndex: 'code', width: 130 }, { title: 'Name', dataIndex: 'name' },
            { title: 'Default structure', dataIndex: 'defaultSalaryStructure', render: nameOf },
            { title: 'Overrides', dataIndex: 'settings', render: (s: Record<string, unknown>) => Object.keys(s || {}).length ? Object.entries(s).map(([k, v]) => <Tag key={k}>{k}: {String(v)}</Tag>) : '—' },
        ]}
    />
);

export const LeaveTypesPage = () => (
    <MasterData<Row>
        title="Leave Types" path="/leave-types" writePermission={['leave.manage']}
        defaults={{ active: true, paid: true, approvalRequired: true, supervisorApproval: true, allowHalfDay: true, trackBalance: true, color: '#3B82F6' }}
        fields={[
            { name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true },
            { name: 'annualEntitlement', label: 'Annual entitlement (days)', type: 'number', min: 0 }, { name: 'maxDaysPerRequest', label: 'Max days per request', type: 'number', min: 0 },
            { name: 'paid', label: 'Paid', type: 'switch' }, { name: 'trackBalance', label: 'Track balance', type: 'switch' },
            { name: 'carryForward', label: 'Carry forward', type: 'switch' }, { name: 'maxCarryForward', label: 'Max carry forward (days)', type: 'number', min: 0 },
            { name: 'approvalRequired', label: 'Approval required', type: 'switch' }, { name: 'supervisorApproval', label: 'Supervisor step before HR', type: 'switch' },
            { name: 'allowHalfDay', label: 'Half day allowed', type: 'switch' }, { name: 'allowNegativeBalance', label: 'Allow beyond balance', type: 'switch' },
            { name: 'documentRequired', label: 'Document required', type: 'switch' }, { name: 'documentRequiredAfterDays', label: 'Document needed after (days)', type: 'number', min: 0 },
            { name: 'countWeekends', label: 'Count weekends / holidays', type: 'switch' }, { name: 'color', label: 'Colour', type: 'color' },
            { name: 'active', label: 'Active', type: 'switch' },
        ]}
        columns={[
            { title: 'Code', dataIndex: 'code', width: 110, render: (c: string, r) => <Tag color={r.color as string}>{c}</Tag> }, { title: 'Name', dataIndex: 'name' },
            { title: 'Days / year', dataIndex: 'annualEntitlement', width: 100 }, { title: 'Paid', dataIndex: 'paid', width: 80, render: (p: boolean) => (p ? 'Paid' : 'Unpaid') },
            { title: 'Carry fwd', dataIndex: 'maxCarryForward', width: 100, render: (v: number, r) => (r.carryForward ? v : '—') },
            { title: 'Approval', dataIndex: 'approvalRequired', width: 150, render: (a: boolean, r) => (a ? (r.supervisorApproval ? 'Supervisor → HR' : 'HR') : 'Not needed') },
        ]}
    />
);

export const OvertimeTypesPage = () => (
    <MasterData<Row>
        title="Overtime Types" subtitle="Rate = rate formula if set, otherwise Hourly rate × multiplier (Normal OT uses the employee's OT rate when one is set)"
        path="/overtime-types" writePermission={['salaryConfig.manage', 'settings.manage']}
        defaults={{ active: true, multiplier: 1.5, approvalRequired: true, minMinutes: 30, roundingMinutes: 15 }}
        fields={[
            { name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code (used as OTHours_CODE)', required: true, pattern: /^[A-Z][A-Z0-9_]*$/, patternMessage: 'Upper-case letters, numbers and _' },
            { name: 'multiplier', label: 'Multiplier × hourly rate', type: 'number', min: 0 }, { name: 'rateFormula', label: 'Rate formula (optional)', help: 'e.g. HourlyRate * 2 or OTRate' },
            { name: 'minMinutes', label: 'Minimum minutes', type: 'number', min: 0 }, { name: 'roundingMinutes', label: 'Round down to (minutes)', type: 'number', min: 0 },
            { name: 'approvalRequired', label: 'Approval required', type: 'switch' }, { name: 'active', label: 'Active', type: 'switch' },
        ]}
        columns={[
            { title: 'Code', dataIndex: 'code', width: 110 }, { title: 'Name', dataIndex: 'name' },
            { title: 'Rate', render: (_, r) => (r.rateFormula ? <code>{r.rateFormula as string}</code> : `× ${r.multiplier}`) },
            { title: 'Min / rounding', render: (_, r) => `${r.minMinutes} min / ${r.roundingMinutes || 0} min` },
            { title: 'Approval', dataIndex: 'approvalRequired', width: 100, render: (a: boolean) => (a ? 'Required' : 'Auto') },
        ]}
    />
);

export const HolidaysPage = () => (
    <MasterData<Row>
        title="Holidays" subtitle="Holidays are excluded from scheduled days; work on them is holiday overtime"
        path="/hr/holidays" writePermission={['settings.manage', 'attendance.edit']} defaults={{ type: 'public', paid: true }}
        fields={[
            { name: 'date', label: 'Date', type: 'date', required: true }, { name: 'name', label: 'Name', required: true },
            { name: 'type', label: 'Type', type: 'select', options: ['public', 'mercantile', 'bank', 'company', 'other'].map(v => ({ value: v, label: label(v) })) },
            { name: 'paid', label: 'Paid holiday', type: 'switch' },
            { name: 'orgUnits', label: 'Applies to (empty = everyone)', type: 'orgMulti' },
        ]}
        columns={[
            { title: 'Date', dataIndex: 'date', width: 120 }, { title: 'Name', dataIndex: 'name' }, { title: 'Type', dataIndex: 'type', render: label, width: 120 },
            { title: 'Paid', dataIndex: 'paid', width: 80, render: (p: boolean) => (p ? 'Yes' : 'No') },
            { title: 'Applies to', dataIndex: 'orgUnits', render: (u: string[]) => (u?.length ? `${u.length} unit(s)` : 'Everyone') },
        ]}
    />
);

export const LookupsPage = () => (
    <MasterData<Row>
        title="Lists" subtitle="Employment types, external payment types, document types and banks"
        path="/hr/lookups" writePermission={['settings.manage']}
        fields={[
            { name: 'category', label: 'List', type: 'select', required: true, options: [
                { value: 'employmentType', label: 'Employment type' }, { value: 'externalPaymentType', label: 'External payment type' },
                { value: 'documentType', label: 'Document type' }, { value: 'bank', label: 'Bank' }] },
            { name: 'code', label: 'Code', required: true }, { name: 'label', label: 'Label', required: true },
            { name: 'sortOrder', label: 'Order', type: 'number' }, { name: 'active', label: 'Active', type: 'switch' },
        ]}
        columns={[{ title: 'List', dataIndex: 'category', render: label, width: 180 }, { title: 'Code', dataIndex: 'code', width: 160 }, { title: 'Label', dataIndex: 'label' }]}
    />
);

const DeviceKeyButton = ({ row }: { row: Row }) => {
    const { modal } = App.useApp();
    const act = useAction();
    const issue = () => modal.confirm({
        title: `Issue a new API key for ${row.deviceCode}?`,
        content: 'Any previous key stops working immediately.',
        onOk: async () => {
            const r = await act(() => http.post<{ apiKey: string }>(`/biometric/devices/${row.id}/api-key`));
            if (r) {
                modal.info({
                    title: 'Device API key',
                    width: 560,
                    content: (
                        <div className="space-y-2">
                            <p>Configure the device (or its push middleware) to send punches to <code>POST /api/biometric/events</code> with these headers. The key is shown only once.</p>
                            <Typography.Paragraph copyable code>{`X-Device-Code: ${row.deviceCode}`}</Typography.Paragraph>
                            <Typography.Paragraph copyable={{ text: r.data.apiKey }} code>{`X-Device-Key: ${r.data.apiKey}`}</Typography.Paragraph>
                        </div>
                    ),
                });
            }
        },
    });
    return <Button type="text" icon={<KeyOutlined />} onClick={issue} title="Issue API key" />;
};

export const BiometricDevicesPage = () => (
    <MasterData<Row>
        title="Biometric Devices" subtitle="Fingerprint / face devices. Devices push punches to the API; no device needs to be connected to use the rest of payroll."
        path="/biometric/devices" writePermission={['biometric.manage']} defaults={{ active: true, protocol: 'push_api', eventMode: 'first_last', duplicateWindowMinutes: 2, timezoneOffsetMinutes: 330 }}
        fields={[
            { name: 'deviceCode', label: 'Device ID', required: true }, { name: 'name', label: 'Device name', required: true },
            { name: 'serialNumber', label: 'Serial number' }, { name: 'ipAddress', label: 'IP address' }, { name: 'port', label: 'Port', type: 'number', min: 0, max: 65535 },
            { name: 'branch', label: 'Branch', type: 'org', orgType: 'branch' }, { name: 'location', label: 'Hub / location', type: 'org', orgType: 'hub' },
            { name: 'protocol', label: 'API / protocol', type: 'select', options: [{ value: 'push_api', label: 'Push API' }, { value: 'csv_file', label: 'CSV log upload' }, { value: 'zkteco', label: 'ZKTeco (adapter needed)' }, { value: 'other', label: 'Other' }] },
            { name: 'eventMode', label: 'Check-in/out rule', type: 'select', options: [{ value: 'first_last', label: 'First punch = in, last = out' }, { value: 'explicit', label: 'Use device IN/OUT flags' }] },
            { name: 'duplicateWindowMinutes', label: 'Ignore repeat punches within (min)', type: 'number', min: 0 },
            { name: 'active', label: 'Active', type: 'switch' },
        ]}
        toForm={(r) => ({ ...r, branch: (r.branch as { _id?: string })?._id, location: (r.location as { _id?: string })?._id })}
        extraActions={(row) => <DeviceKeyButton row={row} />}
        columns={[
            { title: 'Device ID', dataIndex: 'deviceCode', width: 120 }, { title: 'Name', dataIndex: 'name' }, { title: 'Branch', dataIndex: 'branch', render: nameOf },
            { title: 'IP:Port', render: (_, r) => (r.ipAddress ? `${r.ipAddress}${r.port ? `:${r.port}` : ''}` : '—') },
            { title: 'Mode', dataIndex: 'eventMode', render: (m: string) => (m === 'explicit' ? 'IN/OUT flags' : 'First / last'), width: 110 },
            { title: 'Status', dataIndex: 'status', width: 100, render: (s: string) => <StatusTag status={s} /> },
            { title: 'Last sync', dataIndex: 'lastSyncAt', width: 160, render: (d: string) => (d ? new Date(d).toLocaleString() : 'Never') },
            { title: 'Key', dataIndex: 'apiKeyHint', width: 140, render: (h: string) => h || <Typography.Text type="secondary">none</Typography.Text> },
        ]}
    />
);

export const BiometricMappingsPage = () => (
    <MasterData<Row>
        title="Biometric ID Mapping" subtitle="Link the user ID enrolled on a device to an employee"
        path="/biometric/mappings" writePermission={['biometric.manage']} defaults={{ status: 'active' }}
        fields={[
            { name: 'employee', label: 'Employee', type: 'remote', path: '/employees', required: true },
            { name: 'device', label: 'Device (empty = all devices)', type: 'remote', path: '/biometric/devices' },
            { name: 'biometricUserId', label: 'Biometric / fingerprint user ID', required: true },
            { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        ]}
        toForm={(r) => ({ ...r, employee: (r.employee as { _id?: string })?._id, device: (r.device as { _id?: string })?._id })}
        columns={[
            { title: 'Biometric ID', dataIndex: 'biometricUserId', width: 140 },
            { title: 'Employee', dataIndex: 'employee', render: (e: { fullName?: string; employeeCode?: string }) => (e ? `${e.employeeCode} — ${e.fullName}` : '—') },
            { title: 'Device', dataIndex: 'device', render: (d: { deviceCode?: string }) => d?.deviceCode || 'All devices' },
            { title: 'Status', dataIndex: 'status', width: 100, render: (s: string) => <StatusTag status={s} /> },
        ]}
    />
);
