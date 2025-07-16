<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Dados do Pedido</h2>
    <!-- Valores Gerais -->
    <div class="flex items-center space-x-2 mb-2">
      <div>
        <label class="block text-sm mb-1">Valor produtos</label>
        <input
          v-model.number="modelValue.products_value"
          type="number"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">Desconto</label>
        <input
          v-model.number="modelValue.discount_value"
          type="number"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">Frete</label>
        <input
          v-model.number="modelValue.shipping_value"
          type="number"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
    </div>

    <!-- Lista de Produtos -->
    <div class="mb-4">
      <h3 class="font-medium mb-2">Produtos</h3>
      <div
        v-for="(prod, i) in modelValue.products"
        :key="i"
        class="flex items-end space-x-2 mb-2"
      >
        <input
          v-model="prod.sku"
          placeholder="SKU"
          class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
        <input
          v-model="prod.name"
          placeholder="Nome"
          class="max-w-[200px] flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
        <input
          v-model.number="prod.quantity"
          type="number"
          placeholder="Qtd"
          class="w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 appearance-none"
        />
        <button
          v-if="modelValue.products.length > 1"
          type="button"
          @click="removeProduct(i)"
          class="self-center text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </div>
      <button
        type="button"
        @click="addProduct"
        class="mt-2 px-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition"
      >
        + Adicionar produto
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  name: "OrderForm",
  props: {
    modelValue: {
      type: Object as PropType<{
        products_value: number;
        discount_value: number;
        shipping_value: number;
        products: Array<{ sku: string; name: string; quantity: number }>;
      }>,
      required: true,
    },
  },
  setup(props) {
    function addProduct() {
      props.modelValue.products.push({ sku: "", name: "", quantity: 1 });
    }
    function removeProduct(index: number) {
      props.modelValue.products.splice(index, 1);
    }
    return { addProduct, removeProduct };
  },
});
</script>
