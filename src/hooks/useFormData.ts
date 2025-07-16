import { reactive, computed } from "vue";

export function useFormData() {
  const customer = reactive({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    ip: "",
  });

  const order = reactive({
    products_value: 0,
    discount_value: 0,
    shipping_value: 0,
    products: [{ sku: "", name: "", quantity: 1 }],
  });

  const payment = reactive({
    payment_data: {
      apple_pay: {
        installments: "1",
        holder_document_number: "",
        soft_descriptor: "",
        payment_data: {},
        payment_method: {},
        transaction_identifier: "",
      },
    },
  });

  const isValid = computed(() => {
    const custValid = Object.values(customer).every((v) => v !== "");
    const orderValid =
      order.products_value > 0 &&
      order.products.length > 0 &&
      order.products.every((p) => p.sku !== "" && p.name !== "");
    const payValid = payment.payment_data.apple_pay.installments !== "";

    return custValid && orderValid && payValid;
  });

  return { customer, order, payment, isValid };
}
