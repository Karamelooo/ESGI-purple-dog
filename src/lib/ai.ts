export async function generateText(prompt: string) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3', // Default model, can be changed
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            // Fallback or error handling
            console.error("Ollama error:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("AI Generation failed:", error);
        return null;
    }
}

export async function estimatePrice(title: string, description: string) {
    const prompt = `Estime le prix en euros pour cet objet. Réponds UNIQUEMENT avec un chiffre ou une fourchette de prix (ex: 50-100). Titre: ${title}. Description: ${description}.`;
    return await generateText(prompt);
}
