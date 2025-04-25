export const cosineSimilarity = (vecA, vecB) => {
    const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0); 
    const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dot / (normA * normB)
}


export const chunkText = (text, maxTokens = 300, overlap = 50) => {
    const sentences = text.split(/(?<=[.?!])\s+/)
    const chunks = []
    let chunk = []

    for (let i = 0; i < sentences.length; i++) {
        chunk.push(sentences[i]);

        const currentLength = chunk.join(" ").split(" ").length;

        if (currentLength >= maxTokens) {
            chunks.push(chunk.join(" "))
            i -= overlap;
            chunk = []

        }
    }

    if (chunk.length) chunks.push(chunk.join(" "))
    
    return chunks
}





















