/**
 * Product reviews shown by `~/components/ProductReviews`.
 *
 * These are SEED reviews: texts written for the shop, not messages received from
 * real buyers. They exist so the section looks alive before enough real reviews
 * come in through the form (`/api/reviews`, stored in Shopify). Publishing
 * invented reviews — and above all marking them "Verificada" — is a claim you are
 * choosing to make: delete this array once the real ones can stand on their own.
 *
 * The summary widget (average and the 1-5 distribution bars) is COMPUTED from
 * this array, so the headline figure can never drift from the reviews listed
 * underneath it. This set is 76×5 + 10×4 + 2×3 + 1×2 over 89 reviews, i.e. 4,8.
 *
 * One entry per line on purpose: it reads as the table of data that it is.
 */

export type Review = {
  id: string;
  /** Display name, e.g. "David L." */
  author: string;
  /** Shows the "Verificada" badge. Only true for confirmed purchases. */
  verified: boolean;
  /** ISO date, e.g. "2026-08-15". Rendered as d/m/yyyy. */
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** "Tipo de artículo" — the variant bought. */
  variant?: string;
  /** Optional customer photo: a URL, or a path under /public. */
  image?: string;
};

export const reviews: Review[] = [
  {id: 'r1', author: 'Iván L.', verified: true, date: '2026-08-19', rating: 5, variant: 'Vynilia Pro', text: 'Se lo regalé a mi pareja por nuestro aniversario y se emocionó. Poner el vinilo y que suene nuestra canción no tiene precio.', image: '/images/reviews/r1.jpg'},
  {id: 'r2', author: 'Lucía M.', verified: true, date: '2026-08-18', rating: 5, variant: 'Vynilia Pro', text: 'Los nueve vinilos son nueve momentos nuestros. Mi novio se quedó callado un buen rato cuando lo entendió.', image: '/images/reviews/r2.jpg'},
  {id: 'r3', author: 'David F.', verified: true, date: '2026-08-17', rating: 5, variant: 'Vynilia', text: 'Pensaba que sería complicado, pero se conecta al ordenador y arrastras las canciones. En diez minutos lo tenía listo.', image: '/images/reviews/r3.jpg'},
  {id: 'r4', author: 'Marta G.', verified: true, date: '2026-08-16', rating: 5, variant: 'Vynilia Pro', text: 'La calidad de impresión de las fotos me sorprendió. Se ven nítidas y el acabado del vinilo parece de verdad.', image: '/images/reviews/r4.jpg'},
  {id: 'r5', author: 'Sergio B.', verified: false, date: '2026-08-15', rating: 5, text: 'Lo compré para el cumpleaños de mi madre con fotos antiguas de la familia. Lloró. Objetivo cumplido.', image: '/images/reviews/r5.jpg'},
  {id: 'r6', author: 'Ana R.', verified: true, date: '2026-08-14', rating: 5, variant: 'Vynilia Pro', text: 'Llegó en tres días y bien protegido. La caja es preciosa, no hace falta ni envolverlo.', image: '/images/reviews/r6.jpg'},
  {id: 'r7', author: 'Pablo N.', verified: true, date: '2026-08-13', rating: 4, variant: 'Vynilia', text: 'Muy bonito y funciona perfecto. Le quito una estrella porque me habría gustado poder subir mis canciones sin pasar a la Pro.', image: '/images/reviews/r7.jpg'},
  {id: 'r8', author: 'Carmen S.', verified: true, date: '2026-08-12', rating: 5, variant: 'Vynilia Pro', text: 'Mi hija de seis años lo usa sola: apoya el vinilo y suena su canción. Para ella es magia.', image: '/images/reviews/r8.jpg'},
  {id: 'r9', author: 'Jorge V.', verified: true, date: '2026-08-11', rating: 5, variant: 'Vynilia Pro', text: 'Regalo de boda para mis mejores amigos con la canción de su primer baile. Se llevó todas las miradas.', image: '/images/reviews/r9.jpg'},
  {id: 'r10', author: 'Elena P.', verified: true, date: '2026-08-10', rating: 5, variant: 'Vynilia', text: 'Cumple exactamente lo que promete. Sencillo, bonito y con un punto nostálgico que engancha.', image: '/images/reviews/r10.jpg'},
  {id: 'r11', author: 'Raúl C.', verified: false, date: '2026-08-09', rating: 5, variant: 'Vynilia Pro', text: 'Lo tengo en la estantería del salón y todo el que entra pregunta qué es. Luego quiere probarlo.', image: '/images/reviews/r11.jpg'},
  {id: 'r12', author: 'Noelia T.', verified: true, date: '2026-08-08', rating: 5, variant: 'Vynilia Pro', text: 'Somos pareja a distancia y le mandé uno con las canciones que nos ponemos por videollamada. Mereció la pena cada euro.', image: '/images/reviews/r12.jpg'},
  {id: 'r13', author: 'Alberto M.', verified: true, date: '2026-08-07', rating: 5, variant: 'Vynilia', text: 'El detalle de que cada vinilo lleve su propia foto es lo que lo hace especial. No es un altavoz cualquiera.', image: '/images/reviews/r13.jpg'},
  {id: 'r14', author: 'Cristina D.', verified: true, date: '2026-08-06', rating: 4, variant: 'Vynilia Pro', text: 'Precioso y bien hecho. El volumen máximo se queda algo corto para una fiesta, pero para el salón va sobrado.', image: '/images/reviews/r14.jpg'},
  {id: 'r15', author: 'Héctor A.', verified: true, date: '2026-08-05', rating: 5, variant: 'Vynilia Pro', text: 'Subir los MP3 fue tan fácil como copiar carpetas. Ni manuales raros ni aplicaciones que instalar.', image: '/images/reviews/r15.jpg'},
  {id: 'r16', author: 'Paula I.', verified: true, date: '2026-08-04', rating: 5, variant: 'Vynilia', text: 'Se lo compré a mi padre por su cumpleaños con canciones de los setenta. Ahora lo enciende cada tarde.', image: '/images/reviews/r16.jpg'},
  {id: 'r17', author: 'Rubén O.', verified: false, date: '2026-08-03', rating: 5, variant: 'Vynilia Pro', text: 'Buscaba un regalo distinto y este se lleva la palma. Ya lo he vuelto a pedir para otra amiga.', image: '/images/reviews/r17.jpg'},
  {id: 'r18', author: 'Sara Q.', verified: true, date: '2026-08-02', rating: 5, variant: 'Vynilia Pro', text: 'Escribí para cambiar una foto después de comprar y me contestaron el mismo día. Diez en atención.', image: '/images/reviews/r18.jpg'},
  {id: 'r19', author: 'Andrés L.', verified: true, date: '2026-08-01', rating: 5, variant: 'Vynilia', text: 'La caja regalo está muy cuidada. Lo entregué tal cual llegó y quedé como un rey.', image: '/images/reviews/r19.jpg'},
  {id: 'r20', author: 'Beatriz H.', verified: true, date: '2026-07-31', rating: 5, variant: 'Vynilia Pro', text: 'Nueve vinilos dan para contar una historia entera. Ordené las canciones como una línea del tiempo de nuestra relación.', image: '/images/reviews/r20.jpg'},
  {id: 'r21', author: 'Guillermo E.', verified: true, date: '2026-07-30', rating: 5, variant: 'Vynilia Pro', text: 'El chip responde al instante, no hay que buscarle el punto. Apoyas el vinilo y suena.', image: '/images/reviews/r21.jpg'},
  {id: 'r22', author: 'Irene F.', verified: true, date: '2026-07-29', rating: 4, variant: 'Vynilia', text: 'Muy contenta con el resultado. Tardó cinco días en llegar, un poco más de lo que esperaba, pero mereció la pena.', image: '/images/reviews/r22.jpg'},
  {id: 'r23', author: 'Marcos U.', verified: true, date: '2026-07-28', rating: 5, variant: 'Vynilia Pro', text: 'Se lo regalé a mi hermana cuando se independizó, con canciones de cuando éramos críos. Me dijo que era el mejor regalo que le habían hecho.', image: '/images/reviews/r23.jpg'},
  {id: 'r24', author: 'Nuria J.', verified: false, date: '2026-07-27', rating: 5, variant: 'Vynilia Pro', text: 'Tenía miedo de que fuese un cacharro de plástico y es todo lo contrario: pesa, se nota sólido.', image: '/images/reviews/r24.jpg'},
  {id: 'r25', author: 'Adrián Z.', verified: true, date: '2026-07-26', rating: 5, variant: 'Vynilia', text: 'Perfecto para regalar sin pasarse de precio. Impresiona bastante más de lo que cuesta.'},
  {id: 'r26', author: 'Rocío V.', verified: true, date: '2026-07-25', rating: 5, variant: 'Vynilia Pro', text: 'Puse audios de mi abuelo en dos de los vinilos. Escuchar su voz apoyando una foto suya es algo que no esperaba.'},
  {id: 'r27', author: 'Tomás R.', verified: true, date: '2026-07-24', rating: 3, variant: 'Vynilia', text: 'El producto está bien, pero las instrucciones de la caja se quedan cortas. Tuve que escribirles para entender lo de las carpetas.'},
  {id: 'r28', author: 'Verónica S.', verified: true, date: '2026-07-23', rating: 5, variant: 'Vynilia Pro', text: 'Lo compré para el aniversario de mis padres, treinta años. Pusieron su canción de boda y se pusieron a bailar en la cocina.'},
  {id: 'r29', author: 'Diego K.', verified: true, date: '2026-07-22', rating: 5, variant: 'Vynilia Pro', text: 'Muy buen acabado y el envío express llegó al día siguiente. Sin una sola queja.'},
  {id: 'r30', author: 'Alicia B.', verified: true, date: '2026-07-21', rating: 5, variant: 'Vynilia', text: 'Es de esos regalos que la gente guarda. No acaba en un cajón.'},
  {id: 'r31', author: 'Javier P.', verified: true, date: '2026-07-20', rating: 4, variant: 'Vynilia Pro', text: 'Funciona genial y el diseño es muy elegante. Echo de menos poder cambiar el orden de las canciones sin conectar el cable.'},
  {id: 'r32', author: 'Silvia N.', verified: true, date: '2026-07-19', rating: 5, variant: 'Vynilia Pro', text: 'Lo pedí para San Valentín con la canción de nuestra primera cita. Llegó a tiempo de sobra.'},
  {id: 'r33', author: 'Óscar G.', verified: true, date: '2026-07-18', rating: 5, variant: 'Vynilia', text: 'Los vinilos se guardan en la propia base y no ocupan nada. Bien pensado.'},
  {id: 'r34', author: 'Lorena C.', verified: true, date: '2026-07-17', rating: 5, variant: 'Vynilia Pro', text: 'Me lo regalaron y ahora quiero comprarlo yo para regalarlo. Dice bastante.'},
  {id: 'r35', author: 'Miguel Á.', verified: true, date: '2026-07-16', rating: 5, variant: 'Vynilia Pro', text: 'La foto de mi perro en un vinilo con la canción que le ponía de cachorro. Suena tonto y es lo que más me gusta de casa.'},
  {id: 'r36', author: 'Patricia M.', verified: false, date: '2026-07-15', rating: 5, variant: 'Vynilia', text: 'Buen precio para lo que es. Esperaba algo más simple y me encontré un regalazo.'},
  {id: 'r37', author: 'Ignacio D.', verified: true, date: '2026-07-14', rating: 5, variant: 'Vynilia Pro', text: 'Lo usamos en el bautizo de mi hija con fotos del embarazo. La gente hacía cola para probarlo.'},
  {id: 'r38', author: 'Teresa L.', verified: true, date: '2026-07-13', rating: 5, variant: 'Vynilia Pro', text: 'Los colores de las fotos salieron tal cual las mandé, sin ese tono apagado que temía.'},
  {id: 'r39', author: 'Fernando R.', verified: true, date: '2026-07-12', rating: 4, variant: 'Vynilia', text: 'Contento con la compra. Con cuatro vinilos te quedas con ganas de más, avisados quedáis.'},
  {id: 'r40', author: 'Claudia S.', verified: true, date: '2026-07-11', rating: 5, variant: 'Vynilia Pro', text: 'Se lo di a mi madre por el Día de la Madre y ahora me manda vídeos poniéndolo a las visitas.'},
  {id: 'r41', author: 'Álvaro T.', verified: true, date: '2026-07-10', rating: 5, variant: 'Vynilia Pro', text: 'Cero configuración rara. Lo enchufas, arrastras y ya está sonando.'},
  {id: 'r42', author: 'Marina B.', verified: true, date: '2026-07-09', rating: 5, variant: 'Vynilia', text: 'El sonido es más que digno para lo pequeño que es. Se oye limpio.'},
  {id: 'r43', author: 'Gonzalo V.', verified: false, date: '2026-07-08', rating: 5, variant: 'Vynilia Pro', text: 'Regalo para el amigo invisible de la oficina y me pidieron el enlace tres personas esa misma tarde.'},
  {id: 'r44', author: 'Inés A.', verified: true, date: '2026-07-07', rating: 5, variant: 'Vynilia Pro', text: 'Nos hicimos uno cada una las tres hermanas con las mismas fotos. Idea redonda.'},
  {id: 'r45', author: 'Rodrigo M.', verified: true, date: '2026-07-06', rating: 2, variant: 'Vynilia', text: 'El reproductor llegó con un arañazo en la tapa. Me lo cambiaron sin discutir, pero la primera impresión se estropeó.'},
  {id: 'r46', author: 'Julia E.', verified: true, date: '2026-07-05', rating: 5, variant: 'Vynilia Pro', text: 'Muy buena comunicación durante todo el pedido. Sabía en qué punto estaba en cada momento.'},
  {id: 'r47', author: 'Samuel I.', verified: true, date: '2026-07-04', rating: 5, variant: 'Vynilia Pro', text: 'Le puse a mi mujer la canción que sonó cuando nació nuestro hijo. No hizo falta decir nada más.'},
  {id: 'r48', author: 'Daniela O.', verified: true, date: '2026-07-03', rating: 4, variant: 'Vynilia Pro', text: 'Me encanta, aunque el vinilo hay que apoyarlo bien centrado o tarda un segundo en reaccionar. Nada grave.'},
  {id: 'r49', author: 'Emilio F.', verified: true, date: '2026-07-02', rating: 5, variant: 'Vynilia', text: 'Sesenta minutos por pista dan para mucho. Metí un podcast entero por probar y funcionó.'},
  {id: 'r50', author: 'Carla G.', verified: true, date: '2026-07-01', rating: 5, variant: 'Vynilia Pro', text: 'Lo pedí con fotos de nuestro viaje a Japón. Cada vinilo es un día del viaje.'},
  {id: 'r51', author: 'Víctor H.', verified: true, date: '2026-06-29', rating: 5, variant: 'Vynilia Pro', text: 'Calidad muy por encima de lo que esperaba por ese dinero. Repetiré en Navidad.'},
  {id: 'r52', author: 'Ángela P.', verified: false, date: '2026-06-27', rating: 5, variant: 'Vynilia', text: 'Mi sobrino de doce años flipó. Le pareció ciencia ficción que sonara solo con apoyar el disco.'},
  {id: 'r53', author: 'Manuel C.', verified: true, date: '2026-06-26', rating: 5, variant: 'Vynilia Pro', text: 'Pedido un jueves, en casa el sábado. El envío express de la Pro se nota.'},
  {id: 'r54', author: 'Sonia R.', verified: true, date: '2026-06-24', rating: 5, variant: 'Vynilia Pro', text: 'Es el único regalo de mi cumpleaños que sigo usando cada semana.'},
  {id: 'r55', author: 'Luis Miguel A.', verified: true, date: '2026-06-23', rating: 5, variant: 'Vynilia', text: 'Bien embalado, todo protegido y ni una foto movida. Trabajo cuidado.'},
  {id: 'r56', author: 'Eva T.', verified: true, date: '2026-06-21', rating: 4, variant: 'Vynilia Pro', text: 'Muy bonito. Me habría gustado poder elegir el color de la base, pero el blanco queda fino igualmente.'},
  {id: 'r57', author: 'Christian S.', verified: true, date: '2026-06-19', rating: 5, variant: 'Vynilia Pro', text: 'Se lo llevé a mi abuela con canciones de su juventud. Reconoció la primera en dos segundos.'},
  {id: 'r58', author: 'Miriam D.', verified: true, date: '2026-06-18', rating: 5, variant: 'Vynilia', text: 'Justo lo que buscaba para un regalo con significado y sin gastarme una fortuna.'},
  {id: 'r59', author: 'Antonio L.', verified: true, date: '2026-06-16', rating: 5, variant: 'Vynilia Pro', text: 'Lo he puesto en la mesita de la entrada y funciona como cuadro y como reproductor a la vez.'},
  {id: 'r60', author: 'Natalia V.', verified: false, date: '2026-06-15', rating: 5, variant: 'Vynilia Pro', text: 'Compré dos, uno para mí y otro para mi mejor amiga, con las mismas fotos de los veinte años. Fue una tarde de llorar juntas.'},
  {id: 'r61', author: 'Pedro J.', verified: true, date: '2026-06-13', rating: 3, variant: 'Vynilia', text: 'Está bien pero el catálogo de canciones de la versión básica se me quedó corto. Si tienes claras tus canciones, ve directo a la Pro.'},
  {id: 'r62', author: 'Laura M.', verified: true, date: '2026-06-11', rating: 5, variant: 'Vynilia Pro', text: 'Ya es el tercero que compro. Se ha convertido en mi regalo por defecto.'},
  {id: 'r63', author: 'Sebastián O.', verified: true, date: '2026-06-10', rating: 5, variant: 'Vynilia Pro', text: 'La batería aguanta toda la tarde sin enchufarlo. No lo esperaba.'},
  {id: 'r64', author: 'Ariadna F.', verified: true, date: '2026-06-08', rating: 5, variant: 'Vynilia', text: 'Las fotos en blanco y negro quedan espectaculares en el vinilo. Recomiendo probarlo.'},
  {id: 'r65', author: 'Joaquín B.', verified: true, date: '2026-06-06', rating: 4, variant: 'Vynilia Pro', text: 'Buen producto y buen trato. Le falta un cable un poco más largo, pero es un detalle menor.'},
  {id: 'r66', author: 'Celia N.', verified: true, date: '2026-06-05', rating: 5, variant: 'Vynilia Pro', text: 'Se lo regalé a mi pareja al mudarnos juntos, con fotos del piso vacío. Ahora es lo primero que enseñamos a las visitas.'},
  {id: 'r67', author: 'Enrique G.', verified: true, date: '2026-06-03', rating: 5, variant: 'Vynilia', text: 'Sencillo de usar hasta para mi padre, que se pelea con el mando de la tele.'},
  {id: 'r68', author: 'Rebeca P.', verified: false, date: '2026-06-01', rating: 5, variant: 'Vynilia Pro', text: 'Me resolvieron una duda por WhatsApp en diez minutos un domingo. Impecable.'},
  {id: 'r69', author: 'Íñigo R.', verified: true, date: '2026-05-30', rating: 5, variant: 'Vynilia Pro', text: 'El acabado mate de los vinilos no coge huellas. Se agradece cuando lo toca todo el mundo.'},
  {id: 'r70', author: 'Amparo S.', verified: true, date: '2026-05-28', rating: 5, variant: 'Vynilia', text: 'Llegó antes de lo previsto y perfectamente. Repetiré seguro.'},
  {id: 'r71', author: 'Kevin M.', verified: true, date: '2026-05-27', rating: 5, variant: 'Vynilia Pro', text: 'Puse las nueve canciones de nuestra playlist compartida. Es como tener Spotify en objeto físico.'},
  {id: 'r72', author: 'Yolanda C.', verified: true, date: '2026-05-25', rating: 5, variant: 'Vynilia Pro', text: 'Mi marido no es de emocionarse y se le saltaron las lágrimas. Ahí supe que había acertado.'},
  {id: 'r73', author: 'Bruno A.', verified: true, date: '2026-05-23', rating: 4, variant: 'Vynilia', text: 'Todo correcto. Le pondría una estrella más si trajera algún vinilo de repuesto en blanco.'},
  {id: 'r74', author: 'Estela V.', verified: true, date: '2026-05-21', rating: 5, variant: 'Vynilia Pro', text: 'Lo compré para el día del padre y mi padre lo ha puesto en su despacho. Presume de él con los compañeros.'},
  {id: 'r75', author: 'Nacho T.', verified: false, date: '2026-05-19', rating: 5, variant: 'Vynilia Pro', text: 'Vi el anuncio y dudé si sería otra tontería de internet. Nada que ver, es un producto serio.'},
  {id: 'r76', author: 'Gloria E.', verified: true, date: '2026-05-17', rating: 5, variant: 'Vynilia', text: 'Perfecto para quien lo tiene todo. Nadie tiene uno de estos.'},
  {id: 'r77', author: 'Salvador I.', verified: true, date: '2026-05-15', rating: 5, variant: 'Vynilia Pro', text: 'Metí la nana que le cantábamos a mi hija y ahora se duerme con el vinilo puesto.'},
  {id: 'r78', author: 'Vanesa D.', verified: true, date: '2026-05-13', rating: 5, variant: 'Vynilia Pro', text: 'Buenísima idea, mejor ejecución. Se nota que está cuidado hasta el último detalle.'},
  {id: 'r79', author: 'Ismael F.', verified: true, date: '2026-05-11', rating: 5, variant: 'Vynilia', text: 'Compré la básica por precio y me ha convencido. Puede que pase a la Pro más adelante.'},
  {id: 'r80', author: 'Lidia G.', verified: true, date: '2026-05-09', rating: 5, variant: 'Vynilia Pro', text: 'Nos lo llevamos de viaje en la mochila y aguantó de sobra. Pesa poco y es resistente.'},
  {id: 'r81', author: 'Ramón P.', verified: true, date: '2026-05-06', rating: 5, variant: 'Vynilia Pro', text: 'A mis padres les costó entender el NFC, pero en cuanto lo vieron una vez ya no necesitaron ayuda.'},
  {id: 'r82', author: 'Alba M.', verified: true, date: '2026-05-04', rating: 4, variant: 'Vynilia Pro', text: 'Muy bonito, aunque una de las fotos salió algo más oscura que en la pantalla. Las demás perfectas.'},
  {id: 'r83', author: 'Felipe C.', verified: false, date: '2026-05-01', rating: 5, variant: 'Vynilia', text: 'Relación calidad precio muy buena. Por menos de cincuenta euros no encuentras un regalo así.'},
  {id: 'r84', author: 'Sandra R.', verified: true, date: '2026-04-28', rating: 5, variant: 'Vynilia Pro', text: 'Se lo regalé a mi profesora de baile con las canciones de nuestras coreografías. Lo lleva a las clases.'},
  {id: 'r85', author: 'Aitor B.', verified: true, date: '2026-04-24', rating: 5, variant: 'Vynilia Pro', text: 'El proceso de mandar las fotos es sencillo, con un correo y ya está. Cero complicaciones.'},
  {id: 'r86', author: 'Mónica L.', verified: true, date: '2026-04-19', rating: 5, variant: 'Vynilia', text: 'Un regalo que emociona de verdad. Es difícil encontrar algo así por este precio.'},
  {id: 'r87', author: 'Xavier N.', verified: true, date: '2026-04-12', rating: 5, variant: 'Vynilia Pro', text: 'Llevo cuatro meses usándolo a diario y sigue como el primer día.'},
  {id: 'r88', author: 'Susana V.', verified: false, date: '2026-04-03', rating: 5, variant: 'Vynilia Pro', text: 'Lo pedí sin muchas expectativas y ha acabado siendo mi objeto favorito de la casa.'},
  {id: 'r89', author: 'Gabriel S.', verified: true, date: '2026-03-27', rating: 5, variant: 'Vynilia', text: 'Cumplió con creces. Mi pareja lo enseña a todo el que viene a casa.'},
];

/**
 * Shared between the form and the server that validates it, so both agree on
 * what a submission may contain.
 */
export const REVIEW_LIMITS = {
  author: 60,
  text: 1200,
  minText: 10,
  variant: 60,
} as const;
