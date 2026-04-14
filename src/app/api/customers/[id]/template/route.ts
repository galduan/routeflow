import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { orderItemSchema } from "@/lib/validations/order";
import * as z from "zod";

const templateSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // We fetch the most recent "RECURRING" order as the template
    const template = await prisma.order.findFirst({
      where: {
        customerId: id,
        type: "RECURRING",
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "DEPUTY", "ORDER_DESK"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = templateSchema.parse(body);

    const totalPrice = validatedData.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);

    // Update or Create the template (RECURRING order)
    const order = await prisma.order.create({
      data: {
        customerId: id,
        deliveryDate: new Date(0), // Sentinel date for templates
        type: "RECURRING",
        totalPrice,
        createdBy: (session.user as any).id,
        items: {
          create: validatedData.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}
