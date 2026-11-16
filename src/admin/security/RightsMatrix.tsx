import { useMemo } from 'react';
import { Segmented, Tag, Tooltip, Typography } from 'antd';
import { LinkOutlined, LockOutlined } from '@ant-design/icons';
import { LEVELS, levelOf, levelsOf, SECTIONS, setLevel, sharedWith, type Level, type Screen } from './screens';

const ORDER: Level[] = ['none', 'view', 'edit', 'full'];
const clamp = (screen: Screen, level: Level): Level => {
    const avail = levelsOf(screen.spec);
    for (let i = ORDER.indexOf(level); i >= 0; i -= 1) if (avail.includes(ORDER[i])) return ORDER[i];
    return 'none';
};
const LEVEL_COLOR: Record<Level, string> = { none: 'default', view: 'blue', edit: 'gold', full: 'green' };

/**
 * Screen rights matrix: one row per screen (with its security code), grouped by menu section.
 * Each section can be set in one go; each screen can be set on its own.
 */
export default function RightsMatrix({ value = [], onChange, disabled }: { value?: string[]; onChange?: (perms: string[]) => void; disabled?: boolean }) {
    const perms = useMemo(() => new Set(value), [value]);
    const set = (screen: Screen, level: Level) => onChange?.(setLevel(screen, value, level));
    const setSection = (screens: Screen[], level: Level) => {
        let next = value;
        // Clear the whole section first so shared permissions do not keep a screen open.
        for (const s of screens) next = setLevel(s, next, 'none');
        if (level !== 'none') for (const s of screens) next = setLevel(s, next, clamp(s, level));
        onChange?.(next);
    };
    return (
        <div className="rounded-xl border border-admin-border overflow-hidden">
            {SECTIONS.map((section) => {
                const levels = section.screens.map(s => levelOf(s, perms));
                const same = levels.every(l => l === levels[0]) ? levels[0] : null;
                const open = levels.filter(l => l !== 'none').length;
                return (
                    <div key={section.title} className="border-b border-admin-border last:border-b-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-admin-hover">
                            <span className="font-semibold">{section.title} <Typography.Text type="secondary" className="font-normal text-xs">{section.adminOnly ? '' : `${open}/${section.screens.length} screens`}</Typography.Text></span>
                            {section.adminOnly
                                ? <Tag icon={<LockOutlined />} className="m-0">Administrators only</Tag>
                                : (
                                    <Segmented size="small" disabled={disabled} value={same ?? 'mixed'}
                                        onChange={(l) => l !== 'mixed' && setSection(section.screens, l as Level)}
                                        options={[...LEVELS.map(l => ({ value: l.value, label: l.label })), ...(same ? [] : [{ value: 'mixed', label: 'Mixed', disabled: true }])]} />
                                )}
                        </div>
                        {!section.adminOnly && section.screens.map((s, i) => {
                            const shared = sharedWith(s).filter(x => x.section !== s.section || true).filter(x => x !== s);
                            const avail = levelsOf(s.spec);
                            return (
                                <div key={s.code} className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-t border-admin-border">
                                    <span className="flex items-center gap-2 min-w-0">
                                        <code className="text-xs px-1.5 py-0.5 rounded bg-admin-hover">{s.code}</code>
                                        <span>{s.label}</span>
                                        {shared.length > 0 && (
                                            <Tooltip title={`Uses the same rights as: ${shared.slice(0, 8).map(x => `${x.code} ${x.label}`).join(', ')}${shared.length > 8 ? '…' : ''}. Changing one changes them together.`}>
                                                <LinkOutlined className="text-admin-muted" />
                                            </Tooltip>
                                        )}
                                    </span>
                                    <Segmented size="small" disabled={disabled} value={levels[i]} onChange={(l) => set(s, l as Level)}
                                        options={LEVELS.map(l => ({ value: l.value, label: l.label, disabled: !avail.includes(l.value) }))} />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

export const LevelTag = ({ level }: { level: Level }) => <Tag color={LEVEL_COLOR[level]} className="m-0">{LEVELS.find(l => l.value === level)?.label}</Tag>;
