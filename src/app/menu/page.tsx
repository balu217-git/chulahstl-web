import client from "@/lib/graphql/client";
import { GET_MENUS } from "@/lib/graphql/queries/getMenus";
import MenuCard from "@/components/MenuCard";
import MenuCategoriesAside from "@/components/MenuCategoriesAside";
import { MenuItem, CategoryNode } from "@/types/menu";

export default async function MenuPage() {
  const data = await client.request(GET_MENUS);
  const menus: MenuItem[] = data?.foodMenus?.nodes || [];

  // Extract all categories
  const allCategories: CategoryNode[] =
    menus.flatMap((menu) => menu.menuDetails.menuCategory?.nodes || []) || [];

  // Group menus by parent → child
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
    <section className="info bg-brand-light">
      <div className="container">
        <h1 className="text-3xl font-bold mb-6">Our Menu</h1>

        <div className="info-container mt-4">
          <div className="row g-4">
            {/* Sidebar */}
            <MenuCategoriesAside categories={allCategories} />

            {/* Menu Grid */}
            <div className="col-lg-9 col-md-8">
              {Object.entries(groupedMenus).map(([parentSlug, parentGroup]) => (
                <div key={parentSlug} id={parentSlug} className="mb-5">
                  <h3 className="fw-bold text-brand-green mb-4">{parentGroup.name}</h3>

                  {Object.entries(parentGroup.children).map(([childSlug, childGroup]) => (
                    <div key={childSlug} id={childSlug} className="mb-4">
                      <h5 className="fw-semibold text-brand-brown font-family-body mb-3">
                        {childGroup.name}
                      </h5>

                      <div className="row g-4">
                        {childGroup.items.map((menu) => (
                          <div key={menu.id} className="col-xl-6 col-md-12 col-12">
                            <MenuCard menu={menu} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
