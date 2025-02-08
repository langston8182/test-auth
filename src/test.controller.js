// authController.js
import { exchangeCodeForTokens } from "./test.service.js";
import jwt from "jsonwebtoken";

/**
 * Gère le callback OAuth2 : extraction du code, échange contre des tokens,
 * définition des cookies sécurisés et redirection.
 */
export const callbackController = async (event) => {
    console.log("Traitement de /auth/callback");

    // 1. Extraction du paramètre "code"
    const code = event.queryStringParameters?.code;
    if (!code) {
        console.error("Le paramètre 'code' est manquant");
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Le paramètre 'code' est manquant" }),
        };
    }
    console.log("Code reçu :", code);

    // 2. Échange du code contre des tokens via le service
    const tokenResult = await exchangeCodeForTokens(code);
    if (tokenResult.error) {
        console.error("Erreur lors de l'échange de code contre des tokens :", tokenResult.error);
        return {
            statusCode: tokenResult.statusCode || 500,
            body: JSON.stringify({ message: "Échange de token échoué", error: tokenResult.error }),
        };
    }

    const { access_token, id_token, refresh_token } = tokenResult;
    if (!access_token || !id_token || !refresh_token) {
        console.error("Réponse incomplète lors de l'échange des tokens :", tokenResult);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Réponse de token incomplète" }),
        };
    }

    // 3. Préparation des cookies sécurisés
    const cookieOptions = "HttpOnly; Secure; SameSite=Strict; Path=/";
    const cookies = [
        `id_token=${id_token}; ${cookieOptions}`,
        `access_token=${access_token}; ${cookieOptions}`,
        `refresh_token=${refresh_token}; ${cookieOptions}`,
    ];
    console.log("Cookies à définir :", cookies);

    // 4. Redirection vers la page d'accueil
    return {
        statusCode: 302,
        headers: {
            Location: "https://test.cyrilmarchive.com",
            "Set-Cookie": cookies,
        },
        body: "",
    };
};

/**
 * Gère la récupération des informations utilisateur à partir du cookie id_token.
 */
export const userinfoController = async (event) => {
    console.log("Traitement de /userinfo");

    // 1. Récupération du header "Cookie"
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    if (!cookieHeader) {
        console.error("Aucun cookie présent dans la requête");
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cookies manquants dans la requête" }),
        };
    }
    console.log("Header Cookie :", cookieHeader);

    // 2. Analyse des cookies
    const cookies = cookieHeader.split(";").reduce((acc, cookieStr) => {
        const [name, ...rest] = cookieStr.trim().split("=");
        acc[name] = rest.join("=");
        return acc;
    }, {});
    console.log("Cookies analysés :", cookies);

    // 3. Récupération du cookie id_token
    const id_token = cookies.id_token;
    if (!id_token) {
        console.error("Cookie 'id_token' introuvable");
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cookie 'id_token' manquant" }),
        };
    }
    console.log("id_token récupéré :", id_token);

    // 4. Décodage du JWT pour extraire les informations utilisateur
    try {
        // Ici, on utilise jwt.decode() pour extraire le payload sans vérifier la signature.
        const decoded = jwt.decode(id_token);
        console.log("JWT décodé :", decoded);

        if (!decoded) {
            throw new Error("Échec du décodage du JWT");
        }

        // Extraction des informations, supposant que le payload contient 'given_name' et 'family_name'
        const { given_name, family_name } = decoded;
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                given_name: given_name || null,
                family_name: family_name || null,
            }),
        };
    } catch (error) {
        console.error("Erreur lors du décodage du JWT :", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erreur lors du décodage du token", error: error.message }),
        };
    }
};
