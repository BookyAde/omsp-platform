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
    .limit(12);

  if (error || !items || items.length === 0) return null;

  const galleryItems = items as GalleryItem[];
  const featuredItems = galleryItems.filter((item) => item.is_featured);
  const regularItems = galleryItems.filter((item) => !item.is_featured);

  function GalleryCard({ item, large = false }: { item: GalleryItem; large?: boolean }) {
    const photos = getPhotos(item);
    if (photos.length === 0) return null;

    return (
      <article className="overflow-hidden rounded-3xl border border-ocean-700/50 bg-ocean-900/70 shadow-xl shadow-black/10">
        <div
          className={`flex snap-x snap-mandatory overflow-x-auto scroll-smooth bg-ocean-950 ${
            large ? "h-[420px]" : "h-80"
          }`}
        >
          {photos.map((photo, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`relative min-w-full snap-center bg-ocean-950 ${
                large ? "h-[420px]" : "h-80"
              }`}
            >
              <Image
                src={photo}
                alt={`${item.title} photo ${index + 1}`}
                fill
                sizes={large ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                className="object-contain"
              />

              {photos.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-ocean-950/85 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {index + 1} / {photos.length}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4 p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {item.is_featured && (
              <span className="rounded-full bg-teal-400/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-teal-200">
                Featured
              </span>
            )}

            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-teal-300/85">
              {item.category.replace("_", " ")}
            </span>
          </div>

          <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
            {item.title}
          </h3>

          {item.description && (
            <details className="group">
              <summary className="cursor-pointer list-none text-sm leading-7 text-slate-300/80">
                <span className="group-open:hidden">
                  {item.description.length > 150
                    ? `${item.description.slice(0, 150)}... `
                    : item.description}
                  {item.description.length > 150 && (
                    <span className="font-medium text-teal-400">
                      Continue reading
                    </span>
                  )}
                </span>

                <span className="hidden group-open:block">
                  {item.description}
                  <span className="mt-2 block font-medium text-teal-400">
                    Show less
                  </span>
                </span>
              </summary>
            </details>
          )}
        </div>
      </article>
    );
  }

  return (
    <section className="relative overflow-hidden bg-ocean-950 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/40 via-ocean-950 to-ocean-950" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-300/85">
            OMSP Highlights
          </p>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Our Work in Pictures
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300/80">
            See moments from OMSP conferences, field activities, trainings,
            academic engagements and community impact projects.
          </p>
        </div>

        {featuredItems.length > 0 && (
          <div className="mb-12 space-y-6">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
              Featured Updates
            </h3>

            <div className="grid gap-8">
              {featuredItems.map((item) => (
                <GalleryCard key={item.id} item={item} large />
              ))}
            </div>
          </div>
        )}

        {regularItems.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-white">
              Recent Updates
            </h3>

            <div className="grid gap-8 lg:grid-cols-2">
              {regularItems.map((item) => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}