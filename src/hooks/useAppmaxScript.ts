import { onMounted, watch } from "vue";
import type { Ref } from "vue";

interface UpdatedCheckoutData {
  total: number;
  freight?: number;
  discount?: number;
  installments?: number;
  products?: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

interface UseAppmaxScriptOptions {
  environment: Ref<"local" | "sandbox" | "sandbox-local" | "prod">;
  externalId: number;
  onSuccess: (token?: any) => void;
  onError: (error: unknown) => void;
  onUpdate: () => UpdatedCheckoutData;
}

export function useAppmaxScript({
  environment,
  externalId,
  onSuccess,
  onError,
  onUpdate,
}: UseAppmaxScriptOptions) {
  function loadAndInit() {
    // remove script antigo
    const prev = document.getElementById("appmax-script");
    if (prev) prev.remove();

    // determina a URL do script
    let src: string;
    if (environment.value === "prod") {
      src = "https://scripts.appmax.com.br/appmax.min.js";
    } else if (
      environment.value === "sandbox-local" ||
      environment.value === "local"
    ) {
      src = "/appmax.min.js";
    } else {
      src = "https://scripts.sandboxappmax.com.br/appmax.min.js";
    }

    // injeta
    const script = document.createElement("script");
    script.id = "appmax-script";
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (window.AppmaxScripts) {
        window.AppmaxScripts.init(onSuccess, onError, externalId, onUpdate);
      }
    };
    document.head.appendChild(script);
  }

  // carrega na montagem e sempre que o ambiente mudar
  onMounted(loadAndInit);
  watch(environment, loadAndInit);
}
