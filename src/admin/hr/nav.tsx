import type { ReactNode } from 'react';
import {
    AccountBookOutlined, ApartmentOutlined, AppstoreOutlined, AuditOutlined, BankOutlined, BranchesOutlined, CalculatorOutlined, CalendarOutlined, CarryOutOutlined, ClockCircleOutlined,
    ClusterOutlined, ControlOutlined, DashboardOutlined, DollarOutlined, EnvironmentOutlined, FieldTimeOutlined, FileExcelOutlined, FileTextOutlined, FundOutlined,
    GiftOutlined, HistoryOutlined, IdcardOutlined, MinusCircleOutlined, PieChartOutlined, PlusCircleOutlined, ProfileOutlined, ScheduleOutlined, SettingOutlined, AimOutlined, DesktopOutlined,
    SwapOutlined, SafetyCertificateOutlined, KeyOutlined, TagsOutlined, ExportOutlined, ImportOutlined, DatabaseOutlined, InboxOutlined, TeamOutlined, ToolOutlined, UserOutlined, UserSwitchOutlined, WalletOutlined, WifiOutlined,
} from '@ant-design/icons';

/** `code` is the screen's security code, shown in the menu and used on the Security screens. */
export interface HrNavItem { path: string; code: string; label: string; icon: ReactNode; perms: string[] }
export interface HrNavSection { title: string; icon: ReactNode; items: HrNavItem[] }

/**
 * Payroll & HR menu. `perms` = any one of these permissions shows the item (an empty list = every back-office user).
 * Paths are relative to /admin/hr and match HrRoutes.
 */
export const HR_NAV: HrNavSection[] = [
    {
        // Shown as plain links at the top of the Payroll & HR menu; every other section is a collapsible group.
        title: 'Overview', icon: <DashboardOutlined />, items: [
            { path: '', code: 'HR-01', label: 'HR Dashboard', icon: <DashboardOutlined />, perms: ['hr.dashboard.view'] },
            { path: 'me', code: 'HR-02', label: 'My HR', icon: <UserOutlined />, perms: ['leave.request', 'payslip.view.own'] },
        ],
    },
    {
        title: 'People', icon: <TeamOutlined />, items: [
            { path: 'employees', code: 'PE-01', label: 'Employees', icon: <TeamOutlined />, perms: ['employee.view'] },
            { path: 'groups', code: 'PE-02', label: 'Employee Groups', icon: <ClusterOutlined />, perms: ['org.manage'] },
            { path: 'employee-salary', code: 'PE-03', label: 'Employee Salary', icon: <DollarOutlined />, perms: ['salary.view', 'salary.edit'] },
        ],
    },
    {
        title: 'Production', icon: <AimOutlined />, items: [
            { path: 'production', code: 'PR-01', label: 'Daily Target', icon: <AimOutlined />, perms: ['production.view', 'production.edit', 'production.manage'] },
            { path: 'factory-board', code: 'PR-02', label: 'Factory TV Board', icon: <DesktopOutlined />, perms: ['production.view', 'production.edit', 'production.manage'] },
        ],
    },
    {
        title: 'Stores & Gate Pass', icon: <InboxOutlined />, items: [
            { path: 'jobs', code: 'ST-01', label: 'Design Jobs', icon: <ScheduleOutlined />, perms: ['stores.view', 'stores.edit', 'stores.manage'] },
            { path: 'gate-pass-in', code: 'ST-02', label: 'Gate Pass In', icon: <ImportOutlined />, perms: ['stores.view', 'stores.edit', 'stores.manage'] },
            { path: 'gate-pass-out', code: 'ST-03', label: 'Gate Pass Out', icon: <ExportOutlined />, perms: ['stores.view', 'stores.edit', 'stores.manage'] },
            { path: 'stock', code: 'ST-04', label: 'Stock', icon: <DatabaseOutlined />, perms: ['stores.view', 'stores.edit', 'stores.manage'] },
            { path: 'items', code: 'ST-05', label: 'Item Master', icon: <AppstoreOutlined />, perms: ['stores.view', 'stores.manage'] },
        ],
    },
    {
        title: 'Time & Leave', icon: <ScheduleOutlined />, items: [
            { path: 'attendance', code: 'TL-01', label: 'Attendance', icon: <ScheduleOutlined />, perms: ['attendance.view'] },
            { path: 'leave', code: 'TL-02', label: 'Leave', icon: <CarryOutOutlined />, perms: ['leave.view', 'leave.approve', 'leave.approve.supervisor'] },
            { path: 'overtime', code: 'TL-03', label: 'Overtime', icon: <FieldTimeOutlined />, perms: ['overtime.view', 'overtime.approve'] },
            { path: 'import', code: 'TL-04', label: 'Excel Import / Export', icon: <FileExcelOutlined />, perms: ['attendance.import', 'payroll.export'] },
        ],
    },
    {
        title: 'Payroll', icon: <CalculatorOutlined />, items: [
            { path: 'payroll', code: 'PY-01', label: 'Payroll Processing', icon: <CalculatorOutlined />, perms: ['payroll.view', 'payroll.process'] },
            { path: 'adjustments', code: 'PY-02', label: 'Adjustments', icon: <ToolOutlined />, perms: ['payroll.adjust', 'payroll.view'] },
            { path: 'payslips', code: 'PY-03', label: 'Payslips', icon: <FileTextOutlined />, perms: ['payslip.view'] },
            { path: 'reports', code: 'PY-04', label: 'Reports', icon: <PieChartOutlined />, perms: ['reports.view'] },
        ],
    },
    {
        title: 'Pay Items', icon: <WalletOutlined />, items: [
            { path: 'allowances', code: 'PI-01', label: 'Allowances', icon: <PlusCircleOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'bonuses', code: 'PI-02', label: 'Bonuses & Incentives', icon: <GiftOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'deductions', code: 'PI-03', label: 'Deductions', icon: <MinusCircleOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'advances', code: 'PI-04', label: 'Salary Advances', icon: <WalletOutlined />, perms: ['advance.manage'] },
            { path: 'loans', code: 'PI-05', label: 'Loans', icon: <AccountBookOutlined />, perms: ['loan.manage'] },
            { path: 'external-payments', code: 'PI-06', label: 'External Payments', icon: <SwapOutlined />, perms: ['externalPayment.manage', 'externalPayment.approve'] },
        ],
    },
    {
        title: 'Organization', icon: <ApartmentOutlined />, items: [
            { path: 'org/company', code: 'OR-01', label: 'Companies', icon: <BankOutlined />, perms: ['org.manage'] },
            { path: 'org/branch', code: 'OR-02', label: 'Branches', icon: <BranchesOutlined />, perms: ['org.manage'] },
            { path: 'org/department', code: 'OR-03', label: 'Departments', icon: <ApartmentOutlined />, perms: ['org.manage'] },
            { path: 'designations', code: 'OR-04', label: 'Designations', icon: <IdcardOutlined />, perms: ['org.manage'] },
            { path: 'org/hub', code: 'OR-05', label: 'Hubs & Locations', icon: <EnvironmentOutlined />, perms: ['org.manage'] },
            { path: 'org/costCenter', code: 'OR-06', label: 'Cost Centers', icon: <FundOutlined />, perms: ['org.manage'] },
            { path: 'holidays', code: 'OR-07', label: 'Holidays', icon: <CalendarOutlined />, perms: ['org.manage', 'settings.manage', 'attendance.view'] },
        ],
    },
    {
        title: 'Biometrics', icon: <WifiOutlined />, items: [
            { path: 'biometric', code: 'BI-01', label: 'Devices', icon: <WifiOutlined />, perms: ['biometric.manage'] },
            { path: 'biometric/mappings', code: 'BI-02', label: 'User IDs', icon: <UserSwitchOutlined />, perms: ['biometric.manage'] },
            { path: 'biometric/events', code: 'BI-03', label: 'Events', icon: <HistoryOutlined />, perms: ['biometric.manage'] },
        ],
    },
    {
        title: 'HR Setup', icon: <ControlOutlined />, items: [
            { path: 'salary-components', code: 'SU-01', label: 'Salary Components', icon: <CalculatorOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'salary-structures', code: 'SU-02', label: 'Salary Structures', icon: <ProfileOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'leave-types', code: 'SU-03', label: 'Leave Types', icon: <TagsOutlined />, perms: ['leave.manage'] },
            { path: 'overtime-types', code: 'SU-04', label: 'Overtime Types', icon: <ClockCircleOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'lookups', code: 'SU-05', label: 'Lists & Lookups', icon: <AuditOutlined />, perms: ['settings.manage'] },
            { path: 'settings', code: 'SU-06', label: 'Payroll Settings', icon: <SettingOutlined />, perms: ['settings.manage', 'roles.manage', 'audit.view', 'salaryConfig.manage'] },
        ],
    },
    {
        title: 'Security', icon: <SafetyCertificateOutlined />, items: [
            { path: 'security/users', code: 'SE-01', label: 'Users & Logins', icon: <UserSwitchOutlined />, perms: ['roles.manage'] },
            { path: 'security/roles', code: 'SE-02', label: 'Roles & Rights', icon: <SafetyCertificateOutlined />, perms: ['roles.manage'] },
            { path: 'security/screens', code: 'SE-03', label: 'Screen Codes', icon: <KeyOutlined />, perms: ['roles.manage'] },
        ],
    },
];

/** First page a back-office user is allowed to open (used for redirects). */
export const firstHrPath = (can: (...p: string[]) => boolean) => {
    for (const s of HR_NAV) for (const i of s.items) if (!i.perms.length || can(...i.perms)) return `/admin/hr${i.path ? `/${i.path}` : ''}`;
    return null;
};
