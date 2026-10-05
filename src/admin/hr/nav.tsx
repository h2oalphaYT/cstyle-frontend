import type { ReactNode } from 'react';
import {
    AccountBookOutlined, ApartmentOutlined, AuditOutlined, BankOutlined, CalculatorOutlined, CalendarOutlined, ClusterOutlined, DashboardOutlined, DollarOutlined,
    FileExcelOutlined, FileTextOutlined, FieldTimeOutlined, GiftOutlined, IdcardOutlined, MinusCircleOutlined, PartitionOutlined, PieChartOutlined, PlusCircleOutlined,
    ProfileOutlined, ScheduleOutlined, SettingOutlined, SolutionOutlined, SwapOutlined, TeamOutlined, ToolOutlined, UserOutlined, WalletOutlined, WifiOutlined,
} from '@ant-design/icons';

export interface HrNavItem { path: string; label: string; icon: ReactNode; perms: string[] }
export interface HrNavSection { title: string; items: HrNavItem[] }

/**
 * Payroll & HR menu. `perms` = any one of these permissions shows the item (an empty list = every back-office user).
 * Paths are relative to /admin/hr and match HrRoutes.
 */
export const HR_NAV: HrNavSection[] = [
    {
        title: 'Overview', items: [
            { path: '', label: 'HR Dashboard', icon: <DashboardOutlined />, perms: ['hr.dashboard.view'] },
            { path: 'me', label: 'My HR', icon: <UserOutlined />, perms: ['leave.request', 'payslip.view.own'] },
        ],
    },
    {
        title: 'People', items: [
            { path: 'employees', label: 'Employees', icon: <TeamOutlined />, perms: ['employee.view'] },
            { path: 'groups', label: 'Employee Groups', icon: <ClusterOutlined />, perms: ['org.manage'] },
            { path: 'org/department', label: 'Departments', icon: <ApartmentOutlined />, perms: ['org.manage'] },
            { path: 'designations', label: 'Designations', icon: <IdcardOutlined />, perms: ['org.manage'] },
            { path: 'org/company', label: 'Companies', icon: <BankOutlined />, perms: ['org.manage'] },
            { path: 'org/branch', label: 'Branches', icon: <PartitionOutlined />, perms: ['org.manage'] },
            { path: 'org/hub', label: 'Hubs & Locations', icon: <PartitionOutlined />, perms: ['org.manage'] },
            { path: 'org/costCenter', label: 'Cost Centers', icon: <PartitionOutlined />, perms: ['org.manage'] },
            { path: 'holidays', label: 'Holidays', icon: <CalendarOutlined />, perms: ['org.manage'] },
        ],
    },
    {
        title: 'Salary', items: [
            { path: 'salary-components', label: 'Salary Components', icon: <CalculatorOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'salary-structures', label: 'Salary Structures', icon: <ProfileOutlined />, perms: ['salaryConfig.manage'] },
            { path: 'employee-salary', label: 'Employee Salary', icon: <DollarOutlined />, perms: ['salary.view', 'salary.edit'] },
        ],
    },
    {
        title: 'Time & Attendance', items: [
            { path: 'attendance', label: 'Attendance', icon: <ScheduleOutlined />, perms: ['attendance.view'] },
            { path: 'import', label: 'Excel Import / Export', icon: <FileExcelOutlined />, perms: ['attendance.import', 'payroll.export'] },
            { path: 'biometric', label: 'Biometric Devices', icon: <WifiOutlined />, perms: ['biometric.manage'] },
            { path: 'biometric/mappings', label: 'Biometric User IDs', icon: <IdcardOutlined />, perms: ['biometric.manage'] },
            { path: 'biometric/events', label: 'Biometric Events', icon: <WifiOutlined />, perms: ['biometric.manage'] },
            { path: 'leave', label: 'Leave', icon: <SolutionOutlined />, perms: ['leave.view', 'leave.approve', 'leave.approve.supervisor'] },
            { path: 'leave-types', label: 'Leave Types', icon: <SolutionOutlined />, perms: ['leave.manage'] },
            { path: 'overtime', label: 'Overtime', icon: <FieldTimeOutlined />, perms: ['overtime.view', 'overtime.approve'] },
            { path: 'overtime-types', label: 'Overtime Types', icon: <FieldTimeOutlined />, perms: ['salaryConfig.manage'] },
        ],
    },
    {
        title: 'Pay Items', items: [
            { path: 'advances', label: 'Salary Advances', icon: <WalletOutlined />, perms: ['advance.manage'] },
            { path: 'loans', label: 'Loans', icon: <AccountBookOutlined />, perms: ['loan.manage'] },
            { path: 'allowances', label: 'Allowances', icon: <PlusCircleOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'bonuses', label: 'Bonuses & Incentives', icon: <GiftOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'deductions', label: 'Deductions', icon: <MinusCircleOutlined />, perms: ['payrollEntry.manage'] },
            { path: 'external-payments', label: 'External Payments', icon: <SwapOutlined />, perms: ['externalPayment.manage', 'externalPayment.approve'] },
        ],
    },
    {
        title: 'Payroll', items: [
            { path: 'payroll', label: 'Payroll Processing', icon: <CalculatorOutlined />, perms: ['payroll.view', 'payroll.process'] },
            { path: 'adjustments', label: 'Adjustments', icon: <ToolOutlined />, perms: ['payroll.adjust', 'payroll.view'] },
            { path: 'payslips', label: 'Payslips', icon: <FileTextOutlined />, perms: ['payslip.view'] },
            { path: 'reports', label: 'Reports', icon: <PieChartOutlined />, perms: ['reports.view'] },
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
