import client from "@/lib/graphql/client";
import { GET_MENU_BY_SLUG } from "@/lib/graphql/queries/getMenuBySlug";

interface PageProps {
  params: { slug: string };
}

export default async function MenuDetailPage({ params }: PageProps) {
  const { slug } = params;

  const { data } = await client.query({
    query: GET_MENU_BY_SLUG,
    variables: { slug },
  });

  const menu = data?.menu;

  if (!menu) return <p>Menu not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{menu.title}</h1>
      {menu.menuFields?.menuImage?.node?.sourceUrl && (
        <img
          src={menu.menuFields.menuImage.node.sourceUrl}
          alt={menu.title}
          className="rounded mb-4"
        />
      )}
      <p>{menu.menuFields?.menuDescription}</p>
      <p className="text-blue-600 font-bold">₹{menu.menuFields?.menuPrice}</p>
      <p className={`${menu.menuFields?.isavailable ? "text-green-600" : "text-red-500"}`}>
        {menu.menuFields?.isavailable ? "Available" : "Unavailable"}
      </p>
    </div>
  );
}
