# Finora engineering audit and improvement log — 2026-11-07

## Safety and rollback
- Original `main` commit: `8d12c8462f4791b7a6f39efd19023cfe63d7c385`
- Unchanged recovery branch: `audit/finora-hardening-2026-11-07`
- All subsequent fixes committed directly to `main`. The original commit was not rewritten.

## Changes implemented
- Removed publicly reachable OAuth and SMTP diagnostics.
- Rejected missing production session secrets and removed automatic predictable demo-account setup.
- Strengthened sign-in session reset, Google email verification and email send-result handling.
- Validated transaction amounts/dates, financial numeric inputs and custom hex colors.
- Corrected current-month category budgets and year-crossing goal forecasting.
- Adjusted financial-health savings-rate derivation and avoided claiming fabricated net-worth growth.
- Added an atomic investment-sale API and switched both frontend sale paths to use it.
- Escaped several user-controlled UI labels and replaced autocomplete inline HTML events with DOM event listeners.
- Improved mobile modal sizing and reduced-motion accessibility.
- Added backend regression and investment-sale tests; added a GitHub Actions workflow.
- Removed verbose financial diagnostic console logs.

## Validation limitations
- GitHub Actions runs are currently reporting `failure` with zero job records; they are not evidence of test execution.
- The project was not locally cloned, installed or exercised in a real browser during this work.
- All functional fixes require live runtime verification before production deployment.

## Follow-up items (not yet finished)
1. Resolve GitHub Actions run/startup failure and obtain a green regression suite.
2. Add database migrations with a reviewed baseline; remove import-time `db.create_all()` only once deployment migration paths are proven.
3. Perform dedicated CSRF, session and authorization tests in a deployed staging environment.
4. Normalize financial accounting: opening balances, real asset/liability snapshots, double-counting, income/expense categorization and currency handling.
5. Replace unpinned Tailwind/Lucide CDN dependencies with a reproducible asset build.
6. Expand frontend E2E tests, responsive screenshots and accessibility checks.
7. Improve error recovery and background email delivery with a durable queue.
8. Consider repository-module separation after regression coverage is reliable.

This log distinguishes implemented code changes from verified runtime behavior.
