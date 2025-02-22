import { Account, SystemConfig } from "./types";
import { signAuthRequest, signOnboardingRequest, signOrder } from "./signature";

function handleError(error: any) {
    console.error(error.response || error);
}

// Onboarding
export async function onboardUser(config: SystemConfig, account: Account) {
    const timestamp = Date.now();
    const signature = signOnboardingRequest(config, account);

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "PARADEX-ETHEREUM-ACCOUNT": account.ethereumAccount,
        "PARADEX-STARKNET-ACCOUNT": account.address,
        "PARADEX-STARKNET-SIGNATURE": signature,
        "PARADEX-TIMESTAMP": timestamp.toString(),
    };

    try {
        const response = await fetch(`${config.apiBaseUrl}/onboarding`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                public_key: account.publicKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Onboarding successful");
    } catch (e) {
        handleError(e);
    }
}

// Auth
export async function authenticate(config: SystemConfig, account: Account) {
    const { signature, timestamp, expiration } = signAuthRequest(
        config,
        account,
    );
    const headers = {
        Accept: "application/json",
        "PARADEX-STARKNET-ACCOUNT": account.address,
        "PARADEX-STARKNET-SIGNATURE": signature,
        "PARADEX-TIMESTAMP": timestamp.toString(),
        "PARADEX-SIGNATURE-EXPIRATION": expiration.toString(),
    };

    try {
        console.log(`${config.apiBaseUrl}/auth`);
        console.log("account:", account);
        const response = await fetch(`${config.apiBaseUrl}/auth`, {
            method: "POST",
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.jwt_token;
    } catch (e) {
        handleError(e);
    }
}

// Orders - POST
export async function createOrder(
    config: SystemConfig,
    account: Account,
    orderDetails: Record<string, string>,
) {
    const timestamp = Date.now();
    const signature = signOrder(config, account, orderDetails, timestamp);

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${account.jwtToken}`,
    };

    try {
        const response = await fetch(`${config.apiBaseUrl}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                ...orderDetails,
                signature: signature,
                signature_timestamp: timestamp,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Order created:", data);
        return data;
    } catch (e) {
        handleError(e);
    }
}

// Orders - GET
export async function getOpenOrders(config: SystemConfig, account: Account) {
    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${account.jwtToken}`,
    };

    try {
        const response = await fetch(`${config.apiBaseUrl}/orders`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Open Orders:", data);
        return data;
    } catch (e) {
        handleError(e);
    }
}

// Orders - DELETE
export async function cancelAllOpenOrders(
    config: SystemConfig,
    account: Account,
    market?: string,
) {
    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${account.jwtToken}`,
    };

    const url = market
        ? `${config.apiBaseUrl}/orders?market=${market}`
        : `${config.apiBaseUrl}/orders`;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("All open orders cancelled:", data);
        return data;
    } catch (e) {
        handleError(e);
    }
}

// Markets - GET
export async function listAvailableMarkets(
    config: SystemConfig,
    market?: string,
) {
    const headers = {
        Accept: "application/json",
    };

    try {
        const url = market
            ? `${config.apiBaseUrl}/markets?market=${market}`
            : `${config.apiBaseUrl}/markets`;

        const response = await fetch(url, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Available Markets:", data);
        return data;
    } catch (e) {
        handleError(e);
    }
}

// Account - GET
export async function getAccountInfo(config: SystemConfig, account: Account) {
    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${account.jwtToken}`,
    };

    try {
        const response = await fetch(`${config.apiBaseUrl}/account`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Account Info:", data);
        return data;
    } catch (e) {
        handleError(e);
    }
}
