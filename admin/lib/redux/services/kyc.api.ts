import { lexerApi } from ".";

export const kycApi = lexerApi.injectEndpoints({
  endpoints: (builder) => ({
    getKYCRequests: builder.query<
      any[],
      {
        search?: string;
        limit?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/kyc",
        method: "GET",
        params,
      }),
      providesTags: ["KYC"],
    }),
    updateKYCStatus: builder.mutation<
      void,
      { id: string; status: string; rejectionReason?: string; adminId: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/kyc/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["KYC", "User"],
    }),
  }),
});

export const { useGetKYCRequestsQuery, useUpdateKYCStatusMutation } = kycApi;
