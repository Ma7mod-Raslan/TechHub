// src/GoogleGSIButton.tsx
import React, { useEffect } from "react";

type Props = {
  clientId: string;
  onCredential: (response: any) => void; // parent callback (handleGsiCallback)
  buttonId?: string; // optional id for container
  renderOptions?: Record<string, any>; // optional renderButton options
};

declare global {
  interface Window {
    google?: any;
    __gsi_initialized?: boolean;
  }
}

export default function GoogleGSIButton({ clientId, onCredential, buttonId = "gsi-button", renderOptions = {} }: Props) {
  useEffect(() => {
    if (!clientId) {
      console.warn("GoogleGSIButton: clientId not provided");
      return;
    }

    const init = () => {
      if (!(window as any).google || !(window as any).google.accounts || !(window as any).google.accounts.id) {
        // script not loaded yet
        return;
      }

      // mark initialized so other components can check
      (window as any).__gsi_initialized = true;

      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            // delegate to parent handler (Login/SignUp)
            if (typeof onCredential === "function") onCredential(response);
          },
        });

        // render the official Google button into our container (optional)
        const el = document.getElementById(buttonId);
        if (el) {
          (window as any).google.accounts.id.renderButton(
            el,
            {
              theme: "outline",
              size: "large",
              width: 300,
              ...renderOptions,
            }
          );
        }
      } catch (err) {
        console.warn("GoogleGSIButton init error:", err);
      }
    };

    // ensure script is on the page (only add once)
    const scriptId = "google-identity-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      script.onerror = () => console.warn("Failed to load Google Identity Services script");
      document.head.appendChild(script);
    } else {
      // try init immediately if script already present
      init();
    }

    // cleanup: remove rendered button html when component unmounts
    return () => {
      const el = document.getElementById(buttonId);
      if (el) el.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, onCredential, buttonId]);

  return <div id={buttonId} style={{ display: "flex", justifyContent: "center" }} />;
}
