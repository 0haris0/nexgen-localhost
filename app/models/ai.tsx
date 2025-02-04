import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey                 : import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,

});

export const generateProductContent = async (product) =>
  {
  const {
          title,
          description,
          tags,
          productType,
        } = product;

  // Example prompt to AI for generating a new title and description
  const prompt = `Generate an optimized product title and description for a product titled "${title}", which is a "${productType}". It has tags: ${tags.join(
    ', ')}.`;

  // Use an AI service (e.g., OpenAI API) to generate suggestions
  const response = await fetch('https://api.openai.com/v1/completions', {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${process.env.OPEN_API_KEY}`,
    },
    body   : JSON.stringify({
      model     : 'text-davinci-003',
      prompt,
      max_tokens: 100,
    }),
  });

  const data = await response.json();
  return data.choices[0].text;
  };

export const generateProductData = async (product) =>
  {
  const response          = await openai.chat.completions.create({
    model            : 'gpt-4o-mini',
    messages         : [
      {
        role   : 'system',
        content: [
          {
            type: 'text',
            text:
              'Enhance this props, missing parts are category_name, product_type:\n' +
              '\n' +
              'Objective: Enhance product data to improve SEO, visibility, and user engagement. The AI should suggest updates for the product title, description, tags, SEO title, and SEO description fields, making them optimized and engaging. These enhancements should be specific and follow Shopify best practices.\n' +
              '\n' +
              'Product Title:\n' +
              '\n' +
              'Generate a compelling, clear product title that includes relevant keywords, is concise, and accurately reflects the product’s unique features or main benefits.\n' +
              'Product Description:\n' +
              '\n' +
              'Rewrite the description to make it engaging, informative, and optimized for SEO. Emphasize key product details, value propositions, and any unique selling points.\n' +
              'Ensure that the description uses structured formatting if applicable (e.g., bullet points for lists, short paragraphs).\n' +
              'Tags:\n' +
              '\n' +
              'Generate a list of relevant tags that reflect the product\'s category, characteristics, use cases, and any trending keywords related to the product type.\n' +
              'Ensure tags are relevant to customer search behavior and specific to the product niche.\n' +
              'SEO Title:\n' +
              '\n' +
              'Create an SEO-friendly title that is concise, includes primary keywords, and is within the recommended character limit (about 60 characters).\n' +
              'Make sure the title remains natural and avoids keyword stuffing.\n' +
              'SEO Description:\n' +
              '\n' +
              'Write an optimized SEO description that is informative and inviting, includes relevant keywords, and stays within the recommended 155–160 character limit.\n' +
              'Ensure the description reflects the product\'s main benefits and encourages clicks.\n' +
              'Tags and Categories:\n' +
              '\n' +
              'Based on the provided taxonomies, suggest or adjust tags and categories to ensure they are aligned with Shopify’s latest taxonomy guidelines for optimal organization and searchability.\n' +
              '\n' +
              'Expected Output:\n' +
              '\n' +
              'Return each enhanced field with clear labels (e.g., newTitle,newCategoryName, newProductType,newDescription, newTags, newSeoTitle, newSeoDescription) together with (id,shopify_id) to ensure easy integration into the product data fields. ALWAYS USE SAME SCHEMA FOR RETURN, EVEN IF FIELDS ARE EMPTY.',
          },
        ],
      },
      {
        role   : 'user',
        content: [
          {
            type: 'text',
            text: JSON.stringify(product),
          },
        ],
      },
    ],
    temperature      : 1,
    max_tokens       : 2000,
    top_p            : 1,
    frequency_penalty: 0,
    presence_penalty : 0,
    response_format  : {
      type: 'text',
    },
  });
  const assistantResponse = response.choices[0].message.content;
  return assistantResponse.replace(/```json|```/g, '').trim();
  };
