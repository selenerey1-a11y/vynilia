/**
 * Creates the `product_review` metaobject definition in the Shopify store, so
 * reviews submitted from the storefront have somewhere to live.
 *
 *   npm run setup:reviews
 *
 * Needs PRIVATE_ADMIN_API_TOKEN (custom app, scope write_metaobjects +
 * read_metaobject_definitions) and PUBLIC_STORE_DOMAIN in .env.
 * Safe to run twice: an existing definition is reported, not overwritten.
 */
import {readFileSync} from 'node:fs';

const ADMIN_API_VERSION = '2026-04';

function readEnv() {
  const env = {...process.env};
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      // .env values are often quoted; the API wants the bare string.
      env[key] = rawValue.trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // No .env file: fall back to whatever the shell already exports.
  }
  return env;
}

const DEFINITION = {
  name: 'Reseña de producto',
  type: 'product_review',
  description:
    'Reseñas enviadas desde la tienda. Se crean en borrador: publica una para que aparezca en la página del producto.',
  access: {storefront: 'PUBLIC_READ'},
  capabilities: {publishable: {enabled: true}},
  displayNameKey: 'author',
  fieldDefinitions: [
    {
      key: 'product',
      name: 'Producto (handle)',
      type: 'single_line_text_field',
      required: true,
    },
    {key: 'author', name: 'Nombre', type: 'single_line_text_field', required: true},
    {
      key: 'rating',
      name: 'Estrellas',
      type: 'number_integer',
      required: true,
      validations: [
        {name: 'min', value: '1'},
        {name: 'max', value: '5'},
      ],
    },
    {key: 'body', name: 'Reseña', type: 'multi_line_text_field', required: true},
    {key: 'variant', name: 'Versión comprada', type: 'single_line_text_field'},
    {key: 'date', name: 'Fecha', type: 'date'},
    {key: 'verified', name: 'Compra verificada', type: 'boolean'},
  ],
};

const MUTATION = `
  mutation CreateReviewDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition {
        id
        type
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const env = readEnv();
const token = env.PRIVATE_ADMIN_API_TOKEN;
const shop = env.PUBLIC_STORE_DOMAIN;

if (!token || !shop) {
  console.error(
    '✗ Faltan PRIVATE_ADMIN_API_TOKEN o PUBLIC_STORE_DOMAIN en .env.\n' +
      '  Crea una app personalizada en el admin de Shopify (Configuración →\n' +
      '  Apps y canales de venta → Desarrollar apps), dale los permisos\n' +
      '  write_metaobjects y read_metaobject_definitions, instálala y copia el\n' +
      '  token de acceso Admin API en .env como PRIVATE_ADMIN_API_TOKEN.',
  );
  process.exit(1);
}

const response = await fetch(
  `https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query: MUTATION, variables: {definition: DEFINITION}}),
  },
);

if (!response.ok) {
  console.error(`✗ Shopify respondió ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const body = await response.json();
const result = body.data?.metaobjectDefinitionCreate;
const userErrors = result?.userErrors ?? [];

if (body.errors?.length) {
  console.error('✗ Error de la Admin API:', JSON.stringify(body.errors, null, 2));
  process.exit(1);
}

if (userErrors.some((error) => error.code === 'TAKEN')) {
  console.log('✓ La definición «product_review» ya existía. Nada que hacer.');
  process.exit(0);
}

if (userErrors.length) {
  console.error('✗ Shopify rechazó la definición:', JSON.stringify(userErrors, null, 2));
  process.exit(1);
}

console.log(
  `✓ Definición creada: ${result.metaobjectDefinition.type} (${result.metaobjectDefinition.id})\n` +
    '  Las reseñas nuevas aparecerán en Contenido → Metaobjetos → Reseña de producto,\n' +
    '  en borrador. Publica una para que salga en la página del producto.',
);
