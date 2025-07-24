import { onMounted } from "vue";
import { Env } from "../helpers/Env";

declare global {
  interface Window {
    AppmaxScripts?: {
      init: (
        onSuccess: () => boolean | Promise<boolean>,
        onError: (error: unknown) => void,
        externalId: number,
        onUpdate: () => UpdatedCheckoutData,
        onAuthorize?: (appleToken: any) => boolean | Promise<boolean>
      ) => void;
    };
  }
}

export interface UpdatedCheckoutData {
  orderId: string;
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

export interface UseAppmaxScriptOptions {
  externalId: number;
  onSuccess: () => boolean | Promise<boolean>;
  onError: (error: unknown) => void;
  onUpdate: () => UpdatedCheckoutData;
  onAuthorize?: (appleToken: any) => boolean | Promise<boolean>;
}

export function useAppmaxScript({
  externalId,
  onSuccess,
  onError,
  onUpdate,
  onAuthorize = () => true,
}: UseAppmaxScriptOptions) {
  function loadAndInit() {
    const prev = document.getElementById("appmax-script");
    if (prev) prev.remove();

    // const scriptUrl = Env.APPMAX_SCRIPT_URL;
    const scriptUrl = "https://scripts.appmax.com.br/appmax.min.js?v=1.0.0";
    if (!scriptUrl) {
      console.error(
        "[useAppmaxScript] variável VITE_APPMAX_SCRIPT_URL não definida"
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "appmax-script";
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      if (window.AppmaxScripts) {
        window.AppmaxScripts.init(
          onSuccess,
          onError,
          externalId,
          onUpdate,
          onAuthorize
        );
      }
    };
    document.head.appendChild(script);
  }

  onMounted(loadAndInit);
}
