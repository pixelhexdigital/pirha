import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Share, ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { selectCart } from "store/CartSlice";
import {
  selectRestaurantDetails,
  selectTableDetailById,
} from "store/MiscellaneousSlice";
import { numberToCurrency } from "lib/helper";

const UserBillPage = () => {
  const navigate = useNavigate();
  const { tableId, restaurantId } = useParams();

  const cartData = useSelector(selectCart);
  const restaurantDetails = useSelector(selectRestaurantDetails);
  const tableDetails = useSelector(selectTableDetailById);

  console.log("restaurantDetails", restaurantDetails);
  console.log("tableDetails", tableDetails);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Calculate bill details
  const subtotal =
    cartData?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.05; // 5% tax
  const serviceCharge = subtotal * 0.1; // 10% service charge
  const total = subtotal + tax + serviceCharge;

  // Generate current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Generate a random bill number
  const billNumber = `BILL-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadBill = () => {
    setIsGeneratingPdf(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPdf(false);
      alert("Bill downloaded successfully!");
    }, 1500);
  };

  const handleShareBill = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Bill from ${restaurantDetails?.restroName || "Restaurant"}`,
          text: `My bill from ${restaurantDetails?.restroName || "Restaurant"} for table ${tableDetails?.title || "N/A"} is ₹${total.toFixed(2)}`,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      alert("Sharing is not supported on this browser");
    }
  };

  const handlePrintBill = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm print:hidden">
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
          <h1 className="text-xl font-semibold">Bill Details</h1>
        </div>
      </div>

      <main className="container max-w-md mx-auto px-4 py-6">
        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">
              {restaurantDetails?.restroName || "Restaurant"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {restaurantDetails?.location || "123 Restaurant Street, City"}
            </p>
          </div>

          <div className="flex justify-between text-sm mb-4">
            <div>
              <p>
                <span className="font-medium">Bill No:</span> {billNumber}
              </p>
              <p>
                <span className="font-medium">Table:</span>{" "}
                {tableDetails?.title || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p>
                <span className="font-medium">Date:</span> {formattedDate}
              </p>
              <p>
                <span className="font-medium">Time:</span> {formattedTime}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-sm font-medium">
              <p className="w-1/2">Item</p>
              <p className="w-1/6 text-center">Qty</p>
              <p className="w-1/6 text-right">Price</p>
              <p className="w-1/6 text-right">Amount</p>
            </div>
            <Separator />

            {cartData?.map((item) => (
              <div key={item._id} className="flex justify-between text-sm py-2">
                <p className="w-1/2">{item.title}</p>
                <p className="w-1/6 text-center">{item.quantity}</p>
                <p className="w-1/6 text-right">₹{item.price}</p>
                <p className="w-1/6 text-right">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            {/* <div className="flex justify-between text-sm">
              <p>Subtotal</p>
              <p>{numberToCurrency(subtotal, "INR", 2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Tax (5%)</p>
              <p>{numberToCurrency(tax, "INR", 2)}</p>
            </div> */}
            <div className="flex justify-between text-sm">
              <p>Service Charge (10%)</p>
              <p>{numberToCurrency(serviceCharge, "INR", 2)}</p>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <p>Total Amount</p>
              <p>{numberToCurrency(total, "INR", 2)}</p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Thank you for dining with us!</p>
            <p>Visit again soon</p>
          </div>
        </div>

        <div className="flex justify-between gap-2 print:hidden">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrintBill}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownloadBill}
            disabled={isGeneratingPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? "Generating..." : "Download"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShareBill}
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </main>
    </div>
  );
};

export default UserBillPage;
