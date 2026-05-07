import { apiReducer } from ".";

export enum BannerType {
  HERO = "hero",
  FOOTER = "footer",
}

export const bannerApi = apiReducer.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<any, { type: BannerType; isActive?: boolean }>({
      query: (params) => ({
        url: "/banner",
        params,
        method: "GET",
      }),
      providesTags: ["BANNER"],
    }),
  }),
});

export const { useGetBannersQuery } = bannerApi;
