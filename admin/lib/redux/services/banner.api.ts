import { lexerApi } from ".";

export const bannerApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBanners: builder.query<any[], { type?: string }>({
      query: (params) => ({
        url: "/banner",
        method: "GET",
        params,
      }),
      providesTags: ["Banner"],
    }),
    createBanner: builder.mutation<any, FormData>({
      query: (body) => ({
        url: "/banner",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Banner"],
    }),
    updateBanner: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/banner/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
    toggleBanner: builder.mutation<any, string>({
      query: (id) => ({
        url: `/banner/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Banner"],
    }),
    deleteBanner: builder.mutation<any, string>({
      query: (id) => ({
        url: `/banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
