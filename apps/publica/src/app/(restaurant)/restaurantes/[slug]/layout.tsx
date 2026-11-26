import { RestaurantNavigation } from "@/components/layout/RestaurantNavigation";
import { demoRestaurantSlug } from "@/config/routes";
import { dataServices } from "@/lib/data-services";

export const dynamicParams = false;

export async function generateStaticParams() {
  const restaurants = await dataServices.restaurants.list();

  return [...restaurants.map(({ slug }) => ({ slug })), { slug: demoRestaurantSlug }];
}

export default async function RestaurantLayout({
  children,
  params,
}: LayoutProps<"/restaurantes/[slug]">) {
  const { slug: segment } = await params;
  const slug = decodeURIComponent(segment);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header><RestaurantNavigation slug={slug} /></header>
      {children}
    </div>
  );
}
