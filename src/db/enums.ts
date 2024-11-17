export const USER_STATUS = {
    ACTIVE: "ACTIVE",
    NOT_ACTIVE: "NOT_ACTIVE"
} as const;
export type USER_STATUS = (typeof USER_STATUS)[keyof typeof USER_STATUS];
