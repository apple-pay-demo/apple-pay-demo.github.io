<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Dados do Pedido</h2>
    <!-- Valores Gerais -->
    <div class="flex flex-wrap items-center gap-2 mb-2">
      <!-- Valor Total (não editável) -->
      <div class="flex-1 min-w-0">
        <label class="block text-sm mb-1">Valor total</label>
        <input
          :value="
            (
              productTotal -
              modelValue.discount_value +
              modelValue.shipping_value
            ).toFixed(2)
          "
          type="number"
          disabled
          class="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 cursor-not-allowed"
        />
      </div>

      <!-- Valor Produtos (não editável) -->
      <div class="flex-1 min-w-0">
        <label class="block text-sm mb-1">Valor produtos</label>
        <input
          :value="productTotal.toFixed(2)"
          type="number"
          disabled
          class="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 cursor-not-allowed"
        />
      </div>

      <!-- Desconto -->
      <div class="flex-shrink-0 w-32">
        <label class="block text-sm mb-1">Desconto</label>
        <input
          v-model.number="modelValue.discount_value"
          type="number"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>

      <!-- Frete -->
      <div class="flex-shrink-0 w-32">
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
        class="flex items-end space-x-2 mb-2 min-w-0"
      >
        <input
          v-model="prod.sku"
          placeholder="SKU"
          class="flex-shrink-0 w-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />

        <input
          v-model="prod.name"
          placeholder="Nome"
          class="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />

        <input
          v-model.number="prod.price"
          type="number"
          placeholder="Preço"
          class="flex-shrink-0 w-28 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />

        <input
          v-model.number="prod.quantity"
          type="number"
          placeholder="Qtd"
          class="flex-shrink-0 w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 appearance-none"
        />

        <button
          v-if="modelValue.products.length > 1"
          type="button"
          @click="removeProduct(i)"
          class="self-center text-red-600 hover:text-red-800 flex-shrink-0"
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
import { defineComponent, computed, watch } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  name: "OrderForm",
  props: {
    modelValue: {
      type: Object as PropType<{
        products_value: number;
        discount_value: number;
        shipping_value: number;
        products: Array<{
          sku: string;
          name: string;
          price: number;
          quantity: number;
        }>;
      }>,
      required: true,
    },
  },
  setup(props) {
    // Computed: soma (price * quantity) de todos os produtos
    const productTotal = computed(() =>
      props.modelValue.products.reduce(
        (sum, prod) => sum + prod.price * prod.quantity,
        0
      )
    );

    // Atualiza modelValue.products_value sempre que mudar o total
    watch(
      productTotal,
      (val) => {
        props.modelValue.products_value = val;
      },
      { immediate: true }
    );

    function addProduct() {
      props.modelValue.products.push({
        sku: "",
        name: "",
        price: 0,
        quantity: 1,
      });
    }
    function removeProduct(index: number) {
      props.modelValue.products.splice(index, 1);
    }

    return {
      productTotal,
      addProduct,
      removeProduct,
    };
  },
});
</script>
