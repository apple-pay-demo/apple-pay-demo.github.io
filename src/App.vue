<template>
  <form
    class="min-h-screen bg-gray-100 p-6 text-gray-900"
    @submit.prevent="payHandler"
  >
    <div class="max-w-xl mx-auto space-y-6">
      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow p-6 text-center">
        <p class="text-2xl font-semibold mb-4">Processando pagamento...</p>
        <p>Por favor, aguarde enquanto finalizamos sua transação.</p>
      </div>

      <!-- Success -->
      <div
        v-if="successData"
        class="bg-green-50 border border-green-200 rounded-lg shadow p-6 mb-4"
      >
        <div class="flex items-center mb-4">
          <svg
            class="w-5 h-5 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <h2 class="text-xl font-semibold text-green-700">
            Pagamento Processado
          </h2>
        </div>

        <div class="mb-4">
          <h3 class="font-medium text-green-700 mb-2">Apple Pay Token:</h3>
          <pre
            class="bg-white p-3 rounded border border-green-200 text-sm overflow-auto max-h-40"
            >{{ JSON.stringify(successData.appleToken, null, 2) }}</pre
          >
        </div>

        <div>
          <h3 class="font-medium text-green-700 mb-2">Comando cURL:</h3>
          <pre
            class="bg-white p-3 rounded border border-green-200 text-sm overflow-auto max-h-40"
            >{{ successData.curl }}</pre
          >
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="errorMessage"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
        role="alert"
      >
        <p class="font-bold">Erro</p>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Minha Loja -->
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-semibold mb-4">Minha Loja</h1>
        <div class="space-y-4">
          <label class="block text-sm">Bearer Token</label>
          <input
            v-model="token"
            type="text"
            placeholder="Bearer Token"
            class="!mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label class="block text-sm">ID do Pedido</label>
          <input
            v-model="orderId"
            type="text"
            placeholder="Order ID"
            class="!mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label class="block text-sm">ID do Cliente</label>
          <input
            v-model="customerId"
            type="text"
            placeholder="Customer ID"
            class="!mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label class="block text-sm">External ID</label>
          <input
            v-model="externalId"
            type="text"
            placeholder="External ID"
            class="!mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            @click="fillExample"
            type="button"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition"
          >
            Preencher com dados de exemplo
          </button>
        </div>
      </div>

      <!-- Formulários de pedido e pagamento -->
      <OrderForm v-model="order" />
      <PaymentForm v-model="payment" />

      <!-- Botão Apple Pay -->
      <button
        type="submit"
        :disabled="!canPay"
        data-appmax-apple-pay
        class="appmax-apple-pay-btn w-full bg-green-600 text-white h-[52px] p-0 rounded-lg text-lg font-medium hover:bg-green-500 transition disabled:opacity-50"
      >
        <span v-if="!isLoading">Pagar com Apple Pay</span>
        <span v-else>Processando...</span>
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useFormData } from "./hooks/useFormData";
import OrderForm from "./components/OrderForm.vue";
import PaymentForm from "./components/PaymentForm.vue";
import { useAppmaxScript } from "./hooks/useAppmaxScript";
import { useEnvironment } from "./hooks/useEnvironment";

export default defineComponent({
  name: "App",
  components: { OrderForm, PaymentForm },
  setup() {
    // campos gerais
    const token = ref("");
    const orderId = ref("");
    const customerId = ref("");
    const externalId = ref("");

    // dados de formulário
    const { order, payment } = useFormData();

    // estados de UI
    const isLoading = ref(false);
    const errorMessage = ref("");
    const successData = ref<{
      appleToken: Record<string, any>;
      curl: string;
    } | null>(null);

    // ambiente (sem seletor na UI)
    const { mode } = useEnvironment();

    // botão habilitado apenas se todos os campos estiverem preenchidos e não estiver carregando
    const canPay = computed(() => {
      return (
        !!token.value &&
        !!orderId.value &&
        !!customerId.value &&
        !!externalId.value &&
        !isLoading.value
      );
    });

    // gera string cURL a partir do token
    const getCurlString = (appleToken: any) => {
      return `curl --location 'http://sistema.local/api/v4/payment/apple-pay' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer ${token.value}' \\
--data '{
  "payment_data": {
    "apple_pay": {
      "installments": "${payment.payment_data.apple_pay.installments}",
      "holder_document_number": "${payment.payment_data.apple_pay.holder_document_number}",
      "soft_descriptor": "${payment.payment_data.apple_pay.soft_descriptor}",
      "payment_data": {
        "data": "${appleToken.paymentData.data}",
        "signature": "${appleToken.paymentData.signature}",
        "header": {
          "publicKeyHash": "${appleToken.paymentData.header.publicKeyHash}",
          "ephemeralPublicKey": "${appleToken.paymentData.header.ephemeralPublicKey}",
          "transactionId": "${appleToken.paymentData.header.transactionId}"
        },
        "version": "${appleToken.paymentData.version}"
      },
      "payment_method": {
        "displayName": "${appleToken.paymentMethod.displayName}",
        "network": "${appleToken.paymentMethod.network}",
        "type": "${appleToken.paymentMethod.type}"
      },
      "transaction_identifier": "${appleToken.transactionIdentifier}"
    }
  },
  "order_id": "${orderId.value}",
  "customer_id": "${customerId.value}"
}'`;
    };

    // callbacks Appmax
    async function onSuccess(appleToken: any) {
      errorMessage.value = "";
      const curl = getCurlString(appleToken);
      successData.value = { appleToken, curl };
    }

    function onError(err: unknown) {
      errorMessage.value = JSON.stringify(err);
    }

    function onUpdate() {
      return {
        total:
          order.products_value + order.shipping_value - order.discount_value,
        freight: order.shipping_value,
        discount: order.discount_value,
        installments: Number(payment.payment_data.apple_pay.installments),
        products: order.products.map((p) => ({
          name: p.name,
          price: order.products_value / order.products.length,
          quantity: p.quantity,
        })),
      };
    }

    // injeta script Appmax com External ID
    useAppmaxScript({
      environment: mode,
      externalId: Number(externalId.value) || 0,
      onSuccess,
      onError,
      onUpdate,
    });

    // preenche dados de exemplo
    const fillExample = () => {
      token.value = "eyJhbGciOiJSUzI1NiI...";
      orderId.value = "12345";
      customerId.value = "67890";
      externalId.value = "555";
      Object.assign(order, {
        products_value: 2500,
        discount_value: 100,
        shipping_value: 50,
        products: [{ sku: "XYZ-123", name: "Tênis Exemplo", quantity: 2 }],
      });
      Object.assign(payment.payment_data.apple_pay, {
        installments: "2",
        holder_document_number: "19100000000",
        soft_descriptor: "MINHALOJA",
      });
    };

    // handler do submit: o Appmax Script dispara o fluxo Apple Pay
    const payHandler = () => {};

    return {
      token,
      orderId,
      customerId,
      externalId,
      order,
      payment,
      isLoading,
      errorMessage,
      successData,
      fillExample,
      payHandler,
      canPay,
    };
  },
});
</script>
