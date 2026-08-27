# Vídeos de clientes (sección "Únete a más de 539 Clientes Satisfechos")

1. Copia el vídeo aquí, en vertical (9:16) y en `.mp4` (H.264 + AAC).
   Nombre sugerido: `cliente-1.mp4`, `cliente-2.mp4`, ...
2. Abre `app/components/CustomerVideos.tsx` y pon la ruta en la lista
   `CUSTOMER_VIDEOS`:

   ```ts
   const CUSTOMER_VIDEOS: CustomerVideo[] = [
     {src: '/videos/cliente-1.mp4', caption: 'Marta'},
     {src: null},   // hueco todavía vacío
     ...
   ];
   ```

Notas:
- `src: null` deja el hueco con el marcador punteado, no rompe nada.
- Puedes añadir o quitar entradas: el carrusel se adapta al número que haya.
- `caption` es opcional (nombre del cliente sobre el vídeo).
- `poster` es opcional: una imagen del primer fotograma, p. ej.
  `poster: '/images/cliente-1.jpg'`.
- Los vídeos se reproducen en silencio y en bucle cuando entran en pantalla;
  el botón 🔇 activa el sonido de uno solo cada vez.
- Comprime antes de subir (idealmente < 5 MB por vídeo): estos archivos viajan
  en el despliegue. Si pesan mucho, súbelos a Shopify Files y usa la URL del
  CDN en `src` en lugar de la ruta local.
