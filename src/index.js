// index.js
import {callbackController, protectedController, userinfoController} from "./test.controller.js";

export const handler = async (event) => {
    console.log("Événement reçu :", JSON.stringify(event, null, 2));

    // Détermine la route à partir du chemin de la requête
    const path = event.path || event.requestContext?.http?.path;
    console.log("Dispatch de la requête pour le chemin :", path);

    if (path === "/auth/callback") {
        return await callbackController(event);
    } else if (path === "/protected")  {
        return await protectedController(event)
    } else if (path === "/userinfo") {
        return await userinfoController(event);
    } else {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Not Found" }),
        };
    }
};
