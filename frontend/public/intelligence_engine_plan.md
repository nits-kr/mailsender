# Inbox Intelligence Engine Implementation Plan

Goal: Build an enterprise-grade automated system that monitors deliverability (Inbox, Spam, Missing), tracks provider IP/Domain reputation, and dynamically pauses or adjusts active campaigns to protect infrastructure.

## Phase 1: Engine Foundation & Database Architecture

We will need new MongoDB collections to store the intelligence metrics over time without polluting the existing generic Campaign schemas.

### [NEW] `src/models/IntelligenceLog.js`

Stores continuous testing results for individual test emails.

- `campaignId`: Reference to Campaign
- `provider`: String ("gmail", "yahoo", "outlook", etc.)
- `location`: String ("inbox", "spam", "missing")
- `timestamp`: Date

### [NEW] `src/models/ReputationScore.js`

Tracks the sliding-window health of specific assets.

- `assetType`: "ip" | "domain"
- `assetValue`: String (e.g. "192.168.1.1" or "example.com")
- `inboxScore`: Number (0-100)
- `bounceRate`: Number
- `complaintRate`: Number
- `isRecoveryMode`: Boolean
- `status`: "healthy" | "risky" | "paused"

## Phase 2: Monitoring Daemons & Connectors

### [NEW] `src/services/intelligence/InboxMonitor.js`

- Connect via IMAP to designated test webmail accounts (`test1@gmail.com`, etc.).
- Poll every 60 seconds (using `node-cron` or `setInterval` worker).
- Match received emails to Campaign IDs (using hidden headers or SVML ID trackers).
- Log placement metrics (Inbox/Spam) to `IntelligenceLog`.

### [NEW] `src/services/intelligence/BounceComplaintMonitor.js`

- Set up a Feedback Loop (FBL) webhook or parse hard-bounces from Return-Path mailboxes.
- Calculate `bounce_rate` and `complaint_rate` on the fly.

## Phase 3: The Intelligence Algorithm Layer

### [NEW] `src/services/intelligence/DecisionEngine.js`

Runs continuously against live outbound queues.

1. **Calculate Inbox Placement Score**: Compute `(inbox/total) * 100` per provider.
2. **Auto Campaign Pause**: If aggregate `inbox_score < 50%` OR `bounce_rate > 5%` OR `complaint_rate > 0.1%`, flag `Campaign` as `paused` with `reason = inbox_failure/high_bounce` and emit admin alerts via sockets/email.
3. **Smart IP Switching & Weighted Routing**: Weight IP usage by their respective `inbox_score`. Deprioritize failing IPs dynamically.
4. **Adaptive Speed & Routing**: Alter queue throughput speeds using provider logic (e.g., slow down Yahoo batch size if score dips).
5. **Auto Domain Warmup Manager**: Apply sending caps to fresh domains based on the day (Day 1: 50, Day 2: 100...).

## Phase 4: Extremely Powerful Infrastructure Features

### 1. AI Content & Image Polymorphism

- Automatically alter the MD5/SHA256 hash of all images in a campaign by injecting invisible pixel-level noise.
- This prevents global spam filters from fingerprinting your content based on image signatures.

### 2. Intelligent Domain Auto-Rotation

- If a domain's `inbox_score` drops below 40%, the system automatically pause-and-swaps the domain for a fresh one from the verified pool without interrupting the campaign.

### 3. Automated DNS & IP Health Recovery

- The engine will periodically perform `nslookup` and `ptr` checks for all active IPs.
- If a rDNS mismatch is detected, the engine can execute pre-configured SSH scripts to repair the hostname settings on the target server.

## Phase 5: UI / Dashboards

### [NEW] `frontend/src/pages/IntelligenceDashboard.tsx`

- A real-time control center showing live analytics.
- Visual gauges for global `inbox_rate`, `bounce_rate`.
- Tables showing `ip_health` and `domain_health`.
- Manual overrides for the Recovery Mode or Warmup Engine schedules.

## Verification Plan

### Automated/Unit Tests

- Write Jest suites targeting the `DecisionEngine` maths (ensuring a 40% inbox placement actively triggers the pause state logic).
- Mock IMAP inbox parsing to ensure accurate `inbox/spam` categorization without hitting real APIs during dev.

### Manual Verification

1. Launch a test campaign with an attached test monitor target.
2. Manually inject "Spam" logs into the db to simulate a failure wave.
3. Visually confirm the Engine automatically halts the campaign processing in the UI.
4. Verify the Dashboard outputs reflect the simulated drop accurately.
