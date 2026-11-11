import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { OrderType, ProductsType } from "@shopflow/types";
import { auth } from "@clerk/nextjs/server";

const CardList = async ({ title }: { title: string }) => {
  let products: ProductsType = [];
  let orders: OrderType[] = [];

  const { getToken } = await auth();
  const token = await getToken();

  if (title === "Popular Products") {
    const productsUrl = `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=5&popular=true`;
    console.log("Fetching popular products from:", productsUrl);
    const productsRes = await fetch(productsUrl, { cache: 'no-store' });
    console.log("Popular products response status:", productsRes.status);
    const productsText = await productsRes.text();
    console.log("Popular products response body:", productsText);
    let parsed: any = [];
    try {
      parsed = JSON.parse(productsText);
    } catch (e) {
      console.error("Failed to parse popular products JSON:", e);
      parsed = [];
    }
    if (!Array.isArray(parsed)) {
      console.warn("Expected array for popular products, got:", parsed);
      parsed = [];
    }
    products = parsed;
  } else {
    const ordersUrl = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?limit=5`;
    console.log("Fetching latest orders from:", ordersUrl);
    const ordersRes = await fetch(ordersUrl, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Latest orders response status:", ordersRes.status);
    const ordersText = await ordersRes.text();
    console.log("Latest orders response body:", ordersText);
    let parsed: any = [];
    try {
      parsed = JSON.parse(ordersText);
    } catch (e) {
      console.error("Failed to parse latest orders JSON:", e);
      parsed = [];
    }
    if (!Array.isArray(parsed)) {
      console.warn("Expected array for latest orders, got:", parsed);
      parsed = [];
    }
    orders = parsed;
  }

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "Popular Products"
          ? products.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                  <Image
                    src={
                      Object.values(item.images as Record<string, string>)[0] ||
                      ""
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.name}
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-0">${item.price}K</CardFooter>
              </Card>
            ))
          : orders.map((item) => (
              <Card
                key={item._id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.email}
                  </CardTitle>
                  <Badge variant="secondary">{item.status}</Badge>
                </CardContent>
                <CardFooter className="p-0">${item.amount / 100}</CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;