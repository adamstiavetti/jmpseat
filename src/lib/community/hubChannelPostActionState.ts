export const DFW_HUB_CHANNEL_POST_STATUS_PARAM = "post";
export const DFW_HUB_CHANNEL_POST_INVALID_STATUS = "dfw_channel_post_invalid";
export const DFW_HUB_CHANNEL_POST_FAILED_STATUS = "dfw_channel_post_failed";
export const DFW_HUB_CHANNEL_REPORT_STATUS_PARAM = "report";
export const DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS = "dfw_channel_post_reported";
export const DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS =
  "dfw_channel_post_already_reported";
export const DFW_HUB_CHANNEL_REPORT_INVALID_STATUS = "dfw_channel_report_invalid";
export const DFW_HUB_CHANNEL_REPORT_FAILED_STATUS = "dfw_channel_report_failed";

export type DfwHubChannelPostStatus =
  | typeof DFW_HUB_CHANNEL_POST_INVALID_STATUS
  | typeof DFW_HUB_CHANNEL_POST_FAILED_STATUS;

export type DfwHubChannelReportStatus =
  | typeof DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS
  | typeof DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS
  | typeof DFW_HUB_CHANNEL_REPORT_INVALID_STATUS
  | typeof DFW_HUB_CHANNEL_REPORT_FAILED_STATUS;

export type DfwHubChannelPostActionState =
  | {
      status: "idle";
      href: null;
    }
  | {
      status: "created";
      href: string;
    }
  | {
      status: DfwHubChannelPostStatus;
      href: null;
    };

export const DFW_HUB_CHANNEL_POST_INITIAL_ACTION_STATE: DfwHubChannelPostActionState = {
  status: "idle",
  href: null,
};

const dfwHubChannelReportStatuses = new Set<string>([
  DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS,
  DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS,
  DFW_HUB_CHANNEL_REPORT_INVALID_STATUS,
  DFW_HUB_CHANNEL_REPORT_FAILED_STATUS,
]);

export function isDfwHubChannelReportStatus(
  value: string | string[] | undefined,
): value is DfwHubChannelReportStatus {
  return typeof value === "string" && dfwHubChannelReportStatuses.has(value);
}
