import { apiReducer } from ".";

export const chatApi = apiReducer.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<any[], void>({
      query: () => "/chat/history",
      providesTags: ["Chat"],
    }),
  }),
});

export const { useGetChatHistoryQuery } = chatApi;
