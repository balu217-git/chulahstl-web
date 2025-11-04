import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { GET_MENUS } from "@/lib/graphql/queries/getMenus";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const data = await client.request(GET_MENUS, {
      where: category ? { categoryName: category } : {},
    });

    const menus = data?.foodMenus?.nodes || [];

    return NextResponse.json({ success: true, data: menus });
  } catch (error: unknown) {
    console.error("❌ Error fetching menus:", error);

    let message = "Failed to fetch menus";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
