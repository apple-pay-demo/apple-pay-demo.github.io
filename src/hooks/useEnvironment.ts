import { ref } from "vue";

export function useEnvironment() {
  const mode = ref<"local" | "sandbox" | "sandbox-local" | "prod">("local");

  function setMode(m: "local" | "sandbox" | "sandbox-local" | "prod") {
    mode.value = m;
  }

  return { mode, setMode };
}
