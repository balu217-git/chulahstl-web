import client from "@/lib/graphql/client";
import { GET_MENUS } from "@/lib/graphql/queries/getMenus";
import MenuClient from "./MenuClient";
import { MenuItem, CategoryNode } from "@/types/menu";

export default async function MenuPage() {
  const data = await client.request(GET_MENUS);
  const menus: MenuItem[] = data?.foodMenus?.nodes || [];

  const allCategories: CategoryNode[] =
    menus.flatMap((menu) => menu.menuDetails.menuCategory?.nodes || []) || [];

  const groupedMenus: Record<
    string,
    { name: string; slug: string; children: Record<string, { name: string; items: MenuItem[] }> }
  > = {};

  menus.forEach((menu) => {
    const categories = menu.menuDetails.menuCategory?.nodes || [];
    categories.forEach((cat) => {
      const parent = cat.parent?.node;

      if (parent) {
        if (!groupedMenus[parent.slug]) {
          groupedMenus[parent.slug] = { name: parent.name, slug: parent.slug, children: {} };
        }
        if (!groupedMenus[parent.slug].children[cat.slug]) {
          groupedMenus[parent.slug].children[cat.slug] = { name: cat.name, items: [] };
        }
        groupedMenus[parent.slug].children[cat.slug].items.push(menu);
      } else {
        if (!groupedMenus[cat.slug]) {
          groupedMenus[cat.slug] = { name: cat.name, slug: cat.slug, children: {} };
        }
        if (!groupedMenus[cat.slug].children[cat.slug]) {
          groupedMenus[cat.slug].children[cat.slug] = { name: cat.name, items: [] };
        }
        groupedMenus[cat.slug].children[cat.slug].items.push(menu);
      }
    });
  });

  return (
    <MenuClient
      allCategories={allCategories}
      groupedMenus={groupedMenus}
    />
  );
}
