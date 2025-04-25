import fs from 'fs';
import axios from 'axios';
import { chunkText } from './utils.js';
import readline from 'readline';

// Cohere embedding function
const cohereEmbed = async (texts) => {
  const response = await axios.post(
    'https://api.cohere.ai/v1/embed',
    {
      texts,
      model: 'embed-english-v3.0',
      input_type: 'search_document',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.embeddings;
};

// Function to process and embed file stream-wise
export const embedFullFile = async () => {
  const filePath = './scraping/monad.txt';
  const readStream = fs.createReadStream(filePath, 'utf-8');
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  let currentText = '';
  const batchSize = 20;
  const embeddings = [];

  for await (const line of rl) {
    currentText += line;

    // Process text in chunks when the currentText reaches a certain size (e.g., 300 words)
    if (currentText.split(' ').length >= 300) {
      const chunks = chunkText(currentText);
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const vectors = await cohereEmbed(batch);
        for (let j = 0; j < batch.length; j++) {
          embeddings.push({ text: batch[j], vector: vectors[j] });
        }
      }
      currentText = ''; // Clear currentText to start a new chunk
    }
  }

  // Write embeddings to file after processing the entire stream
  fs.writeFileSync('./embeddings.json', JSON.stringify(embeddings, null, 2));
  console.log(`✅ Embedded ${embeddings.length} chunks from the full monad.txt.`);
  return embeddings;
};

embedFullFile();
