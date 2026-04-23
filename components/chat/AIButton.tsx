"use client";

import { createOrder, verifyPayment } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import { getSocket } from "@/lib/socket";

type Props = {
  isPremium: boolean;
  message: string;
  onLocked?: () => void;
};

export default function AIButton({
  isPremium,
  message,
  onLocked,
}: Props) {
const handleAI = async () => {
  // Premium user
  if (isPremium) {
    if (!message.trim()) return;

    getSocket()?.emit("get_suggestions", {
      text: message,
    });
    return;
  }

  // Free user => direct payment
  const loaded = await loadRazorpay();

  if (!loaded) {
    alert("Razorpay SDK failed to load");
    return;
  }

  const data = await createOrder(99);
  const order = data.order;

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Nexus Chat",
    description: "Upgrade to Premium",
    order_id: order.id,

    handler: async function (response: any) {
      const verify = await verifyPayment(response);

      if (verify.success) {
        alert("Premium activated 🚀");

        getSocket()?.emit("check_premium");

        if (message.trim()) {
          getSocket()?.emit("get_suggestions", {
            text: message,
          });
        }
      }
    },

    theme: {
      color: "#6366f1",
    },
  };

  const razor = new window.Razorpay(options);
  razor.open();

  onLocked?.();
};

  return (
    <button
      onClick={handleAI}
      className="px-4 py-2 rounded-full bg-purple-500 text-white"
    >
      AI
    </button>
  );
}