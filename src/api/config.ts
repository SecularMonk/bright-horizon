/**
 * @fileoverview This file defines plumbing for safely interacting with API endpoints
 */

import fetch from 'node-fetch';
import 'dotenv/config';

const BRIGHT_NETWORK_URL = process.env['BRIGHT_NETWORK_URL'];
const MAX_RETRIES = 5;
const DEFAULT_DELAY_MS = 100;

export const wrapEndpoint = <T>(endpoint: string) =>
   fetchWithRetry<T>(() => queryAPI<T>(endpoint));

function fetchWithRetry<T>(
   fetchFn: () => Promise<T | undefined>,
   maxRetries: number = MAX_RETRIES,
   delayMs: number = DEFAULT_DELAY_MS
): () => Promise<T> {
   return async function retryFn(): Promise<T> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
         const result = await fetchFn();

         if (result !== undefined) return result;

         // Exponential backoff
         if (attempt < maxRetries) {
            const waitTime = delayMs * 2 ** (attempt - 1);
            console.warn(`Retrying in ${waitTime}ms (attempt ${attempt})...`);
            await new Promise((res) => setTimeout(res, waitTime));
         }
      }

      throw new Error(`Failed after ${maxRetries} attempts`);
   };
}

async function queryAPI<ReturnValue>(
   endpoint: string
): Promise<ReturnValue | undefined> {
   try {
      const url = `${BRIGHT_NETWORK_URL}/${endpoint}`;
      const response = await fetch(url);

      if (!response.ok) {
         console.error(
            `Invalid reponse for endpoint ${endpoint} \n ${response.status} ${response.statusText}`
         );
         return undefined;
      }

      const responseText = await response.text();
      if (!responseText) return undefined;

      return JSON.parse(responseText) as ReturnValue;
   } catch (error) {
      console.error(`Failed to query endpoint ${endpoint}`);
      return undefined;
   }
}
