import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { orderSchema } from "@/lib/validations/order";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    const date = dateStr ? new Date(dateStr) : new Date();
    // Normalize date to start of day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const orders = await prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        customer: {
          include: { route: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "DEPUTY", "ORDER_DESK"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = orderSchema.parse(body);

    const deliveryDate = new Date(validatedData.deliveryDate);
    const dayOfWeek = deliveryDate.getDay(); // 0-6

    // 1. Fetch customer to check delivery days
    const customer = await prisma.customer.findUnique({
      where: { id: validatedData.customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 2. Logic check: Only "SPECIAL" orders can be on non-delivery days
    if (validatedData.type !== "SPECIAL" && !customer.deliveryDays.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: `Customer does not have delivery on ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek]}` },
        { status: 400 }
      );
    }

    // 3. Calculate total price and create in transaction
    const totalPrice = validatedData.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice, 
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: validatedData.customerId,
          deliveryDate,
          type: validatedData.type,
          totalPrice,
          createdBy: (session.user as any).id,
          items: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Log action
      await tx.auditLog.create({
        data: {
          userId: (session.user as any).id,
          action: "CREATE",
          entityType: "ORDER",
          entityId: newOrder.id,
          changes: JSON.stringify(newOrder),
        },
      });

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
