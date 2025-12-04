import React, { useEffect } from "react";
import api from "./api";

const CLIENT_ID = "38486372947-stsff1798ia95ul5n1corp5lcndv3d2r.apps.googleusercontent.com";

export default function GoogleGSIButton() {
    useEffect(() => {
        // Wait until google script loaded
        const tryInit = () => {
            if (!(window as any).google) {
                // try again shortly (script might still be loading)
                setTimeout(tryInit, 200);
                return;
            }

            (window as any).google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
            });

            (window as any).google.accounts.id.renderButton(
                document.getElementById("gsi-button"),
                { theme: "outline", size: "large", width: "300" } // options
            );
        };

        tryInit();

        return () => {
            const el = document.getElementById("gsi-button");
            if (el) el.innerHTML = "";
        };
    }, []);

    async function handleCredentialResponse(response: any) {
        const idToken: string | undefined = response?.credential;
        if (!idToken) {
            console.error("No credential returned from Google");
            return;
        }

        try {
            const payload = JSON.parse(atob(idToken.split(".")[1]));
            console.log("GSI payload:", payload);
        } catch (e) {
            console.warn("Could not decode id_token payload", e);
        }

        try {
            const res = await api.post("/auth/google", { id_token: idToken });
            const { token, user } = res.data;
            localStorage.setItem("accessToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            console.log("Logged in via backend:", user);
        } catch (err: any) {
            console.error("Backend error on /auth/google:", err?.response?.data || err);
        }
    }

    return <div id="gsi-button"></div>;
}
