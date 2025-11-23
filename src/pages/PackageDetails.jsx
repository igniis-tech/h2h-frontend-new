import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { request, formatINR } from "../api/client";
import Reveal from "../components/common/Reveal";

export default function PackageDetails() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const response = await request("/packages");
        const packages = Array.isArray(response) ? response : response?.packages || response?.data?.packages || response?.results || [];
        const packageItem = packages.find(pkg => pkg.id === parseInt(id));
        setPackageData(packageItem ? normalizePackageItems(packageItem) : null);
      } catch (err) {
        console.error("Failed to fetch package details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  const nextImage = () => {
    if (packageData?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % packageData.images.length);
    }
  };

  const prevImage = () => {
    if (packageData?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + packageData.images.length) % packageData.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-slate-700 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-slate-700 rounded w-2/3"></div>
                <div className="h-12 bg-slate-700 rounded w-1/2"></div>
                <div className="h-32 bg-slate-700 rounded"></div>
                <div className="h-16 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-forest mb-4">Package Not Found</h1>
          <p className="text-forest/70 mb-8">The package you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const features = packageData._items || [];

  return (
    <div className="min-h-screen bg-offwhite py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Reveal variant="fade-up">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-earthy hover:text-primary transition-colors mb-8"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <Reveal variant="fade-up" delay={200}>
            <div className="relative">
              {packageData.images?.length > 0 ? (
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-forest/5">
                  <div className="aspect-square relative">
                    <img
                      src={packageData.images[currentImageIndex]?.image_url}
                      alt={packageData.images[currentImageIndex]?.caption || packageData.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {packageData.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white transition-colors shadow-lg"
                        >
                          <span className="material-symbols-outlined text-forest text-lg sm:text-xl">chevron_left</span>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white transition-colors shadow-lg"
                        >
                          <span className="material-symbols-outlined text-forest text-lg sm:text-xl">chevron_right</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Image Counter */}
                  {packageData.images.length > 1 && (
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {currentImageIndex + 1} / {packageData.images.length}
                    </div>
                  )}

                  {/* Image Caption */}
                  {packageData.images[currentImageIndex]?.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm">
                        {packageData.images[currentImageIndex].caption}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-forest/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-forest/30 text-4xl sm:text-6xl mb-4">home</span>
                    <p className="text-forest/50 text-sm sm:text-base">No images available</p>
                  </div>
                </div>
              )}

              {/* Thumbnail Strip */}
              {packageData.images?.length > 1 && (
                <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2">
                  {packageData.images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary shadow-lg"
                          : "border-transparent hover:border-earthy/30"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Package Information */}
          <div className="space-y-8">
            {/* Header */}
            <Reveal variant="fade-up" delay={300}>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-forest mb-4">
                  {packageData.name} Package
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-earthy text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg sm:text-xl">location_on</span>
                    <span>Purulia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg sm:text-xl">event</span>
                    <span>Jan 24-26, 2026</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Price */}
            <Reveal variant="fade-up" delay={400}>
              <div className="bg-gradient-to-r from-primary/10 to-earthy/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/20">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">
                    {formatINR(packageData.price_inr)}
                  </span>
                  <span className="text-earthy/70 text-sm sm:text-base">per person</span>
                </div>
                {packageData.promo_active && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="material-symbols-outlined text-base">star</span>
                    Promo Available
                  </div>
                )}
              </div>
            </Reveal>

            {/* Features */}
            <Reveal variant="fade-up" delay={500}>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-forest mb-4 sm:mb-6">What's Included</h2>
                <div className="space-y-2 sm:space-y-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 sm:p-4 rounded-lg hover:bg-forest/5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-emerald-600 text-lg sm:text-xl flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-forest/80 leading-relaxed text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Accommodation Type */}
            {packageData.allowed_unit_types?.length > 0 && (
              <Reveal variant="fade-up" delay={600}>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-forest mb-4 sm:mb-6">Accommodation Type</h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {packageData.allowed_unit_types.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center gap-2 bg-earthy/10 px-3 sm:px-4 py-2 rounded-lg border border-earthy/20"
                      >
                        <span className="material-symbols-outlined text-earthy text-sm sm:text-base">home</span>
                        <span className="font-medium text-earthy text-sm sm:text-base">{type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Child Policy */}
            <Reveal variant="fade-up" delay={700}>
              <div className="bg-forest/5 rounded-xl p-4 sm:p-6">
                <h3 className="font-bold text-forest mb-3 text-lg sm:text-xl">Child Policy</h3>
                <div className="space-y-2 text-forest/80 text-sm sm:text-base">
                  <p>• Children under {packageData.child_free_max_age} years: Free</p>
                  <p>• Children between {packageData.child_free_max_age + 1}-{packageData.child_half_max_age} years: 50% charge</p>
                  <p>• Children above {packageData.child_half_max_age} years: Full charge</p>
                </div>
              </div>
            </Reveal>

            {/* Book Now Button */}
            <Reveal variant="fade-up" delay={800}>
              <Link
                to={`/register?pkg=${packageData.id}`}
                state={{ pkgId: String(packageData.id) }}
                className="block w-full bg-primary text-white text-center py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Book Now - {formatINR(packageData.price_inr)}
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Convert mixed data (string with semicolons / bullets or array) into a clean items array */
function normalizePackageItems(p) {
  let items = [];

  if (Array.isArray(p.items) && p.items.length) {
    items = p.items;
  } else {
    const text =
      (typeof p.description === "string" && p.description) ||
      (typeof p.details === "string" && p.details) ||
      "";
    // Split on semicolons, bullets, or newlines. (Don't split by comma—keeps phrases like "Pick up & Drop".)
    items = text
      .split(/[;\n\r•]+/g)
      .map((s) =>
        String(s)
          .replace(/^[\s\-–—•]+/, "")
          .replace(/[.;,\s]+$/g, "")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean);
  }

  return { ...p, _items: items };
}
