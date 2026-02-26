import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_BASE_URL from '../config/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const { token } = JSON.parse(userInfo);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        } catch (_) {}
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
  ],
  endpoints: (builder) => ({

    // ─── Test IDs ────────────────────────────────────────────────────────────
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

    // ─── SMTP Details ────────────────────────────────────────────────────────
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

    // ─── SMTP Tester ─────────────────────────────────────────────────────────
    testSmtp: builder.mutation({
      query: (credentials) => ({ url: '/smtp/test', method: 'POST', body: credentials }),
    }),

    // ─── Auth ─────────────────────────────────────────────────────────────────
    loginUser: builder.mutation({
      query: (credentials) => ({ url: '/users/login', method: 'POST', body: credentials }),
    }),

    // ─── Users / Credentials ─────────────────────────────────────────────────
    getUsers: builder.query<any[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // ─── Dashboard ────────────────────────────────────────────────────────────
    getDashboardLogs: builder.query<any[], { from: string; to: string }>({
      query: ({ from, to }) => `/dashboard/logs?from=${from}&to=${to}`,
      providesTags: ['Dashboard'],
    }),
    getDashboardStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    // ─── Data Count ────────────────────────────────────────────────────────────
    // ─── Data Status & Analytics ───────────────────────────────────────────────
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
    getDataAnalytics: builder.mutation({
      query: (body) => ({ url: '/data/analytics', method: 'POST', body }),
    }),

    // ─── Campaigns / Email Interface ──────────────────────────────────────────
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

    // ─── Screens ──────────────────────────────────────────────────────────────
    getScreens: builder.query<any[], void>({
      query: () => '/screens',
      providesTags: ['Screen'],
    }),
    getScreenLogs: builder.query<any[], string>({
      query: (id) => `/screens/${id}/logs`,
      providesTags: (_r, _e, id) => [{ type: 'ScreenLog', id }],
    }),
    stopScreen: builder.mutation<void, string>({
      query: (id) => ({ url: `/screens/${id}/stop`, method: 'PATCH' }),
      invalidatesTags: ['Screen'],
    }),
    deleteScreen: builder.mutation<void, string>({
      query: (id) => ({ url: `/screens/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Screen'],
    }),

    // ─── Offers ───────────────────────────────────────────────────────────────
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
    
    // ─── Links ────────────────────────────────────────────────────────────────
    getLinks: builder.query<any[], void>({
      query: () => '/links',
      providesTags: ['Legacy'],
    }),
    toggleLinkStatus: builder.mutation({
      query: (id) => ({ url: `/links/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Legacy'],
    }),
    updateMainLink: builder.mutation({
      query: ({ id, main_link }) => ({ url: `/links/${id}/main_link`, method: 'PATCH', body: { main_link } }),
      invalidatesTags: ['Legacy'],
    }),

    // ─── Images ───────────────────────────────────────────────────────────────
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/images/upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),

    // ─── Suppression ──────────────────────────────────────────────────────────
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
        // Don't set Content-Type — browser sets it with boundary for FormData
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
    getSuppressionLog: builder.query<string, string>({
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

    // ─── Complain Fetch ───────────────────────────────────────────────────────
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

    // ─── Server Setup ─────────────────────────────────────────────────────────
    runServerSetup: builder.mutation({
      query: (config) => ({ url: '/server-setup/setup', method: 'POST', body: config }),
    }),
    getSqlFiles: builder.query<string[], void>({
      query: () => '/server-setup/sql-files',
    }),

    // ─── Servers Management (Navbar) ──────────────────────────────────────────
    getServersManagement: builder.query<any[], void>({
      query: () => '/servers-management',
      providesTags: ['Server'],
    }),
    
    // ─── Legacy / FSOCK ───────────────────────────────────────────────────────
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

    // ─── IMAP Screens ──────────────────────────────────────────────────────────
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

    // ─── IMAP Mailbox ──────────────────────────────────────────────────────────
    getMailboxEmails: builder.query<string[], void>({
      query: () => "/mailbox/emails",
    }),
    getMailboxData: builder.query<any[], string>({
      query: (email) => `/mailbox/data/${email}`,
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
  useDeleteUserMutation,
  // Dashboard
  useGetDashboardLogsQuery,
  useGetDashboardStatsQuery,
  // Data Count
  useGetDataCountQuery,
  useDownloadDataMutation,
  useUploadDataMutation,
  useSplitDataMutation,
  useMergeDataMutation,
  useDeleteDataMutation,
  useGetDataAnalyticsMutation,
  useUpdateDataStatusMutation,
  useFetchDataBounceMutation,
  // Campaigns / Email
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetDefaultIpsQuery,
  useSendEmailMutation,
  useGetCampaignLogsQuery,
  // Screens
  useGetScreensQuery,
  useGetScreenLogsQuery,
  useStopScreenMutation,
  useDeleteScreenMutation,
  // Offers
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  // Links
  useGetLinksQuery,
  useToggleLinkStatusMutation,
  useUpdateMainLinkMutation,
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
} = apiSlice;
