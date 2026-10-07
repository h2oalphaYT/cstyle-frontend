import type { ReactNode } from 'react';
import {
    AccountBookOutlined, ApartmentOutlined, AuditOutlined, BankOutlined, BranchesOutlined, CalculatorOutlined, CalendarOutlined, CarryOutOutlined, ClockCircleOutlined,
    ClusterOutlined, ControlOutlined, DashboardOutlined, DollarOutlined, EnvironmentOutlined, FieldTimeOutlined, FileExcelOutlined, FileTextOutlined, FundOutlined,
    GiftOutlined, HistoryOutlined, IdcardOutlined, MinusCircleOutlined, PieChartOutlined, PlusCircleOutlined, ProfileOutlined, ScheduleOutlined, SettingOutlined, AimOutlined, DesktopOutlined,
    SwapOutlined, TagsOutlined, TeamOutlined, ToolOutlined, UserOutlined, UserSwitchOutlined, WalletOutlined, WifiOutlined,
} from '@ant-design/icons';

export interface HrNavItem { path: string; label: string; icon: ReactNode; perms: string[] }
export interface HrNavSection { title: string; icon: ReactNode; items: HrNavItem[] }

/**
 * Payroll & HR menu. `perms` = any one of these permissions shows the item (an empty list = every back-office user).
 * Paths are relative to /admin/hr and match HrRoutes.
 */
export const HR_NAV: HrNavSection[] = [
    {
        // Shown as plain links at the top of the Payroll & HR menu; every other section is a collapsible group.
        title: 'Overview', icon: <DashboardOutlined />, items: [
            { path: '', label: 'HR Dashboard', icon: <DashboardOutlined />, perms: ['hr.dashboard.view'] },
            { path: 'me', label: 'My HR', icon: <UserOutlined />, perms: ['leave.request', 'payslip.view.own'] },
        ],
    },
    {
        title: 'People', icon: <TeamOutlined />, items: [
            { path: 'employees', label: 'Employees', icon: <TeamOutlined />, perms: ['employee.view'] },
            { path: 'groups', label: 'Employee Groups', icon: <ClusterOutlined />, perms: ['org.manage'] },
            { path: 'employee-salary', label: 'Employee Salary', icon: <DollarOutlined />, perms: ['salary.view', 'salary.edit'] },
        ],
    },
    {
        title: 'Production', icon: <AimOutlined />, items: [
            { path: 'production', label: 'Daily Target', icon: <AimOutlined />, perms: ['production.view', 'production.edit', 'production.manage'] },
            { path: 'factory-board', label: 'Factory TV Board', icon: <DesktopOutlined />, perms: ['production.view', 'production.edit', 'production.manage'] },
        ],
    },
    {
        title: 'Time & Leave', icon: <ScheduleOutlined />, items: [
            { path: 'attendance', label: 'Attendance', icon: <ScheduleOutlined />, perms: ['attendance.view'] },
            { path: 'leave', label: 'Leave', icon: <CarryOutOutlined />, perms: ['leave.view', 'leave.approve', 'leave.approve.supervisor'] },
            { path: 'overtime', label: 'Overtime', icon: <FieldTimeOutlined />, perms: ['overtime.view', 'overtime.approve'] },
            { path: 'import', label: 'Excel Import / Export', icon: <FileExcelOutlined />, perms: ['attendance.import', 'payroll.export'] },
        ],
    },
    {
        title: 'Payroll', icon: <CalculatorOutlined />, items: [
            { path: 'payroll', label: 'Payroll Processing', icon: <CalculatorOutlined />, perms: ['payroll.view', 'payroll.process'] },
            { path: 'adjustments', label: 'Adjustments', icon: <ToolOutlined />, perms: ['payroll.adjust', 'payroll.view'] },
            { path: 'payslips', label: 'Payslips', icon: <FileTextOutlined />, perms: ['payslip.view'] },
            { path: 'reports', label: 'Reports', icon: <PieChartOutlined />, perms: ['reports.view'] },
        ],
    },
    {
        title: 'Pay Items', icon: <WalletOutlined />, items: [
            { path: 'allowances', label: 'Allowances', icon: <PlusCircleOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'bonuses', label: 'Bonuses & Incentives', icon: <GiftOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'deductions', label: 'Deductions', icon: <MinusCircleOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'advances', label: 'Salary Advances', icon: <WalletOutlined />, perms: ['advance.manage'] },
            { path: 'loans', label: 'Loans', icon: <AccountBookOutlined />, perms: ['loan.manage'] },
            { path: 'external-payments', label: 'External Payments', icon: <SwapOutlined />, perms: ['externalPayment.manage', 'externalPayment.approve'] },
        ],
    },
    {
        title: 'Organization', icon: <ApartmentOutlined />, items: [
            { path: 'org/company', label: 'Companies', icon: <BankOutlined />, perms: ['org.manage'] },
            { path: 'org/branch', label: 'Branches', icon: <BranchesOutlined />, perms: ['org.manage'] },
            { path: 'org/department', label: 'Departments', icon: <ApartmentOutlined />, perms: ['org.manage'] },
            { path: 'designations', label: 'Designations', icon: <IdcardOutlined />, perms: ['org.manage'] },
            { path: 'org/hub', label: 'Hubs & Locations', icon: <EnvironmentOutlined />, perms: ['org.manage'] },
            { path: 'org/costCenter', label: 'Cost Centers', icon: <FundOutlined />, perms: ['org.manage'] },
            { path: 'holidays', label: 'Holidays', icon: <CalendarOutlined />, perms: ['org.manage', 'settings.manage', 'attendance.view'] },
        ],
    },
    {
        title: 'Biometrics', icon: <WifiOutlined />, items: [
            { path: 'biometric', label: 'Devices', icon: <WifiOutlined />, perms: ['biometric.manage'] },
            { path: 'biometric/mappings', label: 'User IDs', icon: <UserSwitchOutlined />, perms: ['biometric.manage'] },
            { path: 'biometric/events', label: 'Events', icon: <HistoryOutlined />, perms: ['biometric.manage'] },
        ],
    },
    {
        title: 'HR Setup', icon: <ControlOutlined />, items: [
            { path: 'salary-components', label: 'Salary Components', icon: <CalculatorOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'salary-structures', label: 'Salary Structures', icon: <ProfileOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'leave-types', label: 'Leave Types', icon: <TagsOutlined />, perms: ['leave.manage'] },
            { path: 'overtime-types', label: 'Overtime Types', icon: <ClockCircleOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'lookups', label: 'Lists & Lookups', icon: <AuditOutlined />, perms: ['settings.manage'] },
            { path: 'settings', label: 'Payroll Settings', icon: <SettingOutlined />, perms: ['settings.manage', 'roles.manage', 'audit.view', 'salaryConfig.manage'] },
        ],
    },
];

/** First page a back-office user is allowed to open (used for redirects). */
export const firstHrPath = (can: (...p: string[]) => boolean) => {
    for (const s of HR_NAV) for (const i of s.items) if (!i.perms.length || can(...i.perms)) return `/admin/hr${i.path ? `/${i.path}` : ''}`;
    return null;
};
