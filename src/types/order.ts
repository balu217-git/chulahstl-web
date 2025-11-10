export type OrderMode = "pickup" | "delivery";

export interface OrderDetails {
  mode: OrderMode | null;
  address: string;
  deliveryTime: string;
}
