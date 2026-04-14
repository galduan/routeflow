import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { routeSchema } from "@/lib/validations/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routes = await prisma.route.findMany({
      include: {
        driver: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { customers: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "DEPUTY"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = routeSchema.parse(body);

    const route = await prisma.route.create({
      data: validatedData,
    });

    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}
