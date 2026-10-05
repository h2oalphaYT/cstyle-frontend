import type { ReactElement } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Result } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { firstHrPath, HR_NAV } from './nav';
import EmployeesPage from './Employees';
import { BiometricDevicesPage, BiometricMappingsPage, DesignationsPage, EmployeeGroupsPage, HolidaysPage, LeaveTypesPage, LookupsPage, OrgUnitsPage, OvertimeTypesPage } from './SetupPages';
import { EmployeeSalaryPage, SalaryComponentsPage, SalaryStructuresPage } from './Salary';
import { AttendancePage, BiometricEventsPage, ImportExportPage } from './Attendance';
import { LeavePage, OvertimePage } from './Leave';
import { AdvancesPage, ExternalPaymentsPage, PayrollEntriesPage } from './Finance';
import { AdjustmentsPage, PayrollProcessingPage, PayrollRunPage, PayslipsPage, ReportsPage } from './Payroll';
import { HrDashboard, MyHrPage } from './Dashboard';
import PayrollSettingsPage from './Settings';

const permsFor = (path: string) => HR_NAV.flatMap(s => s.items).find(i => i.path === path)?.perms || [];

/** Shows the page only when the user has one of the permissions of its menu entry. */
const Guard = ({ path, children }: { path: string; children: ReactElement }) => {
    const { can } = useAuth();
    const perms = permsFor(path);
    if (perms.length && !can(...perms)) {
        return <Result status="403" title="No access" subTitle="Your role does not include this part of Payroll & HR. Ask an administrator if you need it." />;
    }
    return children;
};

const DashboardOrFirst = () => {
    const { can } = useAuth();
    if (can('hr.dashboard.view')) return <HrDashboard />;
    const first = firstHrPath(can);
    return first && first !== '/admin/hr' ? <Navigate to={first} replace /> : <Result status="403" title="No access" />;
};

/** Remount per organisation type so filters and forms reset. */
const OrgRoute = () => { const { type } = useParams(); return <OrgUnitsPage key={type} />; };

const pages: [string, ReactElement][] = [
    ['me', <MyHrPage />],
    ['employees', <EmployeesPage />],
    ['groups', <EmployeeGroupsPage />],
    ['designations', <DesignationsPage />],
    ['holidays', <HolidaysPage />],
    ['salary-components', <SalaryComponentsPage />],
    ['salary-structures', <SalaryStructuresPage />],
    ['employee-salary', <EmployeeSalaryPage />],
    ['attendance', <AttendancePage />],
    ['import', <ImportExportPage />],
    ['biometric', <BiometricDevicesPage />],
    ['biometric/mappings', <BiometricMappingsPage />],
    ['biometric/events', <BiometricEventsPage />],
    ['leave', <LeavePage />],
    ['leave-types', <LeaveTypesPage />],
    ['overtime', <OvertimePage />],
    ['overtime-types', <OvertimeTypesPage />],
    ['advances', <AdvancesPage kind="advance" key="advance" />],
    ['loans', <AdvancesPage kind="loan" key="loan" />],
    ['allowances', <PayrollEntriesPage kind="allowance" key="allowance" />],
    ['bonuses', <PayrollEntriesPage kind="bonus" key="bonus" />],
    ['deductions', <PayrollEntriesPage kind="deduction" key="deduction" />],
    ['external-payments', <ExternalPaymentsPage />],
    ['payroll', <PayrollProcessingPage />],
    ['adjustments', <AdjustmentsPage />],
    ['payslips', <PayslipsPage />],
    ['reports', <ReportsPage />],
    ['lookups', <LookupsPage />],
    ['settings', <PayrollSettingsPage />],
];

export default function HrRoutes() {
    return (
        <Routes>
            <Route index element={<DashboardOrFirst />} />
            {pages.map(([path, el]) => <Route key={path} path={path} element={<Guard path={path}>{el}</Guard>} />)}
            <Route path="org/:type" element={<Guard path="org/department"><OrgRoute /></Guard>} />
            <Route path="payroll/runs/:id" element={<Guard path="payroll"><PayrollRunPage /></Guard>} />
            <Route path="*" element={<Navigate to="/admin/hr" replace />} />
        </Routes>
    );
}
