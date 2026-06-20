// The two research "paths" a teacher can send a student down, plus the
// "unassigned" bucket for students not yet placed. Order matters: it drives
// the card layout on the group-select screen.
export const GROUP_KEYS = ['intervention', 'control', 'unassigned'];

// Visuals + i18n keys for each group. Labels/descriptions resolve via t().
export const GROUP_META = {
  intervention: {
    emoji: '🎮',
    labelKey: 'intervention',
    descKey: 'interventionDesc',
    gradient: 'from-indigo-500 to-sky-500',
    soft: 'bg-pastel-purple',
  },
  control: {
    emoji: '📋',
    labelKey: 'control',
    descKey: 'controlDesc',
    gradient: 'from-slate-500 to-slate-600',
    soft: 'bg-pastel-blue',
  },
  unassigned: {
    emoji: '➕',
    labelKey: 'unassigned',
    descKey: 'unassignedDesc',
    gradient: 'from-amber-400 to-orange-400',
    soft: 'bg-pastel-yellow',
  },
};

// Normalize a raw study_group value (null/'' -> 'unassigned').
export const groupKeyOf = (studyGroup) =>
  studyGroup === 'intervention' || studyGroup === 'control' ? studyGroup : 'unassigned';
