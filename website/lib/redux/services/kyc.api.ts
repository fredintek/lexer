import { apiReducer } from ".";

export const kycApi = apiReducer.injectEndpoints({
  endpoints: (builder) => ({
    submitKYC: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: "/kyc/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useSubmitKYCMutation } = kycApi;
