import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '../config/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const state: any = getState();
      const token = state.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'TestId',
    'User',
    'Campaign',
    'Screen',
    'ScreenLog',
    'Offer',
    'SuppressionMapping',
    'SuppressionQueue',
    'ComplainAccount',
    'ComplainFile',
    'Server',
    'DataCount',
    'Dashboard',
    'SmtpDetail',
    'Legacy',
    'Intelligence',
  ],
  endpoints: (builder) => ({

    // â”€â”€â”€ Test IDs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getTestIds: builder.query<any[], void>({
      query: () => '/testids',
      providesTags: ['TestId'],
    }),
    addTestId: builder.mutation({
      query: (newTestId) => ({ url: '/testids', method: 'POST', body: newTestId }),
      invalidatesTags: ['TestId'],
    }),
    updateTestId: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/testids/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: ['TestId'],
    }),
    deleteTestId: builder.mutation({
      query: (id) => ({ url: `/testids/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TestId'],
    }),

    // â”€â”€â”€ SMTP Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getSmtpDetails: builder.query<any[], void>({
      query: () => '/smtp/details',
      providesTags: ['SmtpDetail'],
    }),
    addSmtpDetails: builder.mutation({
      query: (body) => ({ url: '/smtp/details', method: 'POST', body }),
      invalidatesTags: ['SmtpDetail'],
    }),
    deleteSmtpDetails: builder.mutation<void, string>({
      query: (sno) => ({ url: `/smtp/details/${sno}`, method: 'DELETE' }),
      invalidatesTags: ['SmtpDetail'],
    }),

    // â”€â”€â”€ SMTP Tester â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    testSmtp: builder.mutation({
      query: (credentials) => ({ url: '/smtp/test', method: 'POST', body: credentials }),
    }),

    // â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    loginUser: builder.mutation({
      query: (credentials) => ({ url: '/users/login', method: 'POST', body: credentials }),
    }),

    // â”€â”€â”€ Users / Credentials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getUsers: builder.query<any[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    addUser: builder.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // â”€â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getDashboardLogs: builder.query<any[], { from: string; to: string }>({
      query: ({ from, to }) => `/dashboard/logs?from=${from}&to=${to}`,
      providesTags: ['Dashboard'],
    }),
    getDashboardStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    // â”€â”€â”€ Data Count â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // â”€â”€â”€ Data Status & Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    updateDataStatus: builder.mutation({
      query: (body) => ({ url: '/data/status-update', method: 'POST', body }),
    }),
    fetchDataBounce: builder.mutation({
      query: (body) => ({ url: '/data/fetch-bounce', method: 'POST', body }),
    }),
    getDataCount: builder.query<any[], void>({
      query: () => '/data/count',
      providesTags: ['DataCount'],
    }),
    downloadData: builder.mutation({
      query: (body) => ({ url: '/data/download', method: 'POST', body }),
    }),
    uploadData: builder.mutation({
      query: (body) => ({ url: '/data/upload', method: 'POST', body }),
      invalidatesTags: ['DataCount'],
    }),
    getGeneratedFile: builder.mutation({
      query: (body) => ({ url: '/data/get-generated', method: 'POST', body }),
    }),
    getBufferFiles: builder.query<any[], void>({
      query: () => '/data/buffer-files',
      providesTags: ['DataCount'],
    }),
    deleteBufferFile: builder.mutation<void, string>({
      query: (filename) => ({ url: `/data/buffer-files/${filename}`, method: 'DELETE' }),
      invalidatesTags: ['DataCount'],
    }),
    splitData: builder.mutation({
      query: (body) => ({ url: '/data/split', method: 'POST', body }),
      invalidatesTags: ['DataCount'],
    }),
    mergeData: builder.mutation({
      query: (body) => ({ url: '/data/merge', method: 'POST', body }),
      invalidatesTags: ['DataCount'],
    }),
    deleteData: builder.mutation<void, string>({
      query: (filename) => ({ url: `/data/${filename}`, method: 'DELETE' }),
      invalidatesTags: ['DataCount'],
    }),
    getFileInfo: builder.query<any, string>({
      query: (filename) => `/data/file-info/${filename}`,
    }),
    getDataAnalytics: builder.mutation({
      query: (body) => ({ url: '/data/analytics', method: 'POST', body }),
    }),

    // â”€â”€â”€ Campaigns / Email Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getCampaigns: builder.query<any[], void>({
      query: () => '/email/campaigns',
      providesTags: ['Campaign'],
    }),
    getCampaignById: builder.query<any, string>({
      query: (id) => `/email/campaigns/${id}`,
    }),
    sendEmail: builder.mutation({
      query: (payload) => ({ url: '/email/send', method: 'POST', body: payload }),
    }),
    getDefaultIps: builder.query<{ ips: string }, void>({
      query: () => '/email/default-ips',
    }),
    getCampaignLogs: builder.query<any[], string>({
      query: (campaignId) => `/email/logs/${campaignId}`,
      providesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    getPatterns: builder.query<any[], void>({
      query: () => '/email/patterns',
    }),
    validateOffer: builder.query<{ valid: boolean; offer_id?: string }, string>({
      query: (offerId) => `/email/validate-offer/${offerId}`,
    }),

    // â”€â”€â”€ Screens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getScreens: builder.query<any[], void>({
      query: () => '/screens',
      providesTags: ['Screen'],
    }),
    getScreenLogs: builder.query<any[], string>({
      query: (id) => `/screens/${id}/logs`,
      providesTags: (_r, _e, id) => [{ type: 'ScreenLog', id }],
    }),
    getCampaignStats: builder.query<any, string>({
      query: (id) => `/screens/${id}/stats`,
    }),
    stopScreen: builder.mutation<void, string>({
      query: (id) => ({ url: `/screens/${id}/stop`, method: 'PATCH' }),
      invalidatesTags: ['Screen'],
    }),
    deleteScreen: builder.mutation<void, string>({
      query: (id) => ({ url: `/screens/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Screen'],
    }),

    // â”€â”€â”€ Offers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getOffers: builder.query<any[], void>({
      query: () => '/offers',
      providesTags: ['Offer'],
    }),
    createOffer: builder.mutation({
      query: (body) => ({ url: '/offers', method: 'POST', body }),
      invalidatesTags: ['Offer'],
    }),
    updateOffer: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/offers/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Offer'],
    }),
    
    // â”€â”€â”€ Links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getLinks: builder.query<any[], void>({
      query: () => '/links',
      providesTags: ['Legacy'],
    }),
    createLink: builder.mutation({
      query: (body) => ({ url: '/links', method: 'POST', body }),
      invalidatesTags: ['Legacy'],
    }),
    toggleLinkStatus: builder.mutation({
      query: (id) => ({ url: `/links/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Legacy'],
    }),
    updateMainLink: builder.mutation({
      query: ({ id, main_link }) => ({ url: `/links/${id}/main_link`, method: 'PATCH', body: { main_link } }),
      invalidatesTags: ['Legacy'],
    }),
    getLinkReport: builder.query({
      query: (own_offerid) => `/links/${own_offerid}/report`,
      providesTags: ['Legacy'],
    }),

    // â”€â”€â”€ Images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/images/upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),

    // â”€â”€â”€ Suppression â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getSuppressionMappings: builder.query<any[], void>({
      query: () => '/suppression/mappings',
      providesTags: ['SuppressionMapping'],
    }),
    getSuppressionQueue: builder.query<any[], void>({
      query: () => '/suppression/queue',
      providesTags: ['SuppressionQueue'],
    }),
    uploadSuppression: builder.mutation({
      query: (formData) => ({
        url: '/suppression/upload',
        method: 'POST',
        body: formData,
        // Don't set Content-Type â€” browser sets it with boundary for FormData
        formData: true,
      }),
    }),
    getSuppressionComplainersByOffer: builder.query<any[], string>({
      query: (offerId) => `/suppression/complainers/offer/${offerId}`,
      providesTags: (_result, _error, id) => [{ type: 'ComplainAccount', id }],
    }),
    createSuppressionMapping: builder.mutation({
      query: (body) => ({ url: '/suppression/mapping', method: 'POST', body }),
      invalidatesTags: ['SuppressionMapping'],
    }),
    createSuppressionQueue: builder.mutation({
      query: (body) => ({ url: '/suppression/queue', method: 'POST', body }),
      invalidatesTags: ['SuppressionQueue'],
    }),
    deleteSuppressionMapping: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppression/mapping/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SuppressionMapping'],
    }),
    deleteSuppressionQueue: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppression/queue/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SuppressionQueue'],
    }),
    getSuppressionLog: builder.query<{ log: string; status: number }, string>({
      query: (id) => `/suppression/log/${id}`,
    }),
    getSuppressionComplainers: builder.query<any[], void>({
      query: () => '/suppression/complainers',
      providesTags: ['ComplainAccount'],
    }),
    getSuppressionComplainersGrouped: builder.query<any[], void>({
      query: () => '/suppression/complainers/grouped',
      providesTags: ['ComplainAccount'],
    }),
    createSuppressionComplainer: builder.mutation({
      query: (body) => ({ url: '/suppression/complainers', method: 'POST', body }),
      invalidatesTags: ['ComplainAccount'],
    }),
    deleteSuppressionComplainer: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppression/complainers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ComplainAccount'],
    }),

    // â”€â”€â”€ Complain Fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getComplainAccounts: builder.query<any[], void>({
      query: () => '/complain/accounts',
      providesTags: ['ComplainAccount'],
    }),
    getComplainFiles: builder.query<any[], void>({
      query: () => '/complain/files',
      providesTags: ['ComplainFile'],
    }),
    addComplainAccount: builder.mutation({
      query: (body) => ({ url: '/complain/accounts', method: 'POST', body }),
      invalidatesTags: ['ComplainAccount'],
    }),
    updateComplainAccount: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/complain/accounts/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ComplainAccount'],
    }),
    deleteComplainAccount: builder.mutation<void, string>({
      query: (id) => ({ url: `/complain/accounts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ComplainAccount'],
    }),
    fetchComplain: builder.mutation({
      query: (body) => ({ url: '/complain/fetch', method: 'POST', body }),
      invalidatesTags: ['ComplainFile'],
    }),

    // â”€â”€â”€ Server Setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    runServerSetup: builder.mutation({
      query: (config) => ({ url: '/server-setup/setup', method: 'POST', body: config }),
    }),
    getSqlFiles: builder.query<string[], void>({
      query: () => '/server-setup/sql-files',
    }),

    // â”€â”€â”€ Servers Management (Navbar) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getServersManagement: builder.query<any[], void>({
      query: () => '/servers-management',
      providesTags: ['Server'],
    }),
    
    // â”€â”€â”€ Legacy / FSOCK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getLegacyCampaign: builder.query<any, string>({
      query: (id) => `/legacy/campaign/${id}`,
      providesTags: ['Legacy'],
    }),
    sendFsockSmtp: builder.mutation<any, any>({
      query: (payload) => ({ url: '/legacy/fsock-send', method: 'POST', body: payload }),
    }),
    searchLegacyLink: builder.mutation<any, any>({
      query: (payload) => ({ url: '/legacy/campaign-link-search', method: 'POST', body: payload }),
    }),

    // â”€â”€â”€ IMAP Screens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getImapScreens: builder.query<any[], void>({
      query: () => "/imap-screens",
      providesTags: ["Legacy"],
    }),
    getImapLogs: builder.query<{ logs: string }, string>({
      query: (name) => `/imap-screens/logs/${name}`,
    }),
    stopImapScreen: builder.mutation<any, string>({
      query: (name) => ({
        url: `/imap-screens/stop/${name}`,
        method: "POST",
      }),
      invalidatesTags: ["Legacy"],
    }),
    deleteImapScreen: builder.mutation<any, string>({
      query: (name) => ({
        url: `/imap-screens/${name}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Legacy"],
    }),
    createImapScreen: builder.mutation<any, { sno: string }>({
      query: (body) => ({
        url: "/imap-screens/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Legacy"],
    }),

    // â”€â”€â”€ IMAP Mailbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getMailboxEmails: builder.query<string[], void>({
      query: () => "/mailbox/emails",
    }),
    getMailboxData: builder.query<any[], string>({
      query: (email) => `/mailbox/data/${email}`,
    }),

    // â”€â”€â”€ Inbox Intelligence Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    getIntelligenceStats: builder.query<any, void>({
      query: () => '/intelligence/stats',
      providesTags: ['Intelligence'],
    }),
    getIpHealth: builder.query<any[], void>({
      query: () => '/intelligence/ip-health',
      providesTags: ['Intelligence'],
    }),
    getDomainHealth: builder.query<any[], void>({
      query: () => '/intelligence/domain-health',
      providesTags: ['Intelligence'],
    }),

    // ─── Campaign Live Status ─────────────────────────────────────────────────
    getCampaignStatus: builder.query<any, string>({
      query: (id) => `/sendEmail/campaign-status/${id}`,
      providesTags: ['Campaign'],
    }),
  }),
});

export const {
  // TestIds
  useGetTestIdsQuery,
  useAddTestIdMutation,
  useUpdateTestIdMutation,
  useDeleteTestIdMutation,
  // SMTP
  useTestSmtpMutation,
  useGetSmtpDetailsQuery,
  useAddSmtpDetailsMutation,
  useDeleteSmtpDetailsMutation,
  // Auth
  useLoginUserMutation,
  // Users
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Dashboard
  useGetDashboardLogsQuery,
  useGetDashboardStatsQuery,
  // Data Count
  useGetDataCountQuery,
  useDownloadDataMutation,
  useGetGeneratedFileMutation,
  useGetBufferFilesQuery,
  useDeleteBufferFileMutation,
  useUploadDataMutation,
  useSplitDataMutation,
  useMergeDataMutation,
  useDeleteDataMutation,
  useGetFileInfoQuery,
  useLazyGetFileInfoQuery,
  useGetDataAnalyticsMutation,
  useUpdateDataStatusMutation,
  useFetchDataBounceMutation,
  // Campaigns / Email
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetDefaultIpsQuery,
  useSendEmailMutation,
  useGetCampaignLogsQuery,
  useGetPatternsQuery,
  useValidateOfferQuery,
  useLazyValidateOfferQuery,
  // Screens
  useGetScreensQuery,
  useGetScreenLogsQuery,
  useGetCampaignStatsQuery,
  useStopScreenMutation,
  useDeleteScreenMutation,
  // Offers
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  // Links
  useGetLinksQuery,
  useCreateLinkMutation,
  useToggleLinkStatusMutation,
  useUpdateMainLinkMutation,
  useGetLinkReportQuery,
  useLazyGetLinkReportQuery,
  // Images
  useUploadImageMutation,
  // Suppression
  useGetSuppressionMappingsQuery,
  useGetSuppressionQueueQuery,
  useUploadSuppressionMutation,
  useCreateSuppressionMappingMutation,
  useCreateSuppressionQueueMutation,
  useDeleteSuppressionMappingMutation,
  useDeleteSuppressionQueueMutation,
  useGetSuppressionLogQuery,
  useGetSuppressionComplainersGroupedQuery,
  useGetSuppressionComplainersByOfferQuery,
  useCreateSuppressionComplainerMutation,
  useDeleteSuppressionComplainerMutation,
  // Complain
  useGetComplainAccountsQuery,
  useGetComplainFilesQuery,
  useAddComplainAccountMutation,
  useUpdateComplainAccountMutation,
  useDeleteComplainAccountMutation,
  useFetchComplainMutation,
  // Server Setup
  useRunServerSetupMutation,
  useGetSqlFilesQuery,
  // Servers Management
  useGetServersManagementQuery,
  // Legacy
  useGetLegacyCampaignQuery,
  useSendFsockSmtpMutation,
  useSearchLegacyLinkMutation,
  // IMAP Screens
  useGetImapScreensQuery,
  useGetImapLogsQuery,
  useStopImapScreenMutation,
  useDeleteImapScreenMutation,
  useCreateImapScreenMutation,
  // IMAP Mailbox
  useGetMailboxEmailsQuery,
  useGetMailboxDataQuery,
  // Intelligence
  useGetIntelligenceStatsQuery,
  useGetIpHealthQuery,
  useGetDomainHealthQuery,
  // Campaign Live Status
  useGetCampaignStatusQuery,
  useLazyGetCampaignStatusQuery,
} = apiSlice;


