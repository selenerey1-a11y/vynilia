/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    /**
     * Admin API token of the custom app that stores customer reviews as
     * metaobjects. Private on purpose — only `~/lib/reviews.server` reads it.
     * Without it the review form answers with a clear error and saves nothing.
     */
    PRIVATE_ADMIN_API_TOKEN?: string;
  }
}
