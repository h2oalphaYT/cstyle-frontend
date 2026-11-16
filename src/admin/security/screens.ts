import { HR_NAV } from '../hr/nav';

/**
 * Rights levels per screen, as the permissions each level gives. A level includes the ones below it.
 * Screens of one area can share a permission (e.g. all Organization screens use org.manage), so
 * changing one of them changes the others too; the matrix shows that.
 */
export type Level = 'none' | 'view' | 'edit' | 'full';
export const LEVELS: { value: Level; label: string }[] = [
    { value: 'none', label: 'No access' }, { value: 'view', label: 'View' }, { value: 'edit', label: 'Add / Edit' }, { value: 'full', label: 'Full' },
];

type Spec = Partial<Record<Exclude<Level, 'none'>, string[]>>;
const v = (view: string[], edit: string[] = [], full: string[] = []): Spec => {
    const s: Spec = { view };
    if (edit.length) s.edit = [...view, ...edit];
    if (full.length) s.full = [...(s.edit || view), ...full];
    return s;
};
const only = (perms: string[]): Spec => ({ full: perms });

const SPECS: Record<string, Spec> = {
    '': v(['hr.dashboard.view']),
    me: v(['payslip.view.own'], ['leave.request']),
    employees: v(['employee.view'], ['employee.create', 'employee.edit'], ['employee.delete', 'employee.bank.view', 'employee.bank.edit']),
    groups: only(['org.manage']),
    'employee-salary': v(['salary.view'], ['salary.edit']),
    production: v(['production.view'], ['production.edit'], ['production.manage']),
    'factory-board': v(['production.view']),
    jobs: v(['stores.view'], ['stores.edit'], ['stores.manage']),
    'gate-pass-in': v(['stores.view'], ['stores.edit'], ['stores.manage']),
    'gate-pass-out': v(['stores.view'], ['stores.edit'], ['stores.manage']),
    stock: v(['stores.view'], [], ['stores.manage']),
    items: v(['stores.view'], [], ['stores.manage']),
    attendance: v(['attendance.view'], ['attendance.edit'], ['attendance.import']),
    leave: v(['leave.view'], ['leave.approve.supervisor'], ['leave.approve']),
    overtime: v(['overtime.view'], ['overtime.edit'], ['overtime.approve']),
    import: v(['payroll.export'], [], ['attendance.import']),
    payroll: v(['payroll.view'], ['payroll.process'], ['payroll.approve', 'payroll.finalize', 'payroll.pay', 'payroll.lock']),
    adjustments: v(['payroll.view'], [], ['payroll.adjust']),
    payslips: v(['payslip.view']),
    reports: v(['reports.view']),
    allowances: only(['payrollEntry.manage']),
    bonuses: only(['payrollEntry.manage']),
    deductions: only(['payrollEntry.manage']),
    advances: only(['advance.manage']),
    loans: only(['loan.manage']),
    'external-payments': { edit: ['externalPayment.manage'], full: ['externalPayment.manage', 'externalPayment.approve'] },
    'org/company': only(['org.manage']),
    'org/branch': only(['org.manage']),
    'org/department': only(['org.manage']),
    designations: only(['org.manage']),
    'org/hub': only(['org.manage']),
    'org/costCenter': only(['org.manage']),
    holidays: only(['org.manage']),
    biometric: only(['biometric.manage']),
    'biometric/mappings': only(['biometric.manage']),
    'biometric/events': only(['biometric.manage']),
    'salary-components': only(['salaryConfig.manage']),
    'salary-structures': only(['salaryConfig.manage']),
    'leave-types': only(['leave.manage']),
    'overtime-types': only(['salaryConfig.manage']),
    lookups: only(['settings.manage']),
    settings: v(['audit.view'], [], ['settings.manage']),
    'security/users': only(['roles.manage']),
    'security/roles': only(['roles.manage']),
    'security/screens': only(['roles.manage']),
};

export interface Screen { code: string; path: string; label: string; section: string; spec: Spec; adminOnly?: boolean }
export interface Section { title: string; screens: Screen[]; adminOnly?: boolean }

/** Store screens: administrators only (the store API does not use screen rights). */
const STORE: Section[] = [
    { title: 'Store', adminOnly: true, screens: [['SO-01', '/admin', 'Dashboard'], ['SO-02', '/admin/orders', 'Orders'], ['SO-03', '/admin/customers', 'Customers'], ['SO-04', '/admin/analytics', 'Analytics']].map(([code, path, label]) => ({ code, path, label, section: 'Store', spec: {}, adminOnly: true })) },
    { title: 'Catalog', adminOnly: true, screens: [['CA-01', '/admin/products', 'Products'], ['CA-02', '/admin/categories', 'Categories'], ['CA-03', '/admin/inventory', 'Stock / Inventory'], ['CA-04', '/admin/offers', 'Coupons & Banners']].map(([code, path, label]) => ({ code, path, label, section: 'Catalog', spec: {}, adminOnly: true })) },
    { title: 'System', adminOnly: true, screens: [{ code: 'SY-01', path: '/admin/settings', label: 'Store Settings', section: 'System', spec: {}, adminOnly: true }] },
];

export const SECTIONS: Section[] = [
    ...HR_NAV.map(s => ({
        title: s.title,
        screens: s.items.map(i => ({ code: i.code, path: `/admin/hr${i.path ? `/${i.path}` : ''}`, label: i.label, section: s.title, spec: SPECS[i.path] || { view: i.perms } })),
    })),
    ...STORE,
];
export const SCREENS = SECTIONS.flatMap(s => s.screens);

const allOf = (s: Spec) => [...new Set([...(s.view || []), ...(s.edit || []), ...(s.full || [])])];
export const levelsOf = (s: Spec): Level[] => ['none', ...(['view', 'edit', 'full'] as const).filter(l => s[l])];

/** The highest level whose permissions are all held. */
export const levelOf = (screen: Screen, perms: Set<string>): Level => {
    for (const l of ['full', 'edit', 'view'] as const) {
        const p = screen.spec[l];
        if (p && p.every(x => perms.has(x))) return l;
    }
    return 'none';
};

/** Sets one screen to a level: removes everything the screen can give, then adds the level's permissions. */
export const setLevel = (screen: Screen, perms: string[], level: Level): string[] => {
    const remove = new Set(allOf(screen.spec));
    const next = new Set(perms.filter(p => !remove.has(p)));
    if (level !== 'none') for (const p of screen.spec[level] || []) next.add(p);
    return [...next];
};

/** Other screens that use some of the same permissions (they move together). */
export const sharedWith = (screen: Screen) => {
    const mine = new Set(allOf(screen.spec));
    return SCREENS.filter(s => s !== screen && !s.adminOnly && allOf(s.spec).some(p => mine.has(p)));
};
