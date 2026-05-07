import { lexerApi } from ".";

export const settingsApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllSettings: builder.query({
      query: () => "/settings/all",
      providesTags: ["SETTINGS"],
    }),
    getSettingsByGroup: builder.query<Record<string, string>, string>({
      query: (group) => `/settings/group/${group}`,
      providesTags: ["SETTINGS"],
    }),

    updateSettings: builder.mutation({
      query: (body) => ({
        url: "/settings/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SETTINGS"],
    }),
  }),
});

export const {
  useGetSettingsByGroupQuery,
  useGetAllSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi;
