# MERN Migration: ESP_Module_fsock_send_smtp_auto → `/fsock-send-smtp-auto`

## Goal

Migrate all features of the PHP `ESP_Module_fsock_send_smtp_auto` ("FAST MAILER Auto") module into the existing MERN stack at route `/fsock-send-smtp-auto`, **without touching any other existing route, controller, model, or service**.

> [!IMPORTANT]
> The existing PHP module continues to operate. This migration creates new MERN-native files only. No existing files are deleted or altered (except the two targeted additions in `App.tsx`, `index.js`, and `apiSlice.ts`).

---

## What Gets Migrated (Feature Map)

| PHP Feature                                     | MERN Equivalent                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `middle_fsock.php` — form + campaign creation   | `FsockAutoSend.tsx` page + `POST /api/fsock-auto/campaign`                       |
| `send_fsock_test.php` — test send               | `fsockAutoWorker.js` (raw-socket send, `test` mode)                              |
| `send_fsock.php` — bulk send                    | `fsockAutoWorker.js` (`bulk` mode)                                               |
| `auto_send.php` — closed-loop automation        | `autoSendWorker.js` BullMQ worker (inbox % guard, retrigger)                     |
| `get_link_fsock.php` — save campaign & get link | `GET /api/fsock-auto/campaign/:id` + campaign saved to `FsockAutoCampaign` model |
| `checkTestMessageResponse.php` — IMAP check     | reuses existing `ImapData` model query                                           |
| `sendTelegramNotification.php` — Telegram       | `telegramService.js` (new isolated service)                                      |
| `Webhook.php` / `webhook_handler/sendgrid.php`  | `POST /api/fsock-auto/webhook/:provider`                                         |
| `Stats.php` — webhook event counts              | `GET /api/fsock-auto/webhook-stats`                                              |
| `parallel_fsock.php` — concurrency              | BullMQ concurrency setting in `autoSendQueue.js`                                 |
| `fsock_functions.php` — randomization helpers   | `fsockHelpers.js` utility module                                                 |
| `DKIM_Add.php` — DKIM signing                   | `dkimService.js` (integrated into worker)                                        |
| `pattern.php` — UI with pattern dropdown        | `FsockAutoSend.tsx` (pattern selector from `CampaignTemplate` model)             |

---

## Proposed Changes

### Backend — New Files

---

#### [NEW] `src/models/FsockAutoCampaign.js`

Dedicated Mongoose model for Auto campaigns (separate from `Campaign.js` to avoid conflicts):

- Fields: `from_email`, `from_name`, `subject`, `subject_enc`, `from_enc`, `headers`, `mailing_ip` (array), `test_emails` (array), `message_html`, `message_plain`, `msgid`, `domain`, `offer_id`, `data_file`, `total_limit`, `send_limit`, `sleep` (seconds), `wait` (seconds), `inbox_percentage`, `test_after`, `status` (enum: Pending/Running/Completed/Stopped/Failed), `total_sent`, `success_count`, `error_count`, `started_at`, `completed_at`, `stop_flag` (Boolean)

---

#### [NEW] `src/services/fsockHelpers.js`

Pure JS port of `fsock_functions.php` — all randomization functions:

- `num(x)`, `smallchar(x)`, `bigchar(x)`, `mixsmallbigchar(x)`, `mixsmallalphanum(x)`, `mixbigalphanum(x)`, `mixall(x)`, `hexdigit(x)`, `RFC_Date_EST()`, `RFC_Date_UTC()`, `RFC_Date_EDT()`, `RFC_Date_IST()`
- `applyPlaceholders(template)` — replaces all `[[funcName(arg)]]` patterns
- `str_to_uue(str)` — UUencode
- `ascii2hex(str)` — Quoted-Printable style

---

#### [NEW] `src/services/dkimService.js`

Functional DKIM signing service using Node's built-in `crypto.sign()`:

- `generateDkimHeader(headers, body, domain, selector, privateKeyPath)` — fixes the PHP bug (simple canonicalization, RSA-SHA256)
- Reads private key from a configurable path (env var `DKIM_PRIVATE_KEY_PATH`)

---

#### [NEW] `src/services/telegramService.js`

Isolated Telegram notification service:

- `sendNotification(campaignId, message)` — re-uses `axios.post` to Telegram Bot API
- Bot token and chat ID read from `.env` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)

---

#### [NEW] `src/queues/autoSendQueue.js`

BullMQ queue definition for the auto-send loop (analogous to `spaceEmailQueue.js`):

- Exports `autoSendQueue`

---

#### [NEW] `src/queues/autoSendWorker.js`

The "brain" worker — a direct migration of `auto_send.php` logic:

1. Pull `FsockAutoCampaign` from DB
2. Validate data file (read from `/var/www/data/` via `fs`)
3. `getRandomIpsAndEmails()` — select ≤3 IPs, ≤2 test emails
4. `sendTestEmails()` — open raw TCP socket (Node `net.Socket`) per the SMTP protocol used by PHP, record `msgid` + `sent_status` in `FsockAutoTestStatus` (see model below)
5. `matchInboxPercentage()` — poll `ImapData` MongoDB model matching message IDs; respect 20-min timeout; re-trigger with a counter (max 3 retries, fixing PHP recursion bug)
6. `sendBulkEmails()` — read + slice data file, launch one BullMQ job per IP (parallel), sleep between batches
7. On guard failure → emit socket log + call `telegramService`
8. On completion → update `FsockAutoCampaign.status = 'Completed'`, call `telegramService`
9. `stop_flag` polling — check DB before each batch (fixes missing stop mechanism)

---

#### [NEW] `src/models/FsockAutoTestStatus.js`

Stores test email send records (replaces `svml.auto_script_test_status` MySQL table):

- Fields: `campaign_id` (ref `FsockAutoCampaign`), `ip`, `email`, `msgid`, `mode`, `sent_status` (Boolean), `status` (INBOX/SPAM/null)

---

#### [NEW] `src/controllers/fsockAutoController.js`

Express controller with these handlers:

- `createCampaign` — validates inputs (mirrors `middle_fsock.php`), validates IPs against `SmtpDetail`, creates `FsockAutoCampaign`, queues `autoSendWorker` job
- `getCampaign` — returns campaign JSON by ID (replaces `get_link_fsock.php` link)
- `stopCampaign` — sets `stop_flag = true` (new feature not in PHP)
- `getCampaignLogs` — returns socket-friendly logs from `FsockAutoCampaign`
- `handleWebhook` — receives SendGrid events, writes to `FsockWebhookEvent` (replaces `webhook_handler/sendgrid.php`)
- `getWebhookStats` — aggregates event counts (replaces `Stats.php`)
- `checkTestStatus` — polls `FsockAutoTestStatus` for a given message ID (replaces `checkTestMessageResponse.php`)

---

#### [NEW] `src/models/FsockWebhookEvent.js`

Stores webhook events (replaces flat `.txt` files):

- Fields: `account`, `event_type`, `email`, `provider`, `timestamp`

---

#### [NEW] `src/routes/fsockAutoRoutes.js`

Express router:

```
POST   /api/fsock-auto/campaign          → createCampaign
GET    /api/fsock-auto/campaign/:id       → getCampaign
POST   /api/fsock-auto/campaign/:id/stop → stopCampaign
GET    /api/fsock-auto/campaign/:id/logs → getCampaignLogs
POST   /api/fsock-auto/webhook/:provider → handleWebhook
GET    /api/fsock-auto/webhook-stats     → getWebhookStats
GET    /api/fsock-auto/test-status       → checkTestStatus
```

---

### Backend — Modified Files

#### [MODIFY] `src/index.js`

Add 3 lines only:

1. `require` + register `autoSendQueue` worker (like `spaceWorker`)
2. `app.use('/api/fsock-auto', require('./routes/fsockAutoRoutes'))`

---

### Frontend — New Files

#### [NEW] `frontend/src/pages/FsockAutoSend.tsx`

Full migration of the PHP UI (analogous to `FsockManual.tsx` but with auto-send controls):

- Same form fields as `FsockManual` (all existing SMTP/headers/subject/body fields)
- **Auto-Send section** (Bulk mode only): `inbox_percentage`, `test_after`, `sleep`, `wait`, `send_limit` fields
- **Send button** → calls `POST /api/fsock-auto/campaign` → receives `campaignId`
- **Live Log panel** → subscribes to `socket.io` room `campaignId`, renders `campaign_log` events (reuses existing socket pattern from `Interface.tsx`)
- **Stop button** → calls `POST /api/fsock-auto/campaign/:id/stop`
- **Get Link button** → copies `?c=campaignId` URL to clipboard
- Pattern selector → fetches patterns from `GET /api/email/patterns` (existing endpoint)

#### [NEW] `frontend/src/pages/FsockAutoSend.css`

Shared styling (reuses `FsockManual.css` class names + adds auto-send panel styles)

---

### Frontend — Modified Files

#### [MODIFY] `frontend/src/App.tsx`

Change line ~383 from:

```tsx
// /fsock-send-smtp-auto renders <FsockManual />
```

to:

```tsx
// /fsock-send-smtp-auto renders <FsockAutoSend />
```

One import added, one `element` prop changed. No other routes modified.

#### [MODIFY] `frontend/src/store/apiSlice.ts`

Add new endpoints under the existing `api` object:

- `createFsockAutoCampaign` mutation
- `getFsockAutoCampaign` query
- `stopFsockAutoCampaign` mutation
- `getFsockAutoTestStatus` query
- `getFsockAutoWebhookStats` query

---

## Verification Plan

### Automated Tests

No existing test suite files found in the project. The following **manual integration tests** cover all features:

### Manual Verification Steps

**Step 1 — Backend boots without errors**

```
cd d:\MailSenderLive\mailsender
npm run start
```

Check terminal: no `Error` or `Cannot find module` messages. Server starts on port 5000.

**Step 2 — Route is reachable**

```
curl -X POST http://localhost:5000/api/fsock-auto/campaign \
  -H "Content-Type: application/json" \
  -d '{"from_email":"test@test.com","subject":"hello","from":"Test","mailing_ip":"1.2.3.4","test_emails":["a@b.com"],"headers":"","message_html":"<p>hi</p>","message_plain":"hi","domain":"test.com","offer_id":"1","data_file":"test.txt","total_limit":10,"send_limit":5,"mode":"Test"}'
```

Expected: `201` with `{ campaignId: "..." }`

**Step 3 — Frontend route navigation**
Open `http://localhost:3000/fsock-send-smtp-auto` in browser. Expected: `FsockAutoSend` page renders (not the old FsockManual page). All existing routes (`/interface`, `/fsock-manual`, `/screen`, etc.) still render correctly.

**Step 4 — Test send flow (manual)**

1. Navigate to `/fsock-send-smtp-auto`
2. Fill in a valid SMTP IP (one that exists in SmtpDetails), from email, subject, test email, HTML body
3. Set Mode = Test, click Send
4. Log panel shows: "Sending Test Email..." then "Test Email Sent Successfully" or auth error

**Step 5 — Stop campaign**

1. Start a Bulk campaign via the UI
2. Click Stop button
3. DB: `FsockAutoCampaign.stop_flag = true`, worker halts before next batch

**Step 6 — Other routes unaffected**
Navigate to `/interface`, `/fsock-manual`, `/screen`, `/testids-screen`, `/smtp`. Confirm each renders without error.
