const { Worker } = require("bullmq");
const emailWorker = require("./emailWorker");
const { spaceEmailQueue } = require("./spaceEmailQueue");
const Campaign = require("../models/Campaign");

const spaceEmailWorkerProcessor = async (job) => {
  const { campaign_id, spaceOpts } = job.data;

  // 1. Check if campaign is stopped BEFORE sending
  if (campaign_id) {
    const campaign = await Campaign.findById(campaign_id);
    if (!campaign || campaign.status === "Stopped") {
      console.log(
        `[Space Sending] Campaign ${campaign_id} is stopped. Breaking loop.`,
      );
      return;
    }
  }

  // 2. Process the actual email using the existing robust worker logic
  try {
    await emailWorker(job);
  } catch (err) {
    console.error(`[Space Sending] Error processing email: ${err.message}`);
    // We swallow the error here so the drip feed continues to the next email.
    // emailWorker already increments the error_count and logs it.
  }

  // 3. Queue the next one if it exists
  if (spaceOpts) {
    const nextIndex = spaceOpts.currentIndex + 1;
    const targetEmails = spaceOpts.targetEmails;

    if (nextIndex < targetEmails.length) {
      const nextEmail = targetEmails[nextIndex];
      // Rotate IP if multiple exist
      const nextIpObj = spaceOpts.ipPool[nextIndex % spaceOpts.ipPool.length];

      const nextJobData = {
        ...job.data,
        email: nextEmail,
        mailing_ip: nextIpObj.ip,
        spaceOpts: {
          ...spaceOpts,
          currentIndex: nextIndex,
        },
      };

      // Calculate delay directly from interval_time (in seconds)
      const delayMs = (spaceOpts.interval_time || 60) * 1000;

      console.log(
        `[Space Sending] Queuing next email (${nextIndex + 1}/${targetEmails.length}) for ${nextEmail} in ${delayMs / 1000}s`,
      );

      await spaceEmailQueue.add(
        `space-email-${campaign_id}-${nextIndex}`,
        nextJobData,
        {
          delay: delayMs,
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );
    } else {
      // Reached the end.
      console.log(
        `[Space Sending] Reached end of list for campaign ${campaign_id}. Marking completed.`,
      );
      if (campaign_id) {
        await Campaign.findByIdAndUpdate(campaign_id, {
          status: "Completed",
          end_time: new Date(),
        });
      }
    }
  }
};

module.exports = spaceEmailWorkerProcessor;
