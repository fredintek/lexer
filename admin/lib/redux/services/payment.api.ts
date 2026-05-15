import { lexerApi } from ".";

export const paymentMethodApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPaymentMethodsByUserId: builder.query<any[], string>({
      query: (userId) => `/payment/user/${userId}`,
      providesTags: ["PAYMENTS"],
    }),
  }),
});

export const { useGetPaymentMethodsByUserIdQuery } = paymentMethodApi;
