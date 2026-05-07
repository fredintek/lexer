import { lexerApi } from ".";

export const chatApi = lexerApi.injectEndpoints({
  endpoints: (builder) => ({
    // For the Admin: Get the support queue (list of rooms)
    getSupportRooms: builder.query<any[], void>({
      query: () => "/chat/rooms",
      providesTags: ["Chat"],
    }),

    // For the Admin: Get messages for a specific room
    getRoomMessages: builder.query<any[], string>({
      query: (roomId) => `/chat/rooms/${roomId}/messages`,
      providesTags: (result, error, roomId) => [{ type: "Room", id: roomId }],
    }),
  }),
});

export const { useGetSupportRoomsQuery, useGetRoomMessagesQuery } = chatApi;
