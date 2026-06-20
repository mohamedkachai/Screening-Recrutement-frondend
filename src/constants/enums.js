export const ROLES = {
    ADMIN: 'ADMIN',
    HR: 'HR',
    REVIEWER: 'REVIEWER',
    CANDIDATE: 'CANDIDATE',
};

export const ROLE_OPTIONS = [
    { value: ROLES.ADMIN, label: 'Admin' },
    { value: ROLES.HR, label: 'HR' },
    { value: ROLES.REVIEWER, label: 'Reviewer' },
    { value: ROLES.CANDIDATE, label: 'Candidate' },
];

export const ROLE_COLORS = {
    [ROLES.ADMIN]: 'geekblue',
    [ROLES.HR]: 'purple',
    [ROLES.REVIEWER]: 'gold',
    [ROLES.CANDIDATE]: 'green',
};

export const WORK_MODES = {
    REMOTE: 'REMOTE',
    ONSITE: 'ONSITE',
    HYBRID: 'HYBRID',
};

export const WORK_MODE_OPTIONS = [
    { value: WORK_MODES.REMOTE, label: 'Remote' },
    { value: WORK_MODES.ONSITE, label: 'Onsite' },
    { value: WORK_MODES.HYBRID, label: 'Hybrid' },
];

export const OFFER_TYPES = {
    FULL_TIME: 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    INTERNSHIP: 'INTERNSHIP',
    CONTRACT: 'CONTRACT',
};

export const OFFER_TYPE_OPTIONS = [
    { value: OFFER_TYPES.FULL_TIME, label: 'Full-time' },
    { value: OFFER_TYPES.PART_TIME, label: 'Part-time' },
    { value: OFFER_TYPES.INTERNSHIP, label: 'Internship' },
    { value: OFFER_TYPES.CONTRACT, label: 'Contract' },
];

export const OFFER_STATUSES = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
};

export const OFFER_STATUS_OPTIONS = [
    { value: OFFER_STATUSES.DRAFT, label: 'Draft' },
    { value: OFFER_STATUSES.OPEN, label: 'Open' },
    { value: OFFER_STATUSES.CLOSED, label: 'Closed' },
];

export const OFFER_STATUS_COLORS = {
    [OFFER_STATUSES.DRAFT]: 'default',
    [OFFER_STATUSES.OPEN]: 'green',
    [OFFER_STATUSES.CLOSED]: 'red',
};

export const APPLICATION_STATUSES = {
    APPLIED: 'APPLIED',
    INVITED: 'INVITED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    HIRED: 'HIRED',
};

export const APPLICATION_STATUS_OPTIONS = [
    { value: APPLICATION_STATUSES.APPLIED, label: 'Applied' },
    { value: APPLICATION_STATUSES.INVITED, label: 'Invited' },
    { value: APPLICATION_STATUSES.IN_PROGRESS, label: 'In Progress' },
    { value: APPLICATION_STATUSES.COMPLETED, label: 'Completed' },
    { value: APPLICATION_STATUSES.REJECTED, label: 'Rejected' },
    { value: APPLICATION_STATUSES.HIRED, label: 'Hired' },
];

export const APPLICATION_STATUS_COLORS = {
    [APPLICATION_STATUSES.APPLIED]: 'blue',
    [APPLICATION_STATUSES.INVITED]: 'cyan',
    [APPLICATION_STATUSES.IN_PROGRESS]: 'gold',
    [APPLICATION_STATUSES.COMPLETED]: 'geekblue',
    [APPLICATION_STATUSES.REJECTED]: 'red',
    [APPLICATION_STATUSES.HIRED]: 'green',
};

export const QUESTION_TYPES = {
    MCQ_SINGLE: 'MCQ_SINGLE',
    MCQ_MULTI: 'MCQ_MULTI',
    TRUE_FALSE: 'TRUE_FALSE',
    SHORT_TEXT: 'SHORT_TEXT',
    ESSAY: 'ESSAY',
    CODE: 'CODE',
};

export const QUESTION_TYPE_OPTIONS = [
    { value: QUESTION_TYPES.MCQ_SINGLE, label: 'Multiple Choice (single)' },
    { value: QUESTION_TYPES.MCQ_MULTI, label: 'Multiple Choice (multiple)' },
    { value: QUESTION_TYPES.TRUE_FALSE, label: 'True / False' },
    { value: QUESTION_TYPES.SHORT_TEXT, label: 'Short Text (auto-graded)' },
    { value: QUESTION_TYPES.ESSAY, label: 'Essay (manually graded)' },
    { value: QUESTION_TYPES.CODE, label: 'Code (manually graded)' },
];

export const QUESTION_TYPE_LABELS = QUESTION_TYPE_OPTIONS.reduce((acc, o) => {
    acc[o.value] = o.label;
    return acc;
}, {});

export const AUTO_GRADED_QUESTION_TYPES = [
    QUESTION_TYPES.MCQ_SINGLE,
    QUESTION_TYPES.MCQ_MULTI,
    QUESTION_TYPES.TRUE_FALSE,
    QUESTION_TYPES.SHORT_TEXT,
];

export const isAutoGraded = (type) => AUTO_GRADED_QUESTION_TYPES.includes(type);

export const ATTEMPT_STATUSES = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    SUBMITTED: 'SUBMITTED',
    GRADED: 'GRADED',
    EXPIRED: 'EXPIRED',
};

export const ATTEMPT_STATUS_COLORS = {
    [ATTEMPT_STATUSES.NOT_STARTED]: 'default',
    [ATTEMPT_STATUSES.IN_PROGRESS]: 'gold',
    [ATTEMPT_STATUSES.SUBMITTED]: 'blue',
    [ATTEMPT_STATUSES.GRADED]: 'green',
    [ATTEMPT_STATUSES.EXPIRED]: 'red',
};


