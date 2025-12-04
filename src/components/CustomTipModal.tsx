// components/CustomTipModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { formatPrice } from "@/lib/currency";

interface CustomTipModalProps {
  show: boolean;
  onClose: () => void;
  subtotal: number; // used to compute percent
  initialAmount?: number; // initial custom amount, optional
  onSave: (amount: number) => void; // returns numeric amount in dollars
}

export default function CustomTipModal({
  show,
  onClose,
  subtotal,
  initialAmount = 0,
  onSave,
}: CustomTipModalProps) {
  const [amountStr, setAmountStr] = useState<string>(initialAmount ? initialAmount.toFixed(2) : "0.00");
  const [percentStr, setPercentStr] = useState<string>(() => {
    if (!subtotal || subtotal <= 0) return "0";
    return ((initialAmount / subtotal) * 100).toFixed(0);
  });

  // percent -> amount
  useEffect(() => {
    const p = parseFloat(percentStr.replace(/[^\d.-]/g, ""));
    if (!isFinite(p) || p < 0) return;
    const a = subtotal * (p / 100);
    if (Math.abs(a - parseFloat(amountStr || "0")) > 0.005) {
      setAmountStr(a.toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentStr]);

  // amount -> percent
  useEffect(() => {
    const a = parseFloat(amountStr.replace(/[^\d.-]/g, ""));
    if (!isFinite(a) || subtotal <= 0) {
      setPercentStr("0");
      return;
    }
    const p = (a / subtotal) * 100;
    if (Math.abs(p - parseFloat(percentStr || "0")) > 0.1) {
      setPercentStr(Math.round(p).toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountStr]);

  useEffect(() => {
    if (show) {
      setAmountStr(initialAmount ? initialAmount.toFixed(2) : "0.00");
      setPercentStr(subtotal > 0 && initialAmount ? Math.round((initialAmount / subtotal) * 100).toString() : "0");
    }
  }, [show, initialAmount, subtotal]);

  const parsedAmount = useMemo(() => {
    const v = parseFloat(amountStr.replace(/[^\d.-]/g, ""));
    return isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : 0;
  }, [amountStr]);

  const parsedPercent = useMemo(() => {
    const v = parseFloat(percentStr.replace(/[^\d.-]/g, ""));
    return isFinite(v) && v >= 0 ? Math.round(v) : 0;
  }, [percentStr]);

  const canSave = parsedAmount >= 0 && parsedAmount <= 99999; // adjust upper bound if needed

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="custom-tip-modal info-brand">
      <style jsx>{`
        
      `}</style>

      <Modal.Header closeButton>
        <Modal.Title className="fw-bold te">Custom tip</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-3 align-items-center form-container text-brand-green">
          <div className="col-6">
            <label className="form-label small fw-semibold">Amount</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="text"
                className="form-control"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                inputMode="decimal"
                aria-label="Tip amount in dollars"
              />
            </div>
            <div className="small text-mute mt-1">Amount — {formatPrice(subtotal)} subtotal</div>
          </div>

          <div className="col-6">
            <label className="form-label small fw-semibold">Percent</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={percentStr}
                onChange={(e) => setPercentStr(e.target.value)}
                inputMode="numeric"
                aria-label="Tip percent"
              />
              <span className="input-group-text">%</span>
            </div>
            <div className="small text-mute mt-1">Percent of subtotal</div>
          </div>

          <div className="col-12">
            <div className="small text-mute">Preview: <strong>{formatPrice(parsedAmount)}</strong> ({parsedPercent}% of subtotal)</div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" className="btn-wide btn-sm" onClick={onClose}>Cancel</Button>
        <Button
          className="btn btn-brand-brown btn-wide btn-sm"
          onClick={() => {
            onSave(parsedAmount);
            onClose();
          }}
          disabled={!canSave}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
