# Volunteer interest

The native `/volunteer` page collects interest in future events, not shift bookings.
Navigation and footer links lead to the page. Required fields are name, contact,
experience/interests, and at least one preference: Monitoring, Door,
Setting up/breaking down, or Other. Other requires an explanation. Referral is optional.

## Response destination

[Dyke Night Boston — Volunteer Responses](https://docs.google.com/spreadsheets/d/1AamOD_C2_MlhHNaohWxzWcbcgLrTEIIa445MNi7rYNM/edit)
is owned by `tsurette111@gmail.com`. The `Responses` tab has eight columns;
keep their headers and order intact. A header mismatch blocks delivery rather
than putting answers in the wrong columns. Blank CSV and Excel templates are in
`outputs/volunteer/`. The live spreadsheet was verified to contain no responses
after removing the single synthetic end-to-end test response.

The Google Cloud project is `dnb-volunteer-intake`. The Sheets and IAM APIs are
enabled. The service account is
`volunteer-intake@dnb-volunteer-intake.iam.gserviceaccount.com`.
It has editor access to this spreadsheet and no project-wide IAM role.
The spreadsheet is not public. Creating its permission did not send email.

Google Cloud CLI was installed and authenticated as the owner with
`gcloud auth login tsurette111@gmail.com --enable-gdrive-access --no-activate`.
The account's Drive access was used for setup; the application authenticates as
the dedicated service account and requests only the Sheets scope.

## Server environment

Set these on every hosting environment that should accept volunteer interest:

- `VOLUNTEER_SPREADSHEET_ID`: `1AamOD_C2_MlhHNaohWxzWcbcgLrTEIIa445MNi7rYNM`
- `VOLUNTEER_GOOGLE_CREDENTIALS_JSON`: the service account JSON, as one secret value.

Never prefix these with `NEXT_PUBLIC_`. Local `.env.local` is configured and
Git-ignored. Its JSON value uses **single quotes** around compact JSON so dotenv
preserves escaped newlines in the private key. On the hosting dashboard, paste
the JSON itself without dotenv's outer single quotes. The source key is stored
outside the repository at `~/.config/dnb-volunteer/service-account.json` with
owner-only permissions. Do not upload this key to GitHub, put it in tickets,
or expose it in logs. A Google-hosted runtime can omit the JSON variable and use
Application Default Credentials for this same identity instead.

This change does not deploy the website or install the secrets into a hosting
project. Existing Payload database and secret settings are still required to
render the site's shared footer and layout.

## Delivery and recovery

Next.js server actions provide same-origin protection. Server validation enforces
field lengths, permitted preferences, and the conditional Other answer. A hidden
honeypot rejects basic form bots. This is not a CAPTCHA or distributed rate limiter;
hosting-level rate limits can be added if intake attracts abuse.

Success appears only after Sheets confirms one saved row. Values are appended
with `RAW`, so applicant text cannot execute as spreadsheet formulas. A UUID
reference is written with every response. There is no email notification or
shift assignment.

Failures before writing preserve the form and permit retry. An ambiguous append
or lost server response preserves answers but disables resubmission in the open
form, showing the reference for investigation. Do not tell an applicant to retry
an uncertain delivery until its reference has been checked in column B. This
implementation does not provide cross-request deduplication or a durable retry
queue. Refreshing the page starts a new form.

## Verification

- `pnpm test`: existing phone-announcement integration tests and volunteer tests.
- `pnpm exec tsc --noEmit` and focused ESLint checks.
- Browser checks: desktop and 390px mobile, conditional Other field, missing
  preferences error, preserved answers on unavailable delivery, successful real
  Google save, literal formula-like text, and blank sheet after test cleanup.

References: [Google Sheets append](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append),
[RAW value handling](https://developers.google.com/workspace/sheets/api/reference/rest/v4/ValueInputOption),
[Application Default Credentials](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc).
