"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { MenuItem } from "@/types/menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

interface MenuItemModalProps {
    show: boolean;
    onHide: () => void;
    menu: MenuItem;
}

export default function MenuItemModal({ show, onHide, menu }: MenuItemModalProps) {
    const { cart, addToCart } = useCart();

     const fields = menu.menuDetails;
     const description = fields?.menuDescription;
    const imageUrl = fields?.menuImage?.node?.sourceUrl || "/images/img-dish-icon-bg.webp";
    const price = Number(fields?.menuPrice) || 0;
    const cartItem = cart.find((item) => item.id === menu.id);
    const isAvailable = fields?.isavailable ?? true;


    return (
        <Modal show={show} onHide={onHide} centered scrollable className="text-brand-green">
            <Modal.Header closeButton>
                <Modal.Title className="text-brand-green fw-bold fs-5">{menu.title}</Modal.Title>
            </Modal.Header>

            <Modal.Body className="text-brand-green p-0">
                <div style={{ position: "relative", width: "100%", height: 220 }}>
                    <Image src={imageUrl} alt={menu.title} fill style={{ objectFit: "cover", borderRadius: 0 }} />
                </div>
                <div className="wrapper p-3">
                    {description && <p className="mb-2">{description}</p>}

                    
                    <hr />

                    {/* Special requests */}
                    <div className="mb-3">
                        <h5 className="fw-semibold mb-2 font-family-body">Special Requests</h5>
                        <p>We’ll try our best to accommodate requests, but can’t make changes that affect pricing.</p>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={'0'}
                            onChange={(e) => {}}
                            placeholder="Add special request (e.g. no onion, extra spicy)"
                            className="border-brand-green"
                        />
                    </div>


                </div>
            </Modal.Body>
            <Modal.Footer className="d-block bg-brand-green-light">
                {/* quantity + add */}
                <div className="row gx-md-2 gx-0 align-items-center">
                    <div className="col-auto">
                        <div className="">
                            <div className="d-flex  py-2 px-3">
                                <button className="btn btn-cart btn-outline-light text-brand-gree" >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <span className="text-white fw-semibold" style={{ minWidth: 36, textAlign: "center" }}>{2}</span>
                            <button className="btn btn-cart btn-outline-light text-brand-gree" >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            </div>
                        </div>
                    </div>

                    <div className="col">
                        <div className="d-flex align-items-center gap-3">
                            <Button  className="btn btn-lg fs-6 btn-wide fw-semibold btn-brand-orange w-100 d-flex justify-content-between">Add item <span className="fw-normal">{formatPrice(0)}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
