import { gql } from "graphql-request";

// ✅ GraphQL mutation for creating order (added email)
export const CREATE_ORDER = gql`
  mutation CreateOrderWithACF(
    $title: String!
    $name: String!
    $email: String!
    $phone: String!
    $address: String!
    $orderMode: String!
    $deliveryTime: String!
    $items: String!
    $total: Float!
    $paymentOrderId: String!
    $paymentStatus: String!
    $orderStatus: String!
  ) {
    createOrderWithACF(
      input: {
        title: $title
        customer_name: $name
        customer_email: $email
        customer_phone: $phone
        address: $address
        delivery_type: $orderMode
        delivery_time: $deliveryTime
        order_items: $items
        total_amount: $total
        payment_order_id: $paymentOrderId
        payment_status: $paymentStatus
        order_status: $orderStatus
      }
    ) {
      success
      message
      order {
        id
        databaseId
        title
        date
        slug
        orderDetails {
          customerName
          customerEmail
          customerPhone
          address
          deliveryType
          deliveryTime
          totalAmount
          paymentOrderId
          paymentStatus
          orderStatus
          paymentId
          notes
          orderItems
        }
      }
    }
  }
`;