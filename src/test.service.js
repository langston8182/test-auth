// authService.js
/**
 * Échange le code OAuth2 contre des tokens en appelant l'endpoint OAuth2.
 */
export const exchangeCodeForTokens = async (code) => {
    const tokenUrl = "https://auth.cyrilmarchive.com/oauth2/token";
    const client_id = process.env.CLIENT_ID;
    const redirect_uri = process.env.REDIRECT_URI;
    const client_secret = process.env.CLIENT_SECRET; // Optionnel

    // Construction du corps de la requête en URL-encodé
    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("redirect_uri", redirect_uri);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    if (client_secret) {
        params.append("client_secret", client_secret);
    }

    console.log("Payload pour l'échange de tokens :", params.toString());

    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });
        const tokenData = await response.json();
        console.log("Réponse de l'échange de tokens :", tokenData);

        if (!response.ok) {
            return { error: tokenData, statusCode: response.status };
        }
        return tokenData;
    } catch (error) {
        console.error("Erreur durant l'échange de tokens :", error);
        return { error: error.message, statusCode: 500 };
    }
};
