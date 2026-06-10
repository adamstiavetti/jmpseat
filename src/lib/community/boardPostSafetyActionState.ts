export const DFW_BASEBOARD_REPORT_STATUS_PARAM = "report";
export const DFW_BASEBOARD_REPORT_REPORTED_STATUS = "dfw_baseboard_post_reported";
export const DFW_BASEBOARD_REPORT_INVALID_STATUS = "dfw_baseboard_report_invalid";
export const DFW_BASEBOARD_REPORT_FAILED_STATUS = "dfw_baseboard_report_failed";

export type DfwBaseboardReportStatus =
  | typeof DFW_BASEBOARD_REPORT_REPORTED_STATUS
  | typeof DFW_BASEBOARD_REPORT_INVALID_STATUS
  | typeof DFW_BASEBOARD_REPORT_FAILED_STATUS;

const dfwBaseboardReportStatuses = new Set<string>([
  DFW_BASEBOARD_REPORT_REPORTED_STATUS,
  DFW_BASEBOARD_REPORT_INVALID_STATUS,
  DFW_BASEBOARD_REPORT_FAILED_STATUS,
]);

export function isDfwBaseboardReportStatus(
  value: string | string[] | undefined,
): value is DfwBaseboardReportStatus {
  return typeof value === "string" && dfwBaseboardReportStatuses.has(value);
}
