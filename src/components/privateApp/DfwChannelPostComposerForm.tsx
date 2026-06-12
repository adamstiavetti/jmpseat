"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  type DfwHubChannelPostActionState,
  type DfwHubChannelPostStatus,
  DFW_HUB_CHANNEL_POST_FAILED_STATUS,
  DFW_HUB_CHANNEL_POST_INITIAL_ACTION_STATE,
  DFW_HUB_CHANNEL_POST_INVALID_STATUS,
} from "../../lib/community/hubChannelPostActionState";
import styles from "./homeHubShell.module.css";

type DfwChannelPostComposerFormProps = {
  action: (
    state: DfwHubChannelPostActionState,
    formData: FormData,
  ) => Promise<DfwHubChannelPostActionState>;
  postStatus?: DfwHubChannelPostStatus | null;
};

function getStatusMessage(status: DfwHubChannelPostActionState["status"] | null) {
  if (status === DFW_HUB_CHANNEL_POST_INVALID_STATUS) {
    return "Add a title and body before posting. Titles can be up to 120 characters and posts up to 4,000 characters.";
  }

  if (status === DFW_HUB_CHANNEL_POST_FAILED_STATUS) {
    return "jmpseat could not publish that Channel thread right now. Try again in a moment.";
  }

  return null;
}

export function DfwChannelPostComposerForm({
  action,
  postStatus = null,
}: DfwChannelPostComposerFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    action,
    DFW_HUB_CHANNEL_POST_INITIAL_ACTION_STATE,
  );
  const statusMessage = getStatusMessage(
    state.status === "idle" ? postStatus : state.status,
  );

  useEffect(() => {
    if (state.status === "created" && state.href) {
      router.push(state.href);
    }
  }, [router, state.href, state.status]);

  return (
    <>
      <form
        action={formAction}
        aria-labelledby="channel-composer-title"
        className={styles.baseboardComposer}
      >
        <div>
          <span className={styles.cardMeta}>Start a Thread</span>
          <h3 id="channel-composer-title">Post to this DFW Channel</h3>
          <p>
            Keep it useful, non-sensitive, and specific to this selected
            Channel. Comments and reports are later scoped tickets.
          </p>
        </div>
        <label className={styles.composerField}>
          <span>Title</span>
          <input
            maxLength={120}
            name="title"
            placeholder="Ask a question or share a practical update"
            required
            type="text"
          />
        </label>
        <label className={styles.composerField}>
          <span>Body</span>
          <textarea
            maxLength={4000}
            name="body"
            placeholder="Keep it useful for DFW aviation workers."
            required
            rows={5}
          />
        </label>
        <input name="contentType" type="hidden" value="note" />
        <input name="category" type="hidden" value="general" />
        <button
          className={styles.composerSubmit}
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Publishing..." : "Publish thread"}
        </button>
      </form>

      {statusMessage ? (
        <p className={styles.actionFeedback} role="status">
          {statusMessage}
        </p>
      ) : null}
    </>
  );
}
