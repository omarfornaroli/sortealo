'use server';
/**
 * @fileOverview A Genkit flow for generating engaging marketing descriptions for raffle prizes.
 *
 * - generateRaffleDescription - A function that handles the generation of raffle descriptions.
 * - GenerateRaffleDescriptionInput - The input type for the generateRaffleDescription function.
 * - GenerateRaffleDescriptionOutput - The return type for the generateRaffleDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRaffleDescriptionInputSchema = z.object({
  title: z.string().describe('The title or name of the raffle prize.'),
  description: z
    .string()
    .describe('A detailed factual description of the raffle prize.'),
  imagesDescriptions: z
    .array(z.string())
    .optional()
    .describe(
      'An optional array of short textual descriptions of the key visual elements seen in the prize images.'
    ),
  ticketPrice: z.number().describe('The price per ticket for the raffle.'),
  maxTickets: z
    .number()
    .int()
    .positive()
    .describe('The maximum number of tickets available for the raffle.'),
});
export type GenerateRaffleDescriptionInput = z.infer<
  typeof GenerateRaffleDescriptionInputSchema
>;

const GenerateRaffleDescriptionOutputSchema = z.object({
  marketingDescription: z
    .string()
    .describe('A persuasive and engaging marketing description for the raffle prize.'),
});
export type GenerateRaffleDescriptionOutput = z.infer<
  typeof GenerateRaffleDescriptionOutputSchema
>;

export async function generateRaffleDescription(
  input: GenerateRaffleDescriptionInput
): Promise<GenerateRaffleDescriptionOutput> {
  return generateRaffleDescriptionFlow(input);
}

const generateRaffleDescriptionPrompt = ai.definePrompt({
  name: 'generateRaffleDescriptionPrompt',
  input: { schema: GenerateRaffleDescriptionInputSchema },
  output: { schema: GenerateRaffleDescriptionOutputSchema },
  prompt: `You are an expert marketing copywriter for a premium online raffle platform called "Sortealo".
Your goal is to create highly engaging and persuasive marketing descriptions for raffle prizes to maximize ticket sales.
Use the provided prize details to craft a compelling description that highlights the value, exclusivity, and excitement of winning.
Keep the tone professional, aspirational, and slightly urgent.

Prize Details:
Title: {{{title}}}
Description: {{{description}}}
Price per ticket: {{{ticketPrice}}}
Total tickets available: {{{maxTickets}}}

{{#if imagesDescriptions}}
Key visual elements from images:
{{#each imagesDescriptions}}
- {{{this}}}
{{/each}}
{{/if}}

Craft a marketing description that is between 150-300 words. Focus on benefits, luxury, and the unique opportunity.
Start with a captivating hook and end with a clear call to action to buy tickets now before they are gone.
`,
});

const generateRaffleDescriptionFlow = ai.defineFlow(
  {
    name: 'generateRaffleDescriptionFlow',
    inputSchema: GenerateRaffleDescriptionInputSchema,
    outputSchema: GenerateRaffleDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await generateRaffleDescriptionPrompt(input);
    return output!;
  }
);
