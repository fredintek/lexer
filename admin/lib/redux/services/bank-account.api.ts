import { lexerApi } from ".";

export const bankAccountApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBankAccounts: builder.query<any[], void>({
      query: () => "admin/bank-accounts",
      providesTags: ["BankAccount"],
    }),
    updateBankAccount: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `admin/bank-accounts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["BankAccount"],
    }),
    createBankAccount: builder.mutation<any, any>({
      query: (data) => ({
        url: "admin/bank-accounts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BankAccount"],
    }),
    deleteBankAccount: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/bank-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BankAccount"],
    }),
    activateSingleAccount: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/bank-accounts/${id}/set-active`,
        method: "PATCH",
      }),
      invalidatesTags: ["BankAccount"],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useUpdateBankAccountMutation,
  useCreateBankAccountMutation,
  useDeleteBankAccountMutation,
  useActivateSingleAccountMutation,
} = bankAccountApi;
