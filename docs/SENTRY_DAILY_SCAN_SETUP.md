# Sentry Daily Scan Setup

This repository includes a GitHub Actions workflow at `.github/workflows/sentry-daily-scan.yml` that runs once per day and reports the run to a Sentry Cron Monitor.

## What the workflow does

- Runs every day at `14:00 UTC`.
- Supports manual runs through `workflow_dispatch`.
- Installs dependencies with `npm ci`.
- Executes `npm run lint`, `npm run typecheck`, and `npm run build`.
- Wraps the command with `sentry-cli monitors run`, which reports success or failure to Sentry and keeps the monitor schedule in sync.

## Required GitHub secrets

Add these repository secrets before the first scheduled run:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

If any of these are missing, the workflow will fail immediately with a clear error in the Actions log instead of silently skipping monitoring.

## Result in Sentry

The workflow reports to the monitor slug `deadheadclub-daily-scan`.

On the first successful run, Sentry should create or update the monitor using this schedule:

- Cron: `0 14 * * *`
- Timezone: `UTC`

## Notes

- The GitHub Actions schedule is also configured for `14:00 UTC`, which avoids daylight saving drift between GitHub Actions and Sentry.
- If you want a different run time later, update both the GitHub Actions `cron` expression and the monitor schedule flags in the workflow so they stay aligned.
