<template>
  <form class="min-h-screen bg-gray-100 p-6 text-gray-900" @submit.prevent>
    <div class="max-w-xl mx-auto space-y-6">
      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow p-6 text-center">
        <p class="text-2xl font-semibold mb-4">Processando pagamento...</p>
        <p>Por favor, aguarde enquanto finalizamos sua transação.</p>
      </div>

      <!-- Sucesso -->
      <div
        v-if="successMessage"
        class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 space-y-4"
      >
        <p class="font-bold mb-2">Pagamento realizado com sucesso!</p>
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto">
            <tbody>
              <tr class="border-b">
                <td class="py-2 font-medium">Cliente ID:</td>
                <td class="py-2">{{ successMessage.customerId }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-2 font-medium">Pedido ID:</td>
                <td class="py-2">{{ successMessage.orderId }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-2 font-medium">Status:</td>
                <td class="py-2">
                  <span
                    class="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs"
                  >
                    {{ successMessage.orderStatus }}
                  </span>
                </td>
              </tr>
              <tr class="border-b">
                <td class="py-2 font-medium">Referência:</td>
                <td class="py-2">{{ successMessage.pay_reference }}</td>
              </tr>
              <tr>
                <td class="py-2 font-medium">Hash Upsell:</td>
                <td class="py-2 break-all text-xs">
                  {{ successMessage.upsell_hash }}
                </td>
              </tr>
              <tr>
                <td class="py-2 font-medium">Apple Token:</td>
                <td class="py-2">
                  <pre class="text-xs break-all">{{
                    JSON.stringify(successMessage.appleToken, null, 2)
                  }}</pre>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Editáveis & Payload -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Customer ID</label>
            <input
              type="text"
              v-model="editableCustomerId"
              class="w-full bg-white border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Order ID</label>
            <input
              type="text"
              v-model="editableOrderId"
              class="w-full bg-white border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >Payload Completo</label
            >
            <textarea
              rows="12"
              readonly
              class="w-full bg-white border border-gray-300 rounded px-3 py-2 font-mono text-xs cursor-not-allowed"
              >{{ fullPayload }}</textarea
            >
          </div>
        </div>
      </div>

      <!-- Erro -->
      <div
        v-if="errorMessage"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
        role="alert"
      >
        <p class="font-bold">Erro</p>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Reiniciar -->
      <section v-if="errorMessage || successMessage">
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <button
            @click="restart"
            class="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-500 transition"
          >
            Reiniciar
          </button>
        </div>
      </section>

      <!-- Formulário -->
      <section v-else>
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h1 class="text-2xl font-semibold mb-4">Minha Loja</h1>
          <div class="space-y-4">
            <input
              v-model="token"
              type="text"
              placeholder="Bearer Token"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

        <CustomerForm v-model="customer" />
        <OrderForm v-model="order" />
        <PaymentForm v-model="payment" />

        <button
          type="submit"
          :disabled="!isValid || isLoading"
          data-appmax-apple-pay
          class="appmax-apple-pay-btn w-full bg-green-600 text-white h-[52px] p-0 rounded-lg text-lg font-medium hover:bg-green-500 transition disabled:opacity-50"
        >
          <span v-if="!isLoading">Pagar com Apple Pay</span>
          <span v-else>Processando...</span>
        </button>
      </section>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { useFormData } from "./hooks/useFormData";
import { useAppmaxScript } from "./hooks/useAppmaxScript";
import CustomerForm from "./components/CustomerForm.vue";
import OrderForm from "./components/OrderForm.vue";
import PaymentForm from "./components/PaymentForm.vue";

export default defineComponent({
  name: "App",
  components: { CustomerForm, OrderForm, PaymentForm },
  setup() {
    const token = ref("");
    const { customer, order, payment, isValid } = useFormData();

    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const successMessage = ref<Record<string, any> | null>(null);

    // campos editáveis
    const editableCustomerId = ref("");
    const editableOrderId = ref("");

    watch(successMessage, (msg) => {
      if (msg) {
        editableCustomerId.value = msg.customerId;
        editableOrderId.value = msg.orderId;
      }
    });

    // monta o JSON no formato exato
    const fullPayload = computed(() => {
      if (!successMessage.value) return "";
      const tokenBlock = successMessage.value.appleToken;
      return JSON.stringify(
        {
          payment_data: {
            apple_pay: {
              installments: payment.payment_data.apple_pay.installments,
              holder_document_number:
                payment.payment_data.apple_pay.holder_document_number,
              soft_descriptor: payment.payment_data.apple_pay.soft_descriptor,
              payment_data: tokenBlock.payment_data,
              payment_method: tokenBlock.payment_method,
              transaction_identifier: tokenBlock.transaction_identifier,
            },
          },
          order_id: Number(editableOrderId.value),
          customer_id: Number(editableCustomerId.value),
        },
        null,
        2
      );
    });

    // callbacks Appmax
    async function onSuccess() {
      errorMessage.value = null;
      return true;
    }
    async function onAuthorize(appleToken: any) {
      errorMessage.value = null;
      await mockPay(appleToken);
      return true;
    }
    function onError(err: unknown) {
      errorMessage.value = JSON.stringify(err);
    }
    function onUpdate() {
      return {
        orderId: `order-${Date.now()}`,
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

    useAppmaxScript({
      externalId: "e38b9459-7603-4bea-a075-7c1266ccb17a",
      onSuccess,
      onError,
      onUpdate,
      onAuthorize,
    });

    const bearerDefault = "eyJhbGciOiJSUzI1NiIsInR";
    function fillExample() {
      token.value = bearerDefault;
      Object.assign(customer, {
        first_name: "Ana",
        last_name: "Costa",
        email: "ana.costa@mail.com",
        phone: "51912345678",
        ip: "177.44.192.150",
      });
      Object.assign(order, {
        products_value: 2000,
        discount_value: 50,
        shipping_value: 20,
        products: [
          { sku: "XYZ-123", name: "Tênis Moderno", quantity: 1, price: 1000 },
        ],
      });
      Object.assign(payment.payment_data.apple_pay, {
        installments: "1",
        holder_document_number: "19100000000",
        soft_descriptor: "MYSTORE",
      });
    }

    interface ApplePayToken {
      paymentData: any;
      paymentMethod: any;
      transactionIdentifier: string;
    }

    async function mockPay(appleToken: ApplePayToken) {
      if (!isValid || isLoading.value) return;
      isLoading.value = true;
      errorMessage.value = null;
      try {
        // monta o bloco token igual ao real
        const fakeToken = {
          payment_data: {
            data: appleToken.paymentData.data,
            signature: appleToken.paymentData.signature,
            header: appleToken.paymentData.header,
          },
          payment_method: {
            displayName: appleToken.paymentMethod.displayName,
            network: appleToken.paymentMethod.network,
            type: appleToken.paymentMethod.type,
          },
          transaction_identifier: appleToken.transactionIdentifier,
        };
        const result = {
          customer: { data: { customer: { id: "mock-customer-id" } } },
          order: { data: { order: { id: "mock-order-id", status: "paid" } } },
          payment: {
            data: {
              payment: { pay_reference: "mock-ref", upsell_hash: "mock-hash" },
            },
          },
        };
        successMessage.value = {
          customerId: result.customer.data.customer.id,
          orderId: result.order.data.order.id,
          orderStatus: result.order.data.order.status,
          pay_reference: result.payment.data.payment.pay_reference,
          upsell_hash: result.payment.data.payment.upsell_hash,
          appleToken: fakeToken,
        };
      } catch (e: any) {
        successMessage.value = null;
        errorMessage.value = e.message || String(e);
      } finally {
        isLoading.value = false;
      }
    }

    function restart() {
      location.reload();
    }

    return {
      token,
      fillExample,
      isLoading,
      errorMessage,
      successMessage,
      editableCustomerId,
      editableOrderId,
      fullPayload,
      customer,
      order,
      payment,
      isValid,
      restart,
    };
  },
});
</script>
