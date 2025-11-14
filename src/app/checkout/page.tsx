"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faCalendarAlt, } from "@fortawesome/free-solid-svg-icons";
import PlaceHeader from "@/components/PlaceHeader";
import { formatDateTimeForTZ } from "@/lib/formatDateTime";


export default function CheckoutPage() {
  const { cart, getTotalPrice, orderMode, address, deliveryTime, addressPlace } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // const [address, setAddress] = useState("");
  // const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const timeZone =
  (addressPlace as any)?.timeZoneId ??
  process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ??
  "America/Chicago";


 // 🕒 Format delivery time display (e.g., 12:30 PM - U.S. format)
const formatDeliveryTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  
  // ✅ Use U.S. locale, 12-hour format with AM/PM
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


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
    if (!emailPattern.test(email))
      return alert("Please enter a valid email address.");

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
    return (
      <section
        className="hero bg-brand-light text-center d-flex align-items-center justify-content-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="container">
          <h1 className="fw-bold text-dark mb-3 fs-2">Your cart is empty.</h1>
        </div>
      </section>
    );

  return (
    <section className="hero bg-brand-light" style={{ minHeight: "80vh" }}>
      <div className="container">
        <h2 className="fw-bold mb-4 text-center">Checkout</h2>

        <div className="row">
          {/* 🧍 Left Column: Customer Info */}
          <div className="col-lg-6">

            {/* 🚚 Delivery Option */}
              
              {orderMode === "pickup" ? (
                <>
                <h5 className="mb-3">Pickup details</h5>
                <div className="card mt-3 alert alert-info">
                    <div className="mt-3">
                      <PlaceHeader fontSize="fs-6" />
                    </div>
                    <p>Pickup Time: {formatDateTimeForTZ(deliveryTime, timeZone)}</p>
                </div>
                </>
              ) : (
                 <>
                  <h6 className="fw-semibold mb-3">Delivery details</h6>
                  <Card className="bg-brand-green text-light border-0 p-3 rounded-4">
                    

                    <div className="d-flex align-items-start mb-3">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 pt-1" />
                      <p className="mb-0">
                        Delivering to{" "}
                        <strong>{address || "No address set yet"}</strong>
                      </p>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <FontAwesomeIcon icon={faClock} className="me-2 pt-1"/>
                      <p className="mb-0">
                        {deliveryTime
                          ? `Tomorrow by ${formatDateTimeForTZ(deliveryTime, timeZone)}`
                          : "Delivery time not set yet"}
                      </p>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2 pt-1"/>
                      <a
                        href="#"
                        className="text-decoration-underline text-light small"
                      >
                        Add delivery instructions
                        </a>
                    </div>

                    {/* <div className="border-top border-secondary pt-3 small text-muted">
                      You’re saving <strong>$9.33</strong> by ordering directly
                      from us vs. other websites
                    </div> */}
                  </Card>
                 </>
              )}

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
