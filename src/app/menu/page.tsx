import client from "@/lib/graphql/client";
import { GET_MENUS } from "@/lib/graphql/queries/getMenus";
import MenuCard from "@/components/MenuCard";

export default async function MenuPage() {
  const { data } = await client.query({
    query: GET_MENUS,
  });

  const menus = data?.menus?.nodes || [];

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🍽 Menu</h1>
      <div className="grid grid-cols-3 gap-6">
        {menus.map((menu: any) => (
          <MenuCard key={menu.id} menu={menu} />
        ))}
      </div>
    </main>
  );
}
