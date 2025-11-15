import { gql } from "graphql-request";

export const CREATE_ORDER = gql`
  mutation CreateOrderWithACF(
    $title: String!
    $name: String!
    $email: String!
    $phone: String!
    $address: String
    $orderMode: String!
    $deliveryTime: String
    $items: String!
    $total: Float!
    $paymentOrderId: String!
    $paymentStatus: String!
    $orderStatus: String!

    # NEW FIELDS (match WPGraphQL / ACF fields exposed)
    $orderType: String
    $aptSuite: String
    $instructions: String
    $orderNotes: String
    $addressPlace: String
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

        # NEW ACF FIELDS -> use field names your WPGraphQL expects
        order_type: $orderType
        apt_suite: $aptSuite
        delivery_instructions: $instructions
        order_notes: $orderNotes
        address_place_json: $addressPlace
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

          # NEW FIELDS (returned)
          orderType
          aptSuite
          deliveryInstructions
          orderNotes
          addressPlaceJson

          orderItems
        }
      }
    }
  }
`;
