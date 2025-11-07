"use client";
import { useState } from "react";

interface OrderDetails {
  orderType: string;
  address?: string;
  schedule: string;
}

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (details: OrderDetails) => void;
}

export default function OrderTypeModal({
  show,
  onClose,
  onConfirm,
}: OrderTypeModalProps) {
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [schedule, setSchedule] = useState("ASAP");

  const handleConfirm = () => {
    onConfirm({ orderType, address, schedule });
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-white shadow-lg ">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Order details</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Pickup / Delivery Button Group */}
              <div className="btn-group mb-4 w-100" role="group" aria-label="Order Type">
                {["pickup", "delivery"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`btn ${
                      orderType === type
                        ? "btn-dark"
                        : "btn-outline-dark bg-transparent text-dark"
                    }`}
                    onClick={() => setOrderType(type as "pickup" | "delivery")}
                  >
                    {type}
                  </button>
                ))}
              </div>


            {orderType === "pickup" ? (
              <>
                {/* <p className="text-green-400 font-medium mb-1">Open now</p> */}
                <div className="small mb-4">
                  <h6 className="fw-bold">Chulah</h6>
                  <p>Opens 11:00 AM CDT<br/>
                  16721 MAIN ST, WILDWOOD, MO 63040</p>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-brand-yellow text-dark fw-semibold py-2 rounded-pill" onClick={() => setSchedule("ASAP")} >Pickup {schedule} </button>
                  <button className="btn btn-outline-dark rounded-pill py-2" onClick={() => setSchedule("Scheduled")}>Schedule Pickup</button>
                </div>
              </>
              ) : (
              <>
                <label className="form-label small">Enter delivery address</label>
                <div className="input-group mb-3">
                  {/* <span className="input-group-text bg-neutral-800 border-0 text-gray-400">
                    <i className="bi bi-search"></i>
                  </span> */}
                  <textarea
                    className="form-control"
                    placeholder="Search address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer border-0">
            <button onClick={handleConfirm} className="btn btn-sm btn-wide w-100 btn-brand-green fw-semibold py-2">Confirm</button>
          </div>

        </div>
      </div>
    </div>
  );
}
