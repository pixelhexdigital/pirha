import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectRestaurantDetails } from "store/MiscellaneousSlice";
import { numberToCurrency } from "lib/helper";

// Mock data for order history
const mockOrderHistory = [
  {
    id: "order-001",
    date: "2025-05-07",
    time: "13:45",
    status: "completed",
    total: 560,
    items: [
      { id: "item-1", name: "Peanut Masala", quantity: 2, price: 110 },
      { id: "item-2", name: "Boil Egg", quantity: 3, price: 20 },
      { id: "item-3", name: "Chicken Biryani", quantity: 1, price: 280 },
    ],
  },
  {
    id: "order-002",
    date: "2025-05-06",
    time: "19:30",
    status: "completed",
    total: 420,
    items: [
      { id: "item-4", name: "Paneer Tikka", quantity: 1, price: 180 },
      { id: "item-5", name: "Butter Naan", quantity: 4, price: 30 },
      { id: "item-6", name: "Dal Makhani", quantity: 1, price: 120 },
    ],
  },
  {
    id: "order-003",
    date: "2025-05-05",
    time: "12:15",
    status: "completed",
    total: 350,
    items: [
      { id: "item-7", name: "Veg Pulao", quantity: 1, price: 150 },
      { id: "item-8", name: "Raita", quantity: 1, price: 50 },
      { id: "item-9", name: "Gulab Jamun", quantity: 3, price: 50 },
    ],
  },
];

const UserOrderHistoryPage = () => {
  const navigate = useNavigate();
  const { tableId, restaurantId } = useParams();

  const restaurantDetails = useSelector(selectRestaurantDetails);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulate API call to fetch order history
    const fetchOrderHistory = () => {
      // Filter by period
      let filteredOrders = [...mockOrderHistory];

      if (filterPeriod === "today") {
        const today = new Date().toISOString().split("T")[0];
        filteredOrders = filteredOrders.filter((order) => order.date === today);
      } else if (filterPeriod === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split("T")[0];
        filteredOrders = filteredOrders.filter(
          (order) => order.date >= oneWeekAgoStr
        );
      } else if (filterPeriod === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneMonthAgoStr = oneMonthAgo.toISOString().split("T")[0];
        filteredOrders = filteredOrders.filter(
          (order) => order.date >= oneMonthAgoStr
        );
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter((order) =>
          order.items.some((item) => item.name.toLowerCase().includes(query))
        );
      }

      setOrders(filteredOrders);
    };

    fetchOrderHistory();
  }, [filterPeriod, searchQuery]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-semibold">Order History</h1>
        </div>
      </div>

      <main className="container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="h-9">
              <Button variant="outline" size="sm" className="ml-2">
                <Filter className="mr-2 h-4 w-4" />
                {filterPeriod === "all"
                  ? "All Time"
                  : filterPeriod === "today"
                    ? "Today"
                    : filterPeriod === "week"
                      ? "This Week"
                      : "This Month"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPeriod("all")}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPeriod("today")}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPeriod("week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPeriod("month")}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No orders found</p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Accordion type="single" collapsible key={order.id}>
                <AccordionItem
                  value={order.id}
                  className="border rounded-lg bg-white shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex flex-1 justify-between items-center">
                      <div>
                        <p className="font-medium text-left">
                          Order #{order.id.split("-")[1]}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{formatDate(order.date)}</span>
                          <Clock className="ml-3 mr-1 h-3 w-3" />
                          <span>{order.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {numberToCurrency(order.total, "INR", 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <Separator className="mb-3" />
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <div>
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              × {item.quantity}
                            </span>
                          </div>
                          <p>
                            {numberToCurrency(
                              item.price * item.quantity,
                              "INR",
                              0
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-medium">
                      <p>Total</p>
                      <p>{numberToCurrency(order.total, "INR", 0)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() =>
                        navigate(
                          `/bill/${tableId}/${restaurantId}?orderId=${order.id}`
                        )
                      }
                    >
                      View Bill Details
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserOrderHistoryPage;
