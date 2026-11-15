# Earth Jukebox · Fase 2 · Sonificación de los vídeos

Propuesta actualizada · 15 de noviembre de 2026. Enfoque acordado de análisis en navegador con TypeScript, Canvas y Web Audio API.

## Objetivo

### Estado de implementación · 15 de noviembre de 2026

Integrado SonifiedVideo.tsx en las tarjetas y el mapa. Analiza el vídeo visible con Canvas, usa ocho columnas de luminancia lineal y sintetiza notas con Web Audio. Incluye perfiles iniciales de timbre y registro por identificador, interruptor, volumen, cancelación y reproducción visual de respaldo. La implementación actual usa un recorte central común y un mapeo de luminosidad para todas las piezas.

Pendientes de validación sobre vídeos reales las máscaras por pieza, los perfiles específicos de color y eventos, la calibración sonora y las pruebas de latencia y móviles. La resolución DNS de svs.gsfc.nasa.gov falló en el entorno de ejecución durante esta sesión. La compilación y las pruebas existentes del catálogo pasaron; estas pruebas no verifican la calidad del audio ni el acceso CORS en el navegador.

Dar a cada vídeo una identidad sonora reconocible que evolucione con la imagen. El usuario abre la modal, pulsa reproducir y escucha patrones de la Tierra traducidos a sonido. Pausa, avance, volumen y cierre controlan conjuntamente imagen y sonificación.

Este documento amplía Earth_Jukebox_Plan.md y adapta su método al catálogo y al reproductor actuales. Las reglas y timbres siguientes son propuestas pendientes de calibración y escucha sobre los vídeos completos.

Para esta segunda fase, las decisiones de este documento sustituyen la preparación previa con Python y los manifiestos de rasgos descritos en el plan base. El flujo acordado es vídeo visible → Canvas → análisis TypeScript → síntesis Web Audio.

## Punto de partida

- App.tsx reproduce los vídeos de las tarjetas mediante un elemento video con controles nativos.
- exploreVideos.ts contiene ocho vídeos únicos. PlanetQuestions.tsx añade ocho identificadores nuevos y reutiliza Dixie. Las dos secciones suman dieciséis piezas únicas.
- mapVideos.ts añade Agulhas, otras dos visualizaciones de hielo y precipitación. El alcance completo suma veinte identificadores principales, además de sus variantes y archivos de respaldo.
- frameSound.ts ya genera una muestra breve a partir de cuatro fotogramas, ocho columnas y una escala de notas. Se puede reutilizar la idea del mapeo y las envolventes.
- Esa muestra analiza un recorte fijo, utiliza luminancia sobre canales sRGB y crea voces sin un registro explícito de cancelación. La segunda fase necesita análisis calibrado, duración completa y limpieza de todas las voces.

## Experiencia sonora propuesta

Cada pieza tendrá un timbre inspirado en su tema. Los patrones extraídos de las imágenes dirigirán notas, pulsos o filtros. La guía explicará la relación audible en una frase en español e inglés.

La interfaz identificará el resultado como «Sonificación de imágenes NASA». Los timbres de agua, viento o fuego serán síntesis artística. Las magnitudes físicas solo se mostrarán cuando exista una fuente numérica validada y un mapeo documentado.

El sonido inicial será moderado, con transiciones suaves. Una voz melódica principal y una textura ligera bastan para el primer prototipo. El volumen maestro será independiente de las variables representadas.

## Catálogo y dirección sonora

Las señales de esta tabla son candidatas. Antes de activarlas se deben inspeccionar las leyendas, las máscaras y los cambios de plano de cada archivo. La densidad de trazos y el color representan rasgos de la visualización. Cada perfil documentará su interpretación exacta.

| Pieza / ID NASA | Timbre propuesto | Señal visual candidata y respuesta sonora |
|---|---|---|
| Altura de los bosques · 4950 | Notas de madera suaves | Cobertura de color dentro de la zona forestal → altura de nota por columna |
| Incendio Dixie · 4993 | Percusión seca y textura crepitante | Nuevos píxeles de la zona resaltada → pulsos, con densidad limitada |
| Corrientes oceánicas · 5425 | Tonos fluidos y textura acuática | Proporción de trazos luminosos → notas que recorren la imagen |
| Hielo ártico · 5382 | Campanas delicadas | Cobertura visual del hielo → altura sostenida y brillo tímbrico |
| Viento superficial · 5148 | Ruido filtrado suave | Densidad de trazos visibles → apertura del filtro |
| Rayos · 5011 | Pulsos breves y resonantes | Aparición de destellos en la región válida → eventos por zona |
| Temperatura global · 5207 | Tonos cálidos y fríos | Proporción de colores de la leyenda → dos registros sonoros |
| Espiral climática · 5190 | Tono continuo | Radio de la curva activa, si se puede aislar → altura progresiva |
| Nivel del mar · 5516 | Tono acuático sostenido | Posición de la curva activa, si es legible → altura de nota |
| Humo de Canadá · 5631 | Textura de aire | Cobertura de la pluma resaltada → filtro y densidad sonora |
| Vegetación · 31053 | Notas de madera | Cobertura por clases de color → altura y duración de notas |
| CO₂ · 5024 | Sonido aéreo sostenido | Distribución de colores válidos → registro y brillo |
| Luces nocturnas · 5313 | Pulsos cristalinos | Puntos luminosos por región → densidad de notas |
| Terremotos · 2893 | Golpes graves suaves | Nuevos marcadores → eventos; controlar acumulación y solapamiento |
| Humedad del suelo · 31178 | Gotas tonales | Distribución de colores de la leyenda → altura y espaciado |
| Cultivos del desierto · 15025 | Pulsos de madera y tonos suaves | Cobertura visible de cultivos → notas por columna |
| Corriente de Agulhas · 5505 | Mismo perfil oceánico | Trazos dentro del recorte elegido → barrido de ocho notas |
| Hielo ártico del mapa · 5046 | Mismo perfil de hielo | Cobertura del hielo dentro de la máscara → altura sostenida |
| Hielo antártico · 5064 | Mismo perfil de hielo | Cobertura del hielo dentro de la máscara → altura sostenida |
| Precipitación · 4897 | Gotas y pulsos ligeros | Clases de color visibles → densidad de pulsos |

El respaldo de luces nocturnas, 5475, muestra otra pieza y necesita perfil propio. Los formatos alternativos y las versiones españolas se comprobarán por separado. Compartir un identificador temático no garantiza que coincidan sus tiempos.

## Método de análisis

1. Inventariar la URL exacta, duración, dimensiones, idioma, audio incorporado, fuente, créditos y hash de cada variante utilizada.
2. Elegir regiones y máscaras que excluyan títulos, leyendas, bordes y elementos ajenos a la señal. Dividir en segmentos si cambia la cámara o la composición.
3. Leer el fotograma del mismo elemento video que ve el usuario mediante Canvas y analizarlo con TypeScript durante la reproducción. Empezar con un lienzo de 128 píxeles de ancho que conserve la proporción del recorte. Web Audio sintetizará la respuesta a los valores recién obtenidos.
4. Probar inicialmente cuatro muestras por segundo para señales continuas. Los destellos y eventos rápidos necesitan análisis a frecuencia suficiente, hasta cada fotograma si procede. Ajustar tras medir coste y pérdidas.
5. Para luminancia, convertir sRGB a RGB lineal y aplicar el método del plan original. Mantener ocho columnas, valores entre cero y uno y null cuando no haya píxeles válidos.
6. Para clases de color, fijar rangos y máscara a partir de la leyenda inspeccionada. Para movimiento, separar cambios de cámara antes de interpretar diferencias entre imágenes.
7. Fijar rangos de normalización por pieza y versión. Registrar calibración y mantener resultados reproducibles.
8. Validar principio, mitad, final y cada transición. Las zonas sin datos producirán silencio identificado.

El primer perfil utilizará la escala MIDI [48, 50, 52, 55, 57, 60, 62, 64]. Cada 250 ms leerá una columna del instante correspondiente del vídeo. Un barrido recorre ocho columnas en dos segundos mientras el vídeo continúa. Esta regla adapta el barrido por fotogramas del plan original a la reproducción continua.

Los perfiles posteriores podrán usar señales continuas o eventos. Si una curva o región no se puede extraer con fiabilidad, se revisará el recorte o se aplicará el perfil de luminancia, con una explicación específica del método finalmente utilizado.

## Integración técnica

Usar React, TypeScript, Vite, Canvas y Web Audio API. Esta fase se desarrolla íntegramente en el frontend. Reutilizar el mapeo y las envolventes de frameSound.ts y adaptar su análisis al elemento video visible, con registro y cancelación de todas las voces. Python y la extracción previa quedan como una posible optimización posterior, si las mediciones de rendimiento la justifican.

| Componente previsto | Responsabilidad |
|---|---|
| Catálogo existente | Referencia a un perfil de sonificación por variante |
| src/sonification/analyzeFrame.ts | Lectura de Canvas, máscaras y cálculo de rasgos en TypeScript |
| src/sonification/profiles.ts | Configuración por variante, recortes, máscaras, mapeos y guías |
| src/sonification/mapping.ts | Traducción determinista de rasgos a parámetros sonoros |
| src/sonification/engine.ts | AudioContext, voces, filtros, volumen y cancelación |
| src/sonification/useVideoSonification.ts | Eventos del reproductor y sincronización |
| App.tsx y reproductor del mapa | Controles, estado y guía de escucha |

El perfil incluirá schemaVersion, videoId, variantId, URL y versión de la fuente, segmentos, recorte, máscara, versión del analizador, parámetros de sonido, calibración, créditos y guía bilingüe. Se registrarán hash y duración al preparar una copia alojada. Los tiempos de segmentos se expresarán en segundos del archivo concreto. Las fechas representadas se conservarán como metadatos aparte.

Un mismo vídeo usado en varias tarjetas compartirá perfil cuando coincida la variante. Solo se analizará el vídeo activo. Los rasgos recientes se conservarán en memoria para suavizar la respuesta y se descartarán al cambiar de sesión.

### Acceso a los píxeles y rendimiento

La primera comprobación será reproducir un vídeo NASA con crossOrigin="anonymous", configurado antes de src, dibujar un fotograma y leerlo con getImageData. Registrar el resultado para cada origen y variante. Si el servidor impide esa lectura, preparar una copia optimizada del vídeo con sus créditos en nuestro alojamiento y configurar su origen para permitir el análisis. El mismo archivo alimentará imagen y sonido.

Usar requestVideoFrameCallback cuando esté disponible y limitar la frecuencia efectiva de análisis. Como alternativa, usar requestAnimationFrame con control del tiempo y detectar avances de currentTime. Empezar a cuatro muestras por segundo y medir el coste en móvil. Para eventos rápidos, aumentar la frecuencia solo después de comprobar rendimiento y explicar la resolución temporal conseguida.

Mantener el lienzo y los buffers reutilizables fuera del estado de React. Medir tiempo de análisis, fotogramas perdidos y retraso audible. Reducir resolución o complejidad cuando sea necesario. Un Worker con OffscreenCanvas será una mejora condicionada por esas mediciones.

## Sincronización y controles

- El fotograma presentado será la referencia. Asociar cada lectura a mediaTime o currentTime y aplicar sus parámetros a AudioContext.currentTime con una rampa breve. El motor responderá a la última muestra válida y cancelará eventos basados en fotogramas antiguos. La antigüedad máxima aceptada dependerá de la frecuencia de muestreo.
- Play habilitará el contexto de audio tras la interacción. El sonido comenzará cuando el vídeo presente su primer fotograma analizable y el perfil esté cargado.
- Pausa, seeking, waiting, ended y error cancelarán voces y eventos pendientes. Al continuar se reanclará la posición actual.
- Seek, cambios de velocidad, idioma o archivo de respaldo invalidarán la sesión anterior. Cada variante tendrá su propio perfil validado. Reiniciar también el historial de diferencias entre fotogramas al saltar o cambiar de archivo.
- Cerrar con X, Escape, cambiar de vídeo, ocultar la pestaña o desmontar detendrá el sonido. La limpieza contemplará también osciladores programados para el futuro.
- Volumen y silencio controlarán un GainNode maestro. Se comprobará el comportamiento de los controles nativos en móvil y se añadirá un control explícito cuando sea necesario.
- Auditar el audio original de cada archivo. La experiencia de sonificación usará una reproducción visual silenciosa y un control maestro para el sonido sintetizado. Si se conserva audio original como opción, tendrá selección explícita y un comportamiento de mezcla definido.
- Ante un fallo de sonificación, ofrecer reintento y reproducción del vídeo en silencio. Mostrar el estado de carga o fallo con texto breve accesible.

Medir el retraso desde cada fotograma analizado hasta su respuesta sonora, con un objetivo inicial inferior a 100 ms. Registrar también el intervalo de muestreo, inicialmente 250 ms, que limita la detección de cambios entre muestras. Para eventos rápidos, ajustar la frecuencia y comprobar la latencia total con captura audiovisual.

## Interfaz

La modal conservará el vídeo grande y la X con el color de la sección. Debajo tendrá un interruptor «Sonificación», volumen y una frase de guía, por ejemplo «Más trazos luminosos producen notas más agudas». Un desplegable permitirá consultar el método y la fuente.

El estado de reproducción de las tarjetas se conectará al reproductor real. Los controles tendrán nombres accesibles y foco visible. La posición estéreo podrá aportar contexto espacial, manteniendo una lectura comprensible en mono.

## Orden de implementación

| Paso | Entrega | Criterio de cierre |
|---|---|---|
| 1 | Prueba de Canvas con corrientes e inventario de variantes | Lectura de píxeles verificada; resolver alojamiento si falla CORS |
| 2 | Prototipo oceánico de 30–60 segundos | Imagen y sonido relacionados; pausa, salto y cierre comprobados |
| 3 | Motor común y modal | Una única sesión activa; volumen, errores y limpieza resueltos |
| 4 | Océanos, bosques y viento completos | Tres perfiles calibrados y escuchados en auriculares y altavoces |
| 5 | Todas las tarjetas | Dieciséis piezas únicas y variantes cubiertas |
| 6 | Piezas adicionales del mapa | Veinte piezas principales cubiertas y perfiles compartidos por variante |
| 7 | Revisión final | Guías bilingües, pruebas, fuentes y catálogo validados |

Estimación orientativa de 1–2 jornadas para el prototipo y 4–8 jornadas en total para la integración y calibración del catálogo. El alojamiento de vídeos y los perfiles complejos pueden ampliar ese plazo. Revisar después del prototipo oceánico. La primera entrega será un tramo de corrientes que permita escuchar y ajustar el carácter sonoro antes de extenderlo al catálogo.

## Verificación y definición de terminado

- Pruebas de mapeo con señales crecientes, extremos y regiones vacías. Los mismos píxeles, perfil y versión deben producir los mismos parámetros sonoros. La cadencia real se comprobará por separado porque depende de los fotogramas presentados por el dispositivo. Las texturas de ruido usarán semilla fija si intervienen en la representación.
- Pruebas del transporte para play repetido, seek rápido, cambio de vídeo y cierre durante carga. Confirmar que ninguna sesión antigua conserva voces.
- Validación de cada perfil contra el archivo correspondiente, lectura CORS, comportamiento ante Canvas bloqueado y detección de perfiles pendientes.
- Escucha real de cada pieza completa, incluidos transiciones, silencios y final. Ajustar amplitud y límites de polifonía para evitar saturación digital y cambios abruptos.
- Probar Chrome/Edge y un navegador móvil disponible. Registrar dispositivos, comportamiento del volumen, reproducción bloqueada y fallos de red.
- Comprobar teclado, Escape, foco, nombre de controles y alternativa textual. El lector de pantalla recibirá estados importantes sin anunciar cada nota.
- Ejecutar build y pruebas del proyecto. Publicar cuando la sonificación cubra todas las variantes servidas o estas queden identificadas como pendientes con acceso al vídeo.

Esta fase queda completada cuando cada vídeo accesible desde tarjetas y mapa tiene un perfil verificable, sonido sincronizado durante toda su duración, controles fiables y una explicación breve de lo que se escucha.

## Referencias de implementación

El plan base se consultó en su versión 3. El inventario procede de exploreVideos.ts, PlanetQuestions.tsx y mapVideos.ts, revisados el 15 de noviembre de 2026. Los métodos de la tabla son propuestas de desarrollo y requieren validación sobre las imágenes.

La activación de audio por interacción y los controles de usuario se apoyan en las recomendaciones de Web Audio. [MDN · Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

La lectura de píxeles externos depende de permisos CORS. La implementación comprobará esos permisos antes del análisis y utilizará una copia alojada con acceso permitido cuando sea necesario. [MDN · Cross-origin images in canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image)
