const { z } = require("zod");

const userLoginSchema = z.object({
  uemail: z.string().email(),
  password: z.string().min(1),
});

const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  designation: z.string().min(1),
  status: z.string().optional(),
  header_acces: z.string().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  status: z.string().optional(),
  header_acces: z.string().optional(),
});

const sendEmailSchema = z.object({
  from_email: z.string().email(),
  mailing_ip: z.string().min(1),
  sub: z.string().min(1),
  body: z.object({
    html: z.string().optional(),
    plain: z.string().optional(),
  }),
  emails: z.string().min(1),
  mode: z.enum(["Test", "Bulk"]),
});

const addOfferSchema = z.object({
  affiliate: z.string().min(1),
  offer_name: z.string().min(1),
  offer_id: z.string().min(1),
  payout: z.string().optional(),
  sub_url: z.string().optional().or(z.literal("")),
  unsub_url: z.string().optional().or(z.literal("")),
  open_url: z.string().optional().or(z.literal("")),
  opt_out_url: z.string().optional().or(z.literal("")),
  sensitive: z.string().optional().or(z.literal("")),
  from_name: z.string().optional().or(z.literal("")),
  subject: z.string().optional().or(z.literal("")),
  restrictions: z.string().optional().or(z.literal("")),
});

const serverSetupSchema = z.object({
  ip: z.string().min(1),
  pass: z.string().min(1),
  dev_name: z.string().optional(),
  ips_text: z.string().optional(),
  tunnel_ips: z.string().optional(),
  config_ips: z.string().optional(),
  shared_pool_ip: z.string().optional(),
  assigned_to: z.string().optional(),
  sql_file: z.string().optional(),
  type: z.string().optional(),
  mode: z.enum(["install", "remove"]).optional(),
  actions: z.object({}).catchall(z.any()).optional(),
});

module.exports = {
  userLoginSchema,
  userCreateSchema,
  userUpdateSchema,
  sendEmailSchema,
  addOfferSchema,
  serverSetupSchema,
};
