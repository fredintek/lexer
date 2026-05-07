import { lexerApi } from ".";

export const emailApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sendBroadcast: builder.mutation<
      any,
      {
        mode: "single" | "multiple" | "all";
        userIds?: string[];
        subject: string;
        message: string;
      }
    >({
      query: (body) => ({
        url: "/email/broadcast",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendBroadcastMutation } = emailApi;
