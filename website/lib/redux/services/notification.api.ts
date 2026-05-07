import { apiReducer } from ".";
import toast from "react-hot-toast";

export const notificationApi = apiReducer.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any[], void>({
      query: () => "/notification",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Notifications" as const,
                id,
              })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),
    markAsRead: builder.mutation<void, { id?: string }>({
      query: (body) => ({
        url: body.id ? `/notification/${body.id}/read` : "/notification/read",
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
    updateFcmToken: builder.mutation<void, { token: string }>({
      query: (body) => ({
        url: "/user/fcm-token",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateNotificationSettings: builder.mutation<
      any,
      { pushEnabled?: boolean; emailEnabled?: boolean }
    >({
      query: (settings) => ({
        url: "/notification/settings",
        method: "PATCH",
        body: settings,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Notification preferences updated");
        } catch {
          toast.error("Failed to update preferences");
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useUpdateFcmTokenMutation,
  useUpdateNotificationSettingsMutation,
} = notificationApi;
