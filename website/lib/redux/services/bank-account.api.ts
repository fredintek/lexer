import { apiReducer } from ".";

export const bankAccountApi = apiReducer.injectEndpoints({
  endpoints: (builder) => ({
    getActiveBankAccount: builder.query({
      query: () => "admin/bank-accounts/active",
      providesTags: ["BankAccount"],
    }),
  }),
});

export const { useGetActiveBankAccountQuery } = bankAccountApi;
