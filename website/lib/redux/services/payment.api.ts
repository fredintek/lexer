import { apiReducer } from ".";

export const paymentApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<any[], void>({
      query: () => "/payment",
      providesTags: ["PaymentMethods"],
    }),
    addPaymentMethod: builder.mutation({
      query: (body) => ({
        url: "/payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    setPrimaryMethod: builder.mutation({
      query: (id: string) => ({
        url: `/payment/${id}/primary`,
        method: "PATCH",
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    deletePaymentMethod: builder.mutation({
      query: (id: string) => ({
        url: `/payment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useSetPrimaryMethodMutation,
  useDeletePaymentMethodMutation,
} = paymentApi;
