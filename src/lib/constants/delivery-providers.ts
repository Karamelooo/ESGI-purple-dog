
export interface DeliveryProviderField {
    name: string;
    label: string;
    type: 'text' | 'password';
    required: boolean;
    placeholder?: string;
    description?: string;
}

export interface DeliveryProvider {
    name: string;
    slug: string;
    description: string;
    logo?: string; // Could be a path to a logo
    fields: DeliveryProviderField[];
}

export const DELIVERY_PROVIDERS: DeliveryProvider[] = [
    {
        name: "Convelio",
        slug: "convelio",
        description: "Specialized in fine art shipping and logistics.",
        fields: [
            { name: "apiKey", label: "API Key", type: "password", required: true, description: "Your Convelio API Key" }
        ]
    },
    {
        name: "DHL Freight",
        slug: "dhl-freight",
        description: "Reliable transport for large and heavy shipments.",
        fields: [
            { name: "clientId", label: "Client ID", type: "text", required: true },
            { name: "clientSecret", label: "Client Secret", type: "password", required: true },
            { name: "accountNumber", label: "Account Number", type: "text", required: true }
        ]
    },
    {
        name: "The Packengers",
        slug: "the-packengers",
        description: "Packing and shipping for arts and luxury items.",
        fields: [
            { name: "apiToken", label: "API Token", type: "password", required: true },
            { name: "partnerId", label: "Partner ID", type: "text", required: true }
        ]
    },
    {
        name: "UPS Supply Chain",
        slug: "ups-scs",
        description: "Global logistics for freight and supply chain.",
        fields: [
            { name: "accessKey", label: "Access Key", type: "password", required: true },
            { name: "username", label: "Username", type: "text", required: true },
            { name: "password", label: "Password", type: "password", required: true }
        ]
    }
];
