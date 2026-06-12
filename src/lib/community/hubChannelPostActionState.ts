export const DFW_HUB_CHANNEL_POST_STATUS_PARAM = "post";
export const DFW_HUB_CHANNEL_POST_INVALID_STATUS = "dfw_channel_post_invalid";
export const DFW_HUB_CHANNEL_POST_FAILED_STATUS = "dfw_channel_post_failed";

export type DfwHubChannelPostStatus =
  | typeof DFW_HUB_CHANNEL_POST_INVALID_STATUS
  | typeof DFW_HUB_CHANNEL_POST_FAILED_STATUS;

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
