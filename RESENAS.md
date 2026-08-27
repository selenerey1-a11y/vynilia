# Reseñas de clientes

El botón **«Escribir una reseña»** de la página de producto guarda cada reseña en
tu propia tienda de Shopify, como *metaobjeto* del tipo `product_review`.

Se crean **en borrador**: la Storefront API sólo devuelve las publicadas, así que
nada aparece en la web hasta que tú la apruebas. Eso es lo que evita que
cualquiera publique lo que quiera en tu página.

## Puesta en marcha (una sola vez)

1. En el admin de Shopify: **Configuración → Apps y canales de venta →
   Desarrollar apps → Crear una app**. Ponle de nombre `Vynilia reseñas`.
2. En **Configuración → Admin API**, dale estos permisos:
   `write_metaobjects` y `read_metaobject_definitions`.
3. **Instalar la app** y copiar el *token de acceso de Admin API*
   (empieza por `shpat_`; sólo se muestra una vez).
4. Añádelo al archivo `.env` de este proyecto:

   ```
   PRIVATE_ADMIN_API_TOKEN=shpat_...
   ```

5. Crea la definición del metaobjeto:

   ```
   npm run setup:reviews
   ```

6. Antes de desplegar, añade también `PRIVATE_ADMIN_API_TOKEN` en los ajustes de
   entorno de la tienda Hydrogen (igual que `PUBLIC_CHECKOUT_DOMAIN`), o el
   formulario fallará en producción.

## Día a día

- Las reseñas nuevas llegan a **Contenido → Metaobjetos → Reseña de producto**,
  en estado *borrador*. Ábrelas y pulsa **Publicar** para que salgan en la web.
- Marca la casilla **Compra verificada** sólo cuando compruebes el pedido: es la
  que pinta la insignia «Verificada» en la tarjeta.
- La media y las barras de 1 a 5 estrellas se calculan con las reseñas
  publicadas, así que nunca se desvían de lo que se ve debajo.

## Detalles que conviene saber

- No pedimos ni guardamos el correo del cliente. Los metaobjetos son legibles
  públicamente desde la Storefront API, y ahí no debe haber datos personales.
- El formulario lleva un campo trampa invisible (*honeypot*) contra bots, y
  valida longitudes en el servidor.
- El titular «(+89 Reseñas Verificadas)» es un número aparte, en
  `app/routes/products.$handle.tsx` (`REVIEW_COUNT`). Las reseñas de ejemplo
  viven en `app/data/reviews.ts` y se muestran junto a las reales; bórralas
  cuando tengas suficientes reseñas de verdad.
- Sin el token configurado, el formulario responde «No hemos podido guardar tu
  reseña ahora mismo» y no se pierde nada más: el resto de la página funciona.
