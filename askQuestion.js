import { createReadStream } from 'fs';
import streamJsonPkg from 'stream-json';
import streamArrayPkg from 'stream-json/streamers/StreamArray.js';
const { parser } = streamJsonPkg;
const { streamArray } = streamArrayPkg;
import axios from 'axios'

import { cosineSimilarity } from './utils.js';

export const askQuestion = async (query) => {
  const response = await axios.post(
    'https://api.cohere.ai/v1/embed',
    {
      texts: [query],
      model: 'embed-english-v3.0',
      input_type: 'search_query',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const questionEmbedding = response.data.embeddings[0].data;

  return new Promise((resolve, reject) => {
    let bestMatch = null;
    let bestScore = 0;

    const pipeline = createReadStream('./embeddings.json')
      .pipe(parser())
      .pipe(streamArray());

    pipeline.on('data', ({ value }) => {
      const score = cosineSimilarity(questionEmbedding, value.vector);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = value;
      }
    });

    pipeline.on('end', () => {
      const prompt =
        bestScore > 0.75
          ? `Answer based ONLY on this Monad doc:\n${bestMatch.text}\n\nQ: ${query}`
          : `Answer this using general knowledge:\nQ: ${query}`;

      resolve(prompt);
    });

    pipeline.on('error', (err) => {
      console.error('Streaming error:', err);
      reject(err);
    });
  });
};
