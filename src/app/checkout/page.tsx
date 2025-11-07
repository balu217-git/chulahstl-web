"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderMode, setOrderMode] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // 📞 Format phone like (555) 555-5555
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    return !match[2]
      ? match[1]
      : `(${match[1]}) ${match[2]}${match[3] ? "-" + match[3] : ""}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your cart is empty.");
    if (!name.trim() || !email.trim() || !phone.trim())
      return alert("Please fill in your name, email, and phone number.");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return alert("Please enter a valid email address.");

    // Validate US phone number: (XXX) XXX-XXXX
    if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone))
      return alert("Please enter a valid US phone number (e.g. (555) 555-5555).");

    if (orderMode === "delivery" && !address.trim())
      return alert("Please enter your delivery address.");

    setLoading(true);

    try {
      const total = getTotalPrice();

      // 1️⃣ Create order in WordPress
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          orderMode,
          address,
          deliveryTime,
          items: cart,
          total,
          paymentOrderId: "N/A",
          paymentStatus: "pending",
          orderStatus: "pending",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.order) {
        console.error("Order creation failed:", orderData);
        alert("Failed to create order. Please try again.");
        return;
      }

      // 2️⃣ Generate Square payment link
      const paymentRes = await fetch("/api/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items: cart,
          orderId: orderData.order.id,
          databaseId: orderData.order.databaseId,
        }),
      });

      const data = await paymentRes.json();

      if (data.success && data.checkoutUrl) {
        setPaymentUrl(data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return <section className="hero bg-brand-light text-center d-flex align-items-center justify-content-center"
        style={{
          minHeight: "80vh"
        }}
      >
        <div className="container">
            <div className="hero-content">
                <h1 className="fw-bold text-dark mb-3 fs-2">Your cart is empty.</h1>
                {/* <p className="text-muted mb-4">
                  Our website is getting a delicious makeover. Stay tuned!
                </p> */}
            </div>
        </div>
    </section>;

  return (
    <section className="hero bg-brand-light"
        style={{
          minHeight: "80vh"
        }}
      >
      <div className="container">
        <h2 className="fw-bold mb-4 text-center">Checkout</h2>

        <div className="row">
          {/* 🧍 Left Column: Customer Info */}
          <div className="col-lg-6">
            <div className="bg-white rounded shadow-sm p-4 mb-4">
              <h5 className="mb-3">Customer Information</h5>

              <div className="mb-3">
                <label className="form-label small">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="(555) 555-5555"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                />
              </div>
            </div>

            {/* 🚚 Delivery Option */}
            <div className="bg-white rounded shadow-sm p-4 mb-4">
              <h5 className="mb-3">Order Type</h5>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="orderMode"
                  id="pickup"
                  checked={orderMode === "pickup"}
                  onChange={() => setOrderMode("pickup")}
                />
                <label className="form-check-label small" htmlFor="pickup">
                  Pickup
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="orderMode"
                  id="delivery"
                  checked={orderMode === "delivery"}
                  onChange={() => setOrderMode("delivery")}
                />
                <label className="form-check-label small" htmlFor="delivery">
                  Delivery
                </label>
              </div>

              {orderMode === "pickup" ? (
                <div className="mt-3 alert alert-info">
                  <strong>Pickup Location:</strong>
                  <br />
                  🍽️ VenuVenu Restaurant
                  <br />
                  123 Main Street, Austin, TX 78701
                  <br />
                  <strong>Pickup Hours:</strong> 10:00 AM – 9:00 PM
                </div>
              ) : (
                <div className="row g-3 mt-3">
                  <div className="col-md-7">
                    <label className="form-label small">Delivery Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your delivery address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label small">Preferred Delivery Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🛒 Right Column: Cart Summary */}
          <div className="col-lg-6">
            <div className="bg-white rounded shadow-sm p-4">
              <h5 className="mb-3">Your Order</h5>
              <ul className="list-group mb-3">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span className="fw-bold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <h4 className="text-end">
                Total:{" "}
                <span className="fw-bold">₹{getTotalPrice().toFixed(2)}</span>
              </h4>

              <button
                className="btn btn-brand-orange w-100 mt-4"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay with Square"}
              </button>

              {paymentUrl && (
                <p className="mt-3 text-muted text-center">
                  Redirecting to Square checkout...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
