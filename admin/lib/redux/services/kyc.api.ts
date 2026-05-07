import { lexerApi } from ".";

export const kycApi = lexerApi.injectEndpoints({
  endpoints: (builder) => ({
    getKYCRequests: builder.query<any[], { search?: string; limit?: number }>({
      query: (params) => ({
        url: "/kyc",
        method: "GET",
        params,
      }),
      providesTags: ["KYC"],
    }),
    updateKYCStatus: builder.mutation<
      void,
      { id: string; status: string; rejectionReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/kyc/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["KYC"],
    }),
  }),
});

export const { useGetKYCRequestsQuery, useUpdateKYCStatusMutation } = kycApi;
