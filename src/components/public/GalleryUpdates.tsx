import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  image_urls?: string[] | null;
  is_published: boolean;
  is_featured?: boolean;
  created_at: string;
};

function getPhotos(item: GalleryItem) {
  return item.image_urls && item.image_urls.length > 0
    ? item.image_urls
    : item.image_url
    ? [item.image_url]
    : [];
}

export default async function GalleryUpdates() {
  const supabase = await createServerSupabaseClient();

  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !items || items.length === 0) return null;

  const galleryItems = items as GalleryItem[];
  const featuredItems = galleryItems.filter((item) => item.is_featured);
  const regularItems = galleryItems.filter((item) => !item.is_featured);

  const heroItem = featuredItems[0] || galleryItems[0];
  const sideItems = galleryItems
    .filter((item) => item.id !== heroItem.id)
    .slice(0, 2);

  const recentItems = galleryItems
    .filter((item) => item.id !== heroItem.id && !sideItems.some((side) => side.id === item.id))
    .slice(0, 3);

  const heroPhotos = getPhotos(heroItem);

  return (
    <section className="relative overflow-hidden bg-ocean-950 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/40 via-ocean-950 to-ocean-950" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-400">
            OMSP Highlights
          </p>

          <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Our Work in Pictures
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            See moments from OMSP conferences, field activities, trainings,
            academic engagements and community impact projects.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="group overflow-hidden rounded-3xl border border-teal-400/30 bg-ocean-900/80 shadow-2xl shadow-black/20 lg:col-span-2">
            <div className="flex h-[420px] snap-x snap-mandatory overflow-x-auto scroll-smooth">
              {heroPhotos.map((photo, index) => (
                <div
                  key={`${heroItem.id}-${index}`}
                  className="relative h-[420px] min-w-full snap-center bg-ocean-950"
                >
                  <Image
                    src={photo}
                    alt={`${heroItem.title} photo ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    priority={index === 0}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 via-ocean-950/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {heroItem.is_featured && (
                        <span className="rounded-full bg-teal-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean-950">
                          Featured
                        </span>
                      )}

                      {heroPhotos.length > 1 && (
                        <span className="rounded-full bg-ocean-950/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                          {index + 1} / {heroPhotos.length}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                      {heroItem.category.replace("_", " ")}
                    </p>

                    <h3 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                      {heroItem.title}
                    </h3>

                    {heroItem.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                        {heroItem.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            {sideItems.map((item) => {
              const photos = getPhotos(item);
              if (photos.length === 0) return null;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-ocean-700/50 bg-ocean-900/70 shadow-xl shadow-black/10"
                >
                  <div className="relative h-[198px] bg-ocean-950">
                    <Image
                      src={photos[0]}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/85 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {item.is_featured && (
                        <span className="mb-2 inline-flex rounded-full bg-teal-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ocean-950">
                          Featured
                        </span>
                      )}

                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-300">
                        {item.category.replace("_", " ")}
                      </p>

                      <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {recentItems.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {recentItems.map((item) => {
              const photos = getPhotos(item);
              if (photos.length === 0) return null;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-ocean-700/50 bg-ocean-900/60"
                >
                  <div className="flex h-64 snap-x snap-mandatory overflow-x-auto scroll-smooth">
                    {photos.map((photo, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="relative h-64 min-w-full snap-center bg-ocean-950"
                      >
                        <Image
                          src={photo}
                          alt={`${item.title} photo ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/75 via-transparent to-transparent" />

                        {photos.length > 1 && (
                          <span className="absolute bottom-4 right-4 rounded-full bg-ocean-950/85 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                            {index + 1} / {photos.length}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
                      {item.category.replace("_", " ")}
                    </p>

                    <h3 className="line-clamp-2 font-display text-xl font-semibold text-white">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="line-clamp-2 text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}