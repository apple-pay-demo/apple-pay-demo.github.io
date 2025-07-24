<template>
  <form class="min-h-screen bg-gray-100 p-6 text-gray-900" @submit.prevent>
    <div class="max-w-xl mx-auto space-y-6">
      <div v-if="isLoading" class="bg-white rounded-lg shadow p-6 text-center">
        <p class="text-2xl font-semibold mb-4">Processando pagamento...</p>
        <p>Por favor, aguarde enquanto finalizamos sua transação.</p>
      </div>
      <!-- aviso de sucesso -->
      <div
        v-if="successMessage"
        class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4"
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
      </div>
      <!-- aviso de erro -->
      <div
        v-if="errorMessage"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
        role="alert"
      >
        <p class="font-bold">Erro</p>
        <p>{{ errorMessage }}</p>
      </div>
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
      <!-- formulário -->
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
import { defineComponent, ref } from "vue";
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
    // estados de loading e erro
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const successMessage = ref<Record<string, any> | null>(null);

    // callbacks Appmax
    async function onSuccess() {
      errorMessage.value = null;
      return true;
    }

    async function onAuthorize(appleToken: any) {
      errorMessage.value = null;
      await pay(appleToken);
      successMessage.value = { ...successMessage.value, appleToken };
      return true;
    }

    function onError(err: unknown) {
      errorMessage.value = JSON.stringify(err);
    }

    function onUpdate() {
      return {
        orderId: `order-${Date.now()}`, // Adding the required orderId field
        total:
          order.products_value + order.shipping_value - order.discount_value,
        freight: order.shipping_value,
        discount: order.discount_value,
        installments: Number(payment.payment_data.apple_pay.installments),
        products: order.products.map((product) => ({
          name: product.name,
          price: order.products_value / order.products.length,
          quantity: product.quantity,
        })),
      };
    }

    // injeta script e inicializa AppmaxScripts
    useAppmaxScript({
      externalId: 123,
      onSuccess,
      onError,
      onUpdate,
      onAuthorize,
    });
    const bearerDefault = "eyJhbGciOiJSUzI1NiIsInR";
    const fillExample = () => {
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
        installments: "2",
        holder_document_number: "19100000000",
        soft_descriptor: "MINHALOJA",
      });
    };

    interface ApplePayToken {
      paymentData: {
        data: string;
        signature: string;
        header: {
          publicKeyHash: string;
          ephemeralPublicKey: string;
          transactionId: string;
        };
        version: string;
      };
      paymentMethod: {
        displayName: string;
        network: string;
        type: string;
      };
      transactionIdentifier: string;
    }

    async function mockPay(appleToken: ApplePayToken) {
      console.log("Mock paying with Apple Pay", appleToken);

      // mesmo guard da real
      if (!isValid || isLoading.value) return;

      isLoading.value = true;
      errorMessage.value = null;

      try {
        // monta o mesmo fakeToken que a função real monta
        const fakeToken = {
          payment_data: {
            data: appleToken.paymentData.data,
            signature: appleToken.paymentData.signature,
            header: {
              publicKeyHash: appleToken.paymentData.header.publicKeyHash,
              ephemeralPublicKey:
                appleToken.paymentData.header.ephemeralPublicKey,
              transactionId: appleToken.paymentData.header.transactionId,
            },
            version: appleToken.paymentData.version,
          },
          payment_method: {
            displayName: appleToken.paymentMethod.displayName,
            network: appleToken.paymentMethod.network,
            type: appleToken.paymentMethod.type,
          },
          transaction_identifier: appleToken.transactionIdentifier,
        };

        // simula a resposta que viria do fetch
        const result = {
          customer: { data: { customer: { id: "mock-customer-id" } } },
          order: { data: { order: { id: "mock-order-id", status: "paid" } } },
          payment: {
            data: {
              payment: { pay_reference: "mock-ref", upsell_hash: "mock-hash" },
            },
          },
        };

        // popula o successMessage exatamente como na real
        successMessage.value = {
          customerId: result.customer.data.customer.id,
          orderId: result.order.data.order.id,
          orderStatus: result.order.data.order.status,
          pay_reference: result.payment.data.payment.pay_reference,
          upsell_hash: result.payment.data.payment.upsell_hash,
          appleToken: fakeToken, // inclui o token para visualização
        };
      } catch (err: any) {
        // trata erro igual à real
        successMessage.value = null;
        errorMessage.value = err.message || String(err);
      } finally {
        isLoading.value = false;
      }
    }

    // função de pagamento com loading e tratamento de erro
    const pay = async (appleToken: ApplePayToken) => {
      console.log("Paying with Apple Pay", appleToken);
      if (!isValid || isLoading.value) return;
      isLoading.value = true;
      // const { paymentData, paymentMethod, transactionIdentifier } = appleToken;
      const fakeToken = {
        payment_data: {
          data: "bhZ2cOkuRmtK5yS2TuLYlGsRSXpwq0y6ONSinTJyfyxemb/94iW49fe4qaUQXanP5NfKP8lans8NEOq9Fy9YlLDD6V/nM3KRqfA2cZVtgzizpEYoZdX7dB2sW3mMuQpf1f/iwDL2Nbc7TqQ40BsLALaYcCyzUIfjTyhmlLyaVEEA1w7Zazm0J7oC1mLLDs3m9hm68Cno1clVclLUZUywXx6C44U7jlR30drWVpVqasRx/fxLl5z603IgUg4BBq38VdsZv0qmhT4MMlBwNrSCIWDxGjPtPx4SarFh/P1/o9h8avn7tttUEIbYKnqLdQUdMa0D+v3eltKqECqXvOBK5Dyhcsrh/fuNQUm6R1LxKIgKVPJzm1XWoCKrZ8Rk3p+7nAmeSX8LC6tE+Vzl43mefFsjzs3zfD2EUQqwQWrQ9hU=",
          signature:
            "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",
          header: {
            publicKeyHash: "xQiDLOvxMW/xPEIjogYSZBcwkn8uCpgS77ykmI5406g=",
            ephemeralPublicKey:
              "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDYIDn6Wu/HbEL/cHaU9n41iwJig1GPbowphe5TBTmZwEKv4u0ntW6E7dlc94iG3wmbT3XvpkhdpHkbaPQXk8aA==",
            transactionId:
              "af1252480b5d7f4cfd12e17f45df898bb816dec225b3d55380b9339983044978",
          },
          version: "EC_v1",
        },
        payment_method: {
          displayName: "Visa 0121",
          network: "Visa",
          type: "credit",
        },
        transaction_identifier:
          "af1252480b5d7f4cfd12e17f45df898bb816dec225b3d55380b9339983044978",
      };
      try {
        // const paymentPayload = {
        //   order,
        //   customer,
        //   payment_data: {
        //     apple_pay: {
        //       installments: payment.payment_data.apple_pay.installments,
        //       holder_document_number: payment.payment_data.apple_pay.holder_document_number,
        //       soft_descriptor: payment.payment_data.apple_pay.soft_descriptor,
        //       payment_data: {
        //         data: paymentData.data,
        //         signature: paymentData.signature,
        //         header: {
        //             publicKeyHash: paymentData.header.publicKeyHash,
        //             ephemeralPublicKey: paymentData.header.ephemeralPublicKey,
        //             transactionId: paymentData.header.transactionId
        //         },
        //         version: paymentData.version,
        //       },
        //       payment_method: {
        //           displayName: paymentMethod.displayName,
        //           network: paymentMethod.network,
        //           type: paymentMethod.type,
        //       },
        //       transaction_identifier: transactionIdentifier,
        //     },
        //   },
        //   env: mode.value,
        //   token: token.value,
        // };
        const paymentPayload = {
          order,
          customer,
          payment_data: {
            apple_pay: {
              installments: payment.payment_data.apple_pay.installments,
              holder_document_number:
                payment.payment_data.apple_pay.holder_document_number,
              soft_descriptor: payment.payment_data.apple_pay.soft_descriptor,
              payment_data: {
                data: fakeToken.payment_data.data,
                signature: fakeToken.payment_data.signature,
                header: {
                  publicKeyHash: fakeToken.payment_data.header.publicKeyHash,
                  ephemeralPublicKey:
                    fakeToken.payment_data.header.ephemeralPublicKey,
                  transactionId: fakeToken.payment_data.header.transactionId,
                },
                version: fakeToken.payment_data.version,
              },
              payment_method: {
                displayName: fakeToken.payment_method.displayName,
                network: fakeToken.payment_method.network,
                type: fakeToken.payment_method.type,
              },
              transaction_identifier: fakeToken.transaction_identifier,
            },
          },
          env: "local", // Use the mode directly here
          token: token.value,
        };
        const res = await fetch("https://localhost:4000/api/v1/pay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify(paymentPayload),
        });
        const result = await res.json();
        console.log("Payment result:", result);
        successMessage.value = {
          customerId: result.customer.data.customer.id,
          orderId: result.order.data.order.id,
          orderStatus: result.order.data.order.status,
          pay_reference: result.payment.data.payment.pay_reference,
          upsell_hash: result.payment.data.payment.upsell_hash,
        };
        if (!res.ok || result.error) {
          throw new Error(result.error || "Erro no pagamento");
        }
      } catch (err: any) {
        successMessage.value = null;
        errorMessage.value = JSON.stringify(err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    return {
      token,
      fillExample,
      pay: mockPay,
      customer,
      order,
      payment,
      isValid,
      isLoading,
      errorMessage,
      successMessage,
      restart: () => {
        location.reload();
      },
    };
  },
});
</script>
