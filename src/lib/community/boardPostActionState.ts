export const DFW_BASEBOARD_POST_STATUS_PARAM = "post";
export const DFW_BASEBOARD_POST_CREATED_STATUS = "dfw_baseboard_post_created";
export const DFW_BASEBOARD_POST_INVALID_STATUS = "dfw_baseboard_post_invalid";
export const DFW_BASEBOARD_POST_FAILED_STATUS = "dfw_baseboard_post_failed";

export type DfwBaseboardPostStatus =
  | typeof DFW_BASEBOARD_POST_CREATED_STATUS
  | typeof DFW_BASEBOARD_POST_INVALID_STATUS
  | typeof DFW_BASEBOARD_POST_FAILED_STATUS;

const dfwBaseboardPostStatuses = new Set<string>([
  DFW_BASEBOARD_POST_CREATED_STATUS,
  DFW_BASEBOARD_POST_INVALID_STATUS,
  DFW_BASEBOARD_POST_FAILED_STATUS,
]);

export function isDfwBaseboardPostStatus(
  value: string | string[] | undefined,
): value is DfwBaseboardPostStatus {
  return typeof value === "string" && dfwBaseboardPostStatuses.has(value);
}
