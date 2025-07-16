<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Dados do Cliente</h2>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-1">Primeiro nome</label>
        <input
          v-model="modelValue.first_name"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">Último nome</label>
        <input
          v-model="modelValue.last_name"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div class="col-span-2">
        <label class="block text-sm mb-1">Email</label>
        <input
          v-model="modelValue.email"
          type="email"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">Telefone</label>
        <input
          v-model="modelValue.phone"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">IP</label>
        <input
          v-model="modelValue.ip"
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
  name: "CustomerForm",
  props: {
    modelValue: {
      type: Object as PropType<{
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        ip: string;
      }>,
      required: true,
    },
  },
});
</script>
