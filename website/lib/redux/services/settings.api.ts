import { apiReducer } from ".";

export const settingsApi = apiReducer.injectEndpoints({
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
  }),
});

export const { useGetSettingsByGroupQuery, useGetAllSettingsQuery } =
  settingsApi;
