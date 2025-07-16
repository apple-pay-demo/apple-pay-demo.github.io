<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Pagamento</h2>
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block text-sm mb-1">Parcelas</label>
        <select
          v-model="modelValue.payment_data.apple_pay.installments"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option v-for="n in 12" :key="n" :value="String(n)">{{ n }}x</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">Documento</label>
        <input
          v-model="modelValue.payment_data.apple_pay.holder_document_number"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">Descriptor</label>
        <input
          v-model="modelValue.payment_data.apple_pay.soft_descriptor"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  name: "PaymentForm",
  props: {
    modelValue: {
      type: Object as PropType<{
        payment_data: {
          apple_pay: {
            installments: string;
            holder_document_number: string;
            soft_descriptor: string;
            transaction_identifier: string;
          };
        };
      }>,
      required: true,
    },
  },
});
</script>
