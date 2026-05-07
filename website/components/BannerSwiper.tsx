"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Image from "next/image";
import { BannerType } from "@/lib/redux/services/banner.api";

interface Banner {
  createdAt: string;
  updatedAt: string;
  id: string;
  image: { publicId: string; url: string };
  isActive: boolean;
  link?: string;
  title: string;
  description?: string;
  order: number;
  type: BannerType;
}

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="mb-12 w-full">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="rounded-4xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative aspect-21/9 md:aspect-25/11 w-full overflow-hidden bg-slate-900">
              {/* Image with overlay */}
              <Image
                src={banner?.image?.url}
                alt={banner.title || "Promotion"}
                fill
                className="object-cover opacity-80"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-12 md:px-20">
                <div className="max-w-xl animate-in slide-in-from-left duration-700">
                  <span className="text-brand text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">
                    Exclusive Update
                  </span>
                  <h3 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                    {banner.title}
                  </h3>
                  {banner?.description && (
                    <p className="text-slate-300 text-sm md:text-base font-medium mb-6 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                  {banner.link && (
                    <a
                      href={banner.link}
                      className="px-8 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform inline-block"
                    >
                      Explore Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
