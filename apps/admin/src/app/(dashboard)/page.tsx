import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { auth } from "@clerk/nextjs/server";

const Homepage = async () => {
  const { getToken } = await auth();
  const token = await getToken();

  // Fetch order chart data with logging and fallback
  const orderChartUrl = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/order-chart`;
  console.log("Fetching order chart data from:", orderChartUrl);
  const orderChartData = fetch(orderChartUrl, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      console.log("Order chart response status:", res.status);
      const text = await res.text();
      console.log("Order chart response body:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse order chart JSON:", e);
        data = [];
      }
      // Ensure it's an array
      if (!Array.isArray(data)) {
        console.warn("Expected array for order chart data, got:", data);
        return [];
      }
      return data;
    })
    .catch((err) => {
      console.error("Error fetching order chart data:", err);
      return []; // fallback to empty array
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppBarChart dataPromise={orderChartData} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Latest Transactions" />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <AppPieChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <TodoList />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Popular Products" />
      </div>
    </div>
  );
};

export default Homepage;