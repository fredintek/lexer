"use client";
import {
  BannerType,
  useGetBannersQuery,
} from "@/lib/redux/services/banner.api";
import BannerSlider from "../BannerSwiper";

const FooterBanner = () => {
  const { data: banners } = useGetBannersQuery(
    { type: BannerType.FOOTER, isActive: true },
    { refetchOnReconnect: true, refetchOnFocus: true },
  );

  if (!(banners?.length > 0)) return null;

  return (
    <section id="hero-banner" className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        <BannerSlider banners={banners} />
      </div>
    </section>
  );
};

export default FooterBanner;
