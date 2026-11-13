# Earth Jukebox — Plan completo de implementación

Fecha: 13 de noviembre de 2026. Estado: diseño listo para desarrollo; aplicación todavía no implementada.
Proyecto: nasa App. Documento de trabajo en español.

## 1. Objetivo y alcance

Construir una aplicación web que muestre fotogramas de visualizaciones del NASA Earth Information Center (EIC) y genere sonido a partir de sus características visuales. El visitante podrá reproducir una secuencia, detenerla y escuchar zonas de un fotograma mientras comprende la regla que conecta imagen y sonido.

El producto se centra en explorar imágenes de la Tierra mediante la vista y el oído. No se plantea como un estudio de la evolución del clima. La primera pieza será una visualización de corrientes oceánicas, elegida por sus patrones visuales.

La síntesis de audio sucede en el navegador durante la interacción. Para asegurar un MVP fiable, los rasgos de las imágenes se calculan previamente; no se almacena una banda sonora que simule responder a la imagen. Analizar también los píxeles en el navegador será una ampliación posterior.

### Qué está verificado y qué queda abierto

- El resumen del reto publicado en el sitio oficial de equipos pide combinar fotogramas EIC con sonificaciones dinámicas generadas en tiempo real [1].
- NASA SVS ofrece material EIC y la pieza de Agulhas con vídeo y secuencia de imágenes [2, 3].
- La ficha completa del reto no se pudo recuperar el 13 de noviembre de 2026. Su pestaña Resources, condiciones de entrega y criterios de elegibilidad deben comprobarse antes de cerrar la propuesta.
- Stack, algoritmo, cantidades de imágenes y calendario de este documento son decisiones de implementación propuestas, no requisitos atribuidos a NASA.
- Antes de desarrollar, confirmar que la extracción previa de rasgos satisface el detalle completo del enunciado. Si exige análisis de imagen en vivo, portar el extractor a Canvas al inicio y mantener el resto del diseño.
- No se fija una hora oficial de entrega sin conocer el evento local y verificar sus reglas.

## 2. Resultado esperado

Un visitante entra, pulsa «Escuchar la Tierra», recibe una explicación breve y escucha ocho notas que recorren de izquierda a derecha una región visible. Una zona con mayor proporción de trazos luminosos produce un tono más agudo. La región y la columna activas quedan resaltadas.

Al terminar el barrido, la aplicación pasa al siguiente fotograma. En modo exploración se puede seleccionar una columna, escucharla y consultar su descripción. El significado se mantiene al escuchar en mono.

### Prioridades

| Nivel | Función | Criterio de terminación |
|---|---|---|
| P0 | Una pieza NASA con 24 fotogramas | Fuente, orden y tiempos de origen registrados |
| P0 | Sonificación determinista | Mismo fotograma y configuración producen las mismas notas |
| P0 | Reproductor sincronizado | Imagen y columna coinciden con el evento audible |
| P0 | Play, pausa, reinicio, salto, volumen y silencio | Operables con ratón y teclado |
| P0 | Exploración de ocho columnas | Cada columna puede seleccionarse y escucharse |
| P0 | Guía de escucha y procedencia | El visitante puede explicar qué representa la altura del tono |
| P0 | Accesibilidad básica validada | Recorrido completo con teclado y lector de pantalla |
| P0 | Despliegue y documentación | URL funcional, código y método reproducible |
| P1 | Segunda pieza EIC | Se incorpora mediante un manifiesto independiente |
| P1 | Velocidad ajustable | Cambia duración sin alterar el significado del tono |
| P1 | Exportación WAV | Reutiliza el mismo mapeo mediante renderizado offline |
| P2 | Región libre y análisis en navegador | Recalcula rasgos reales y actualiza la explicación |
| P2 | Comparación entre piezas y modos musicales | Cada modo muestra su propia leyenda |

Fuera del MVP: cuentas, pagos, base de datos, generación musical con IA, mapas 3D, actualización automática de NASA, clasificación científica de remolinos y reconstrucción de magnitudes físicas desde colores.

## 3. Material NASA y preparación

### Primera pieza

Usar el recurso «OceanFlows_AgulhasCurrent_3840x1080.mp4» publicado dentro de la ficha SVS 5505, titulada «Perpetual Ocean 2: Equirectangular». NASA identifica esta variante como visualización para el Hyperwall EIC y publica también fotogramas [3].

La ficha describe la corriente de Agulhas junto al sur de África. La app incluirá una explicación breve y créditos a NASA's Scientific Visualization Studio. El sonido representa patrones de la imagen; no debe etiquetarse como velocidad, temperatura, caudal o intensidad de una corriente.

### Procedimiento reproducible

1. Registrar URL de la ficha, URL exacta del archivo elegido, fecha de descarga, créditos y condiciones de reutilización aplicables.
2. Descargar únicamente el vídeo de la variante elegida o los fotogramas necesarios. Evitar descargar la colección completa en alta resolución.
3. Inspeccionar un tramo sin transiciones, rótulos superpuestos ni cambios de cámara que invaliden la región fija.
4. Elegir 24 tiempos fuente ordenados y registrarlos en un archivo de selección. No confundir segundos del vídeo con fechas de observación.
5. Extraer un fotograma por tiempo con FFmpeg. Registrar versión de herramienta y parámetros.
6. Preparar imágenes de presentación de hasta 1280 píxeles de ancho manteniendo proporción. Conservar una copia de análisis reproducible; si se usa WebP con pérdida, los rasgos se calculan sobre su versión final decodificada para evitar divergencias.
7. Seleccionar una región rectangular normalizada dentro de la imagen y una máscara que excluya tierra, rótulos y zonas no válidas. Inspeccionar que sirven para toda la secuencia.
8. Generar los ocho valores por imagen, sus resúmenes textuales y el manifiesto.
9. Validar archivos, dimensiones, valores, tiempos y correspondencia de identificadores.
10. Publicar imágenes y manifiesto desde el mismo origen que la aplicación.

Objetivo de tamaño inicial: manifiesto y miniatura pequeños; primer fotograma disponible sin descargar toda la secuencia. Objetivo del conjunto comprimido: menos de 10 MB, sujeto a revisar calidad visual.

Se mantienen dos tiempos distintos: sourceTimeSec identifica la posición en el vídeo NASA; playbackTimeSec representa el tiempo de la sonificación. No se presenta la secuencia ralentizada como vídeo a velocidad original.

## 4. Algoritmo de imagen a sonido

### Extracción de rasgos

Para cada fotograma:

1. Decodificar RGB en el espacio sRGB y recortar la región de interés.
2. Reducirla a una anchura de análisis fija de 256 píxeles, conservando proporción y usando siempre el mismo método.
3. Convertir sRGB a RGB lineal. Por canal normalizado c: c/12,92 si c ≤ 0,04045; en otro caso ((c + 0,055)/1,055)^2,4.
4. Calcular luminancia relativa Y = 0,2126R + 0,7152G + 0,0722B.
5. Dividir el recorte en ocho columnas de anchura aproximadamente igual.
6. Para cada columna, contar píxeles válidos con Y ≥ T y dividir entre el total de píxeles válidos.
7. Guardar un valor entre 0 y 1. Si no existen píxeles válidos, guardar null y una razón; nunca sustituirlo por cero.

T es un umbral por pieza, seleccionado en la prueba inicial y fijado para toda su secuencia. La máscara se transforma con vecino más próximo para mantener su condición binaria. El informe de extracción conserva el umbral, tamaño, recorte y versión del algoritmo.

No normalizar cada fotograma por sus propios mínimos y máximos: eso destruiría la comparabilidad. Si los valores ocupan un rango pequeño, se pueden definir límites globales por pieza, fijados y documentados tras inspeccionar la muestra. El modo base utiliza el rango absoluto 0–1.

### Mapeo sonoro inicial

| Elemento | Regla propuesta | Interpretación |
|---|---|---|
| Valor v de columna | Índice round(7 × v) | Mayor proporción luminosa implica igual o mayor altura |
| Escala | MIDI [48, 50, 52, 55, 57, 60, 62, 64] | Ocho notas de una selección pentatónica |
| Frecuencia | 440 × 2^((midi − 69)/12) Hz | Conversión de nota a frecuencia |
| Orden | Columnas 1 a 8 | Recorrido espacial de izquierda a derecha |
| Paso | 250 ms | Un barrido dura 2 segundos |
| Nota | 180 ms con entrada y salida suaves | Evitar clics y separar columnas |
| Timbre | Oscilador sinusoidal | Sonido sencillo y fácil de comparar |
| Ganancia | Constante por nota; control maestro | La luminosidad no se codifica también como volumen |
| null | Silencio durante el paso | Región sin datos válidos |
| v = 0 | Nota más grave | Región válida sin píxeles sobre el umbral |

Con 24 imágenes y dos segundos por barrido, la pieza dura 48 segundos. Estas duraciones son parámetros de producto, no tiempos originales de NASA.

La cuantización permite que valores cercanos generen la misma nota. La interfaz conserva el porcentaje exacto para inspección. El silencio por falta de datos se explica en texto; no se confunde con valor cero.

### Calibración antes de ampliar

Comparar tres imágenes reales. Si las ocho notas resultan casi iguales en todas, revisar región, máscara y umbral; no introducir variaciones aleatorias. Probar también imágenes sintéticas: mitad clara/mitad oscura, gradiente y máscara vacía. Invertir la imagen sintética debe invertir el patrón espacial audible.

## 5. Experiencia e interfaz

Una única pantalla principal, adaptable a móvil:

- Cabecera: nombre, explicación breve y acceso a «Cómo escuchar».
- Selector de piezas: tarjeta activa; una sola pieza válida es suficiente para el MVP.
- Visor: fotograma completo, contorno de la región analizada y resaltado de columna.
- Reproductor: play/pausa, reiniciar, anterior/siguiente, posición, volumen y silencio.
- Exploración: ocho botones con número, porcentaje y acción de escucha.
- Información: qué muestra NASA, qué representa el sonido, fuente y créditos.

La guía inicial reproduce dos ejemplos, grave y agudo, activados por el usuario. No se inicia sonido automáticamente.

### Comportamientos definidos

- Al pulsar play, habilitar AudioContext y comenzar desde la posición actual.
- Al pausar, cortar suavemente el audio y mantener imagen y posición.
- Al reanudar, reiniciar la columna actual para dar un punto reconocible.
- Al saltar a una imagen, cancelar el transporte anterior; si estaba en reproducción, iniciar el nuevo barrido tras disponer de la imagen.
- Al entrar en exploración, pausar la secuencia. Escuchar una columna nunca deja el transporte sonando por detrás.
- Al terminar, mantener el último fotograma y mostrar «Reproducir de nuevo».
- Si falta un activo, detenerse en un estado comprensible con opción de reintentar. No avanzar el sonido sobre una imagen antigua.
- Al ocultarse la pestaña, pausar y conservar posición. La reanudación es voluntaria.

## 6. Arquitectura técnica

Stack propuesto: React, TypeScript estricto y Vite para interfaz; Web Audio API para síntesis; Python, NumPy y Pillow para extracción; FFmpeg para fotogramas; Vitest para lógica; Playwright y axe para pruebas de interfaz; NVDA para revisión manual en Windows.

Pillow cubre las operaciones necesarias del MVP. OpenCV se incorporaría si una ampliación requiere análisis de movimiento o segmentación más compleja.

Aplicación estática, sin backend en el MVP. El procesado vive fuera de la aplicación y produce activos versionados.

| Módulo | Responsabilidad |
|---|---|
| catalog | Cargar catálogo y manifiestos; validar esquema |
| assets | Precargar y decodificar imágenes; informar de disponibilidad |
| features | Tipos, validación de valores y transformaciones puras |
| mapping | Convertir valores a notas y eventos |
| audio | Crear voces, envolventes y control maestro |
| transport | Reloj, posición, pausa, seek, fin y cancelación |
| player | Mostrar fotograma y resaltado según el transporte |
| explorer | Selección y escucha individual de columnas |
| accessibility | Guía, descripciones y avisos de estado |
| scripts | Extracción, generación y validación de activos |

### Flujo de ejecución

El manifiesto alimenta simultáneamente la imagen y el generador de eventos. El transporte programa audio a partir de AudioContext.currentTime; la interfaz consulta ese mismo reloj para seleccionar el fotograma y la columna. React recibe cambios discretos de posición, sin renders por cada muestra de audio.

Usar un planificador que revise aproximadamente cada 25 ms y programe hasta 100 ms por delante. Estos valores se ajustan en las pruebas del dispositivo objetivo. La programación final utiliza tiempos de Web Audio, no la precisión del temporizador de JavaScript.

Cada sesión de reproducción posee un identificador. Pausa, seek o cambio de pista invalidan la sesión anterior, detienen sus osciladores programados y desconectan nodos al terminar. Limpiar recursos al desmontar para evitar doble reproducción.

Precargar y decodificar el fotograma siguiente antes de su inicio. Si no está disponible, pausar en el límite del fotograma, cancelar sus notas y entrar en buffering. Una vez listo, reanclar el reloj y continuar sin perder correspondencia.

Mantener ganancia inicial moderada, rampas de aproximadamente 10 ms y margen para evitar saturación. La amplitud digital no garantiza un nivel acústico concreto en los auriculares del usuario.

## 7. Contratos de datos y estructura del proyecto

### Manifiesto de pieza

| Campo | Contenido |
|---|---|
| schemaVersion, id, title | Versión de esquema e identidad estable |
| source | Página NASA, archivo original, créditos y fecha de descarga |
| description, listeningGuide | Contexto y explicación del mapeo |
| analysis | Recorte normalizado, máscara, anchura, umbral, algoritmo y versión |
| mapping | Escala MIDI, paso, duración de nota, timbre y versión |
| frames | Lista ordenada de fotogramas |

Cada frame contiene id, imageUrl, sourceTimeSec, description y columns: ocho objetos con value, validPixelCount y brightPixelCount. Los valores no válidos llevan reason. Añadir un hash del activo de análisis para identificar exactamente qué imagen produjo los rasgos.

Validaciones: identificadores únicos, URLs locales seguras, dimensiones válidas, ocho columnas, tiempos fuente ordenados, conteos coherentes y valores finitos en 0–1. Un error impide reproducir esa pieza y muestra una explicación.

### Archivos previstos

| Ruta | Uso |
|---|---|
| src/app/ | Entrada, composición y estilos generales |
| src/features/catalog/ | Catálogo y carga de manifiestos |
| src/features/player/ | Visor y controles |
| src/features/explorer/ | Exploración de columnas |
| src/domain/ | Tipos, validadores, funciones de mapeo |
| src/audio/ | Motor de audio y transporte |
| public/tracks/agulhas/ | Imágenes, máscara y manifiesto publicados |
| scripts/extract_frames.py | Selección y preparación de fotogramas |
| scripts/extract_features.py | Extracción reproducible de rasgos |
| scripts/validate_assets.py | Validación previa al build |
| tests/unit/ y tests/e2e/ | Pruebas de lógica y recorridos |
| docs/methodology.md | Método, calibración y limitaciones |
| docs/sources.md | URLs, atribuciones y trazabilidad |
| README.md | Instalación, ejecución y demostración |

Versionar código, configuración y activos comprimidos necesarios. Mantener vídeos originales pesados fuera del repositorio, con URL y hash registrados. Fijar versiones de dependencias mediante lockfile y registrar la versión de Python empleada.

## 8. Backlog ejecutable y dependencias

Estimaciones orientativas para una persona con experiencia frontend: 26–37 horas de trabajo efectivo. Incluyen margen técnico limitado; no garantizan terminar en un fin de semana.

| ID | Trabajo | Dependencia | Horas | Evidencia de cierre |
|---|---|---|---|---|
| EJ-01 | Revisar enunciado completo, Resources y reglas locales | Ninguna | 1–2 | Lista de requisitos y pendientes |
| EJ-02 | Elegir y preparar 6 imágenes de prueba | EJ-01 | 2–3 | Archivos y fuentes registrados |
| EJ-03 | Extractor, máscara y calibración | EJ-02 | 3–4 | Valores coherentes en muestra real y sintética |
| EJ-04 | Motor de ocho notas y cancelación | EJ-03 | 3–4 | Escucha real sin superposiciones |
| EJ-05 | Visor y transporte sincronizado | EJ-04 | 4–5 | Barrido visible coincide con audio |
| EJ-06 | Controles y exploración accesibles | EJ-05 | 3–4 | Recorrido completo con teclado |
| EJ-07 | Preparar 24 imágenes y manifiesto final | EJ-03 | 2–3 | Validador sin errores |
| EJ-08 | Integración, buffering y errores | EJ-06, EJ-07 | 2–3 | Pausa y seek fiables bajo fallos |
| EJ-09 | Validación técnica y escucha con usuarios | EJ-08 | 3–4 | Informe de pruebas y correcciones |
| EJ-10 | Despliegue, README, créditos y demo | EJ-09 | 3–5 | URL y entrega verificadas |

Ruta crítica: fuente válida → extracción fiable → sonido comprensible → sincronización → controles → pruebas → entrega.

Para un equipo, la preparación de activos y la interfaz pueden avanzar en paralelo después de acordar el contrato del manifiesto. La integración del transporte tiene un único responsable.

### Plan de fin de semana, relativo al inicio

- Primer bloque, 0–4 h: resolver fuente y obtener el primer sonido basado en una imagen real.
- Segundo bloque, 4–10 h: cerrar algoritmo y demostrar una secuencia corta sincronizada.
- Tercer bloque, 10–16 h: controles, exploración, guía y primer despliegue.
- Cuarto bloque, 16–22 h: completar activos y probar accesibilidad, móvil y errores.
- Bloque final, 22–28 h: corregir, grabar demo, documentar y preparar entrega.
- Reservar tiempo adicional si la validación requiere rehacer el mapeo.

Punto de control: si al terminar el segundo bloque la relación imagen-sonido no se entiende, reducir a 6–8 imágenes y mejorar la guía. Añadir una segunda pieza solo después de cumplir todos los criterios P0.

## 9. Pruebas y criterios de aceptación

### Pruebas automáticas necesarias

| Área | Caso relevante | Resultado esperado |
|---|---|---|
| Extractor | Negro, blanco y mitad de cada uno | Proporciones esperadas dentro de tolerancia |
| Máscara | Columna totalmente excluida | null; nunca división por cero |
| Mapeo | Valores crecientes y extremos | Notas monótonas y dentro de escala |
| Transporte | Play repetido, pausa y seek rápidos | Una sola sesión y ningún evento anterior activo |
| Manifiesto | Valores fuera de rango o imagen ausente | Error identificable y reproducción bloqueada |
| Interfaz | Navegación completa con teclado | Controles alcanzables y nombres comprensibles |
| Carga | Fallo del siguiente fotograma | Buffering o error sin desincronización |
| Despliegue | Abrir URL y recargar | Activos válidos y sin rutas rotas |

Las pruebas con mocks de audio no demuestran calidad sonora. Completar con escucha real en auriculares y altavoz; comprobar clics, silencios, cortes y volumen.

### Validación manual

- Chrome o Edge de escritorio y al menos un navegador móvil disponible; registrar qué dispositivos se probaron.
- NVDA en Windows: entrar, leer guía, iniciar, pausar, explorar y volver al inicio.
- Foco visible, nombres accesibles, contraste, zoom al 200 % y diseño móvil sin desplazamiento horizontal innecesario.
- No emitir avisos de lector de pantalla cada 250 ms. Anunciar acciones del usuario, errores y cambio voluntario de fotograma.
- Modo de movimiento reducido: conservar indicación funcional discreta sin animaciones decorativas.
- Escucha en mono: se mantiene toda la información esencial.
- Tres personas de prueba, si están disponibles: explicar el significado del tono y comparar dos regiones sin mirar. Incluir una persona ciega o con baja visión si es posible; registrar si no se pudo validar con ese público.

### Objetivos medibles internos

- Con activos listos, respuesta a play menor de 250 ms en el equipo de demo.
- Desfase perceptible imagen/audio menor de 100 ms en reproducción estable, medido con captura audiovisual y registro de eventos.
- Pausa y silencio detienen el audio sin dejar notas programadas residuales.
- La app mantiene el mismo patrón de notas después de recargar con el mismo manifiesto.
- Ningún error de accesibilidad crítico en análisis automático; revisión manual completada.

Son objetivos que deben medirse, no resultados ya obtenidos.

## 10. Riesgos y mitigaciones

| Riesgo | Decisión |
|---|---|
| No se verifica Resources | Mantenerlo como bloqueo de elegibilidad, sin afirmar cumplimiento |
| La imagen apenas varía auditivamente | Revisar muestra y región antes de construir el resto |
| Interpretación científica incorrecta | Etiquetar explícitamente proporción luminosa y explicar limitaciones |
| Rótulos o fondo alteran la señal | Máscara fija inspeccionada sobre toda la secuencia |
| Restricciones de reproducción automática | Activar audio tras interacción del usuario |
| Imágenes externas inaccesibles | Activos optimizados servidos con la app |
| Pestaña en segundo plano | Pausar explícitamente |
| Desfase por carga o seek | Reloj único, decodificación previa y cancelación por sesión |
| Scope excesivo | Una pieza completa; posponer exportación y análisis libre |
| Fallo de red en la presentación | Build local probado y vídeo de respaldo claramente identificado |
| Barreras de acceso no detectadas | Pruebas manuales y escucha con usuarios, además de axe |

## 11. Despliegue y entrega

Construir una salida estática mediante Vite y alojarla en un servicio con HTTPS, por ejemplo Vercel o equivalente disponible. Elegir proveedor al implementar; no depender de una cuenta aún no configurada.

Proceso: instalar desde lockfile → validar activos → comprobar tipos → pruebas unitarias → build → smoke test sobre build → publicar → abrir URL desde sesión privada y móvil.

Entregables:

1. Aplicación accesible mediante URL.
2. Repositorio con instrucciones para arrancar y regenerar activos.
3. Método de extracción y tabla exacta de mapeo.
4. Fuentes, créditos y limitaciones.
5. Informe corto de dispositivos, pruebas y fallos conocidos.
6. Demostración grabada y subtitulada según formato y duración exigidos por el evento.
7. Ficha de presentación, en el idioma y formato que exija el evento.

Demo propuesta de unos 90 segundos, ajustable a las reglas: problema y objetivo; mostrar la fuente EIC; explicar grave/agudo; reproducir; pausar y explorar una región; mostrar teclado y descripción; cerrar con método y limitaciones.

Comprobar requisitos de uso y declaración de IA antes de entregar. Si se utiliza asistencia para código o textos, describirla de forma concreta. No sustituir imágenes NASA por imágenes generadas.

## 12. Primer paso de implementación

Comenzar por una prueba vertical pequeña: seis fotogramas reales, extractor, un manifiesto y un botón que reproduzca el barrido del fotograma visible. Su aprobación técnica requiere comprobar la imagen fuente, los ocho valores, las ocho notas y la cancelación al pausar.

Ese primer incremento resuelve el mayor riesgo del proyecto: que la traducción de imagen a sonido sea verificable y comprensible. Después se construyen el reproductor completo, la accesibilidad y el acabado visual.

## Fuentes consultadas

[1] NASA Space Apps, página oficial de equipo con resumen del reto:
https://www.spaceappschallenge.org/2026/find-a-team/proteas/

Ficha completa del reto, pendiente de recuperación y verificación de Resources:
https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/

[2] NASA SVS, galería Earth Information Center:
https://svs.gsfc.nasa.gov/gallery/earth-information-center/

[3] NASA SVS 5505, Perpetual Ocean 2: Equirectangular; incluye variante EIC de Agulhas:
https://svs.gsfc.nasa.gov/5505/

[4] MDN, Web Audio API: activación, contexto de audio y control de ganancia:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API

Las fórmulas, arquitectura, estimaciones y criterios de aceptación son propuestas propias para este proyecto. Las fuentes NASA se usan para fundamentar el reto y la procedencia del material, no para atribuirles estas decisiones técnicas.

