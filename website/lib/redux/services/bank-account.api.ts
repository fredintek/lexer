import { apiReducer } from ".";

export const bankAccountApi = apiReducer.injectEndpoints({
  endpoints: (builder) => ({
    getActiveBankAccount: builder.query({
      query: () => "admin/bank-accounts/active",
      providesTags: ["BankAccount"],
    }),
    getBankAccounts: builder.query<any[], void>({
      query: () => "admin/bank-accounts",
      providesTags: ["BankAccount"],
    }),
  }),
});

export const { useGetActiveBankAccountQuery, useGetBankAccountsQuery } =
  bankAccountApi;
