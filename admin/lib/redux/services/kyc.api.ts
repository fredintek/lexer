import { lexerApi } from ".";

export const kycApi = lexerApi.injectEndpoints({
  overrideExisting: true,
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
    adminUpdateKyc: builder.mutation({
      query: (id: string) => ({
        url: `kyc/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["KYC", "User"],
    }),
  }),
});

export const {
  useAdminUpdateKycMutation,
  useGetKYCRequestsQuery,
  useUpdateKYCStatusMutation,
} = kycApi;
