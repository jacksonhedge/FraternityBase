import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Chapter', 'Event', 'Partnership', 'Company', 'User'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Chapter endpoints
    getChapters: builder.query({
      query: (filters) => ({
        url: '/chapters',
        params: filters,
      }),
      providesTags: ['Chapter'],
    }),
    getChapterById: builder.query({
      query: (id) => `/chapters/${id}`,
      providesTags: ['Chapter'],
    }),
    getChapterAnalytics: builder.query({
      query: (id) => `/chapters/${id}/analytics`,
      providesTags: ['Chapter'],
    }),

    // Event endpoints
    getEvents: builder.query({
      query: (filters) => ({
        url: '/events',
        params: filters,
      }),
      providesTags: ['Event'],
    }),
    getEventById: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: ['Event'],
    }),

    // Partnership endpoints
    getPartnerships: builder.query({
      query: () => '/partnerships',
      providesTags: ['Partnership'],
    }),
    createPartnership: builder.mutation({
      query: (partnershipData) => ({
        url: '/partnerships',
        method: 'POST',
        body: partnershipData,
      }),
      invalidatesTags: ['Partnership'],
    }),

    // Search endpoints
    searchChapters: builder.query({
      query: (searchParams) => ({
        url: '/search/chapters',
        params: searchParams,
      }),
    }),

    // Saved chapters endpoints
    getSavedChapters: builder.query({
      query: () => '/saved-chapters',
      providesTags: ['Chapter'],
    }),
    saveChapter: builder.mutation({
      query: (chapterId) => ({
        url: `/saved-chapters/${chapterId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Chapter'],
    }),
    unsaveChapter: builder.mutation({
      query: (chapterId) => ({
        url: `/saved-chapters/${chapterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chapter'],
    }),

    // Analytics endpoints
    getDashboardMetrics: builder.query({
      query: () => '/analytics/dashboard',
    }),
    getChapterPerformance: builder.query({
      query: () => '/analytics/chapters',
    }),
    getPartnershipROI: builder.query({
      query: () => '/analytics/partnerships',
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetChaptersQuery,
  useGetChapterByIdQuery,
  useGetChapterAnalyticsQuery,
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetPartnershipsQuery,
  useCreatePartnershipMutation,
  useSearchChaptersQuery,
  useGetSavedChaptersQuery,
  useSaveChapterMutation,
  useUnsaveChapterMutation,
  useGetDashboardMetricsQuery,
  useGetChapterPerformanceQuery,
  useGetPartnershipROIQuery,
} = apiSlice;