# Cubrí Seguros · Contratación digital de un seguro de celular

Trabajo Práctico de **Diseño UX/UI 2026** · Licenciatura en Sistemas de Información · FCyT, Sede Concepción del Uruguay.

- 🌐 **Sitio publicado:** 
- 📦 **Repositorio:** 

## Qué es

Front-end de un checkout de seguros: la persona elige el producto, cotiza, elige un plan, carga sus datos, paga y recibe su número de póliza. El foco está en el flujo y la experiencia, no en el servidor: **no hay backend, base de datos ni pagos reales**. Los planes salen de un JSON local y el pago es una función que simula la respuesta según el número de tarjeta.

## Stack

| Tecnología | Uso |
|---|---|
| HTML5 | Una sola página (`index.html`); cada paso es una `<section data-paso>` |
| Tailwind CSS v4 (CDN `@tailwindcss/browser@4`) | Layout, espaciado y responsive |
| Basecoat UI 1.1.0 (CDN, solo CSS) | Botones, campos, cards, badges y alertas |
| JavaScript vanilla (módulos ES) | Estado, validaciones, cálculo y pago simulado |
| Inter (Google Fonts) | Tipografía del diseño |

No se usó ningún framework ni librería de validación.

## Cómo correrlo

1. Clonar o descargar el repositorio.
2. Abrir la carpeta con **Live Server** (VS Code → clic derecho en `index.html` → *Open with Live Server*) o, desde una terminal dentro de la carpeta, ejecutar `npx serve`.
3. **No abrir `index.html` con doble click** (`file://`): el `fetch` de `data/planes.json` no funciona así y aparece un aviso.

No hay que instalar dependencias ni compilar. Como Tailwind, Basecoat y la fuente se cargan por CDN, hace falta conexión a internet.

## Estructura

```
index.html            maquetado de las 7 pantallas
css/tokens.css        tokens del diseño, estilos propios e íconos
data/planes.json      planes Básico, Plus y Premium
icons/                íconos SVG (escudo, celular, hogar, bicicleta, avión, check, x)
Capturas/             capturas mobile y desktop
js/app.js             arranque, eventos y navegación
js/estado.js          objeto `solicitud` y funciones para modificarlo
js/render.js          dibuja cada paso a partir del estado
js/validaciones.js    funciones puras: reciben un valor y devuelven un error o null
js/cotizador.js       calcularCuota() y formato de moneda
js/pago.js            simularPago() y generarPoliza()
```

## Pantallas y flujo

1. **Inicio / Catálogo:** 4 productos; solo Celular está habilitado, el resto dice "Próximamente".
2. **Cotizar (Paso 1):** marca, modelo, valor del equipo y antigüedad.
3. **Elegir plan (Paso 2):** Básico, Plus (preseleccionado, "Recomendado") y Premium, con la cuota calculada.
4. **Datos personales (Paso 3):** nombre, apellido, DNI, nacimiento, email, celular y términos.
5. **Pago (Paso 4):** resumen final, medio de pago, tarjeta, vencimiento, CVV y titular.
6. **Éxito:** titular, email, número de póliza y detalle.
7. **Error de pago:** mensaje claro, "Reintentar pago" y "Cambiar medio de pago", conservando los datos.

El stepper muestra cada paso como completo, activo o pendiente, y "Volver" lleva al paso anterior sin perder datos.

## Reglas de negocio

**Cuota mensual** = `Math.round(valor × tasaAnual / 12 × factorAntigüedad)`

| Plan | Tasa anual | Coberturas |
|---|---|---|
| Básico | 4 % | Robo con violencia |
| Plus | 6 % | Robo con violencia + rotura de pantalla |
| Premium | 9 % | Robo con violencia, rotura total y hurto / pérdida |

| Antigüedad | Factor |
|---|---|
| Menos de 1 año | 1,00 |
| 1 a 2 años | 1,10 |
| Más de 2 años | 1,25 |

**Casos de prueba verificados**

| Valor | Antigüedad | Básico | Plus | Premium |
|---|---|---|---|---|
| $ 600.000 | Menos de 1 año | $ 2.000 | $ 3.000 | $ 4.500 |
| $ 600.000 | 1 a 2 años | $ 2.200 | $ 3.300 | $ 4.950 |
| $ 1.200.000 | Más de 2 años | $ 5.000 | $ 7.500 | $ 11.250 |

**Tarjetas de prueba** (nunca se usan tarjetas reales)

| Número | Resultado |
|---|---|
| 4111 1111 1111 1111 | Aprobado → pantalla de éxito |
| 4000 0000 0000 0002 | Rechazado → pantalla de error |
| Cualquier otro número válido | Aprobado |

El número de póliza tiene el formato `POL-AAAA-NNNNNN`.

## Decisiones tomadas

**Estado y render**
- Toda la información del flujo vive en **un único objeto** (`solicitud`, en `estado.js`). Cada evento lo modifica y después se llama a `render()`; el DOM nunca se usa para calcular nada.
- Cada paso es una `<section data-paso>` que se muestra u oculta con el atributo `hidden`. Los campos se rellenan desde el estado en cada `render()`, por eso "Volver" y "Reintentar pago" no pierden datos.
- Los eventos se manejan con `addEventListener` en `app.js` (delegación de eventos); no hay lógica en atributos `onclick`.

**Validaciones y feedback**
- Cada validación es una función pura (`validarEmail(valor)`, etc.) que devuelve un mensaje o `null`.
- El error aparece **al salir del campo** (`blur`), no mientras se escribe, y se revalida todo al intentar avanzar; en ese caso el foco va al primer campo con error.
- Los botones "Ver planes", "Continuar al pago" y "Pagar y contratar" quedan deshabilitados hasta que todo sea válido, y un texto debajo explica **qué falta**.
- Accesibilidad: cada input tiene su `<label for>`, los errores usan `role="alert"`, `aria-invalid` y `aria-describedby`, y los íconos decorativos llevan `aria-hidden="true"`.

**Cálculo y pago**
- La cuota se calcula en **una sola función** (`calcularCuota()`), usada por las cards de plan y por el resumen, así nunca difieren.
- Los valores se limpian con `replace(/\D/g, "")` y se convierten con `Number()`; la moneda se formatea con `Intl.NumberFormat("es-AR")`.
- "Pagar y contratar" se deshabilita apenas se hace click (evita el doble pago), muestra "Procesando…" durante 1,5 s y solo se vuelve a habilitar si el pago falla.

**Interfaz**
- Se usaron los componentes de Basecoat que existen (botón, campo, card, badge y alert). El stepper y las cards de plan se armaron con utilidades de Tailwind y unas pocas reglas propias en `css/tokens.css`.
- Mobile first (390 px); los cambios de escritorio (1440 px) se agregan con el prefijo `lg:`.
- El resumen se genera **una sola vez** desde el estado (`renderResumen()`): barra fija sobre el botón en mobile y card lateral de 380 px en desktop.
- **Íconos:** son archivos SVG en `icons/`. Un `<span class="icono i-nombre">` los usa como máscara CSS, por lo que toman el color del texto (`text-white`, `text-emerald-600`…) y se dimensionan con clases de Tailwind (`size-4`). Para sumar uno nuevo basta con guardar el SVG en `icons/` y agregar una línea `.i-nombre` en `css/tokens.css`.
- El botón "Descargar póliza" abre el diálogo de impresión del navegador (se puede guardar como PDF).

## Capturas

Cada captura se tomó en dos tamaños: **iPhone 12 Pro** (390 px, el más cercano al diseño mobile) y **Desktop** (1440 px).

| Pantalla | Mobile | Desktop |
|---|---|---|
| Inicio / Catálogo | <img src="Capturas/Inicio%28iPhone%2012%20Pro%29.png" alt="Inicio(iPhone 12 Pro)" width="170"> | <img src="Capturas/Inicio%28Desktop%29.png" alt="Inicio(Desktop)" width="420"> |
| Cotizar (Paso 1) | <img src="Capturas/Datos%20Celular%28iPhone%2012%20Pro%29.png" alt="Datos Celular(iPhone 12 Pro)" width="170"> | <img src="Capturas/Datos%20Celular%28Desktop%29.png" alt="Datos Celular(Desktop)" width="420"> |
| Elegir plan (Paso 2) | <img src="Capturas/Plan%28iPhone%2012%20Pro%29.png" alt="Plan(iPhone 12 Pro)" width="170"> | <img src="Capturas/Planes%20%28Desktop%29.png" alt="Planes (Desktop)" width="420"> |
| Datos personales con error (Paso 3) | <img src="Capturas/Correo%20incompleto%28iPhone%2012%20Pro%29.png" alt="Correo incompleto(iPhone 12 Pro)" width="170"> | <img src="Capturas/Correo%20Incompleto%20%28Desktop%29.png" alt="Correo Incompleto (Desktop)" width="420"> |
| Datos personales válidos (Paso 3) | <img src="Capturas/Correo%20completo%28iPhone%2012%20Pro%29.png" alt="Correo completo(iPhone 12 Pro)" width="170"> | <img src="Capturas/Correo%20completo%28Desktop%29.png" alt="Correo completo(Desktop)" width="420"> |
| Pago (Paso 4) | <img src="Capturas/Pago%28iPhone%2012%20Pro%29.png" alt="Pago(iPhone 12 Pro)" width="170"> | <img src="Capturas/Pago%20%28Desktop%29.png" alt="Pago (Desktop)" width="420"> |
| Pago con la tarjeta de rechazo | <img src="Capturas/Pago2%28iPhone%2012%20Pro%29.png" alt="Pago2(iPhone 12 Pro)" width="170"> | <img src="Capturas/Pago2%28Desktop%29.png" alt="Pago2(Desktop)" width="420"> |
| Error de pago | <img src="Capturas/Error%28iPhone%2012%20Pro%29.png" alt="Error(iPhone 12 Pro)" width="170"> | <img src="Capturas/Error%28Desktop%29.png" alt="Error(Desktop)" width="420"> |
| Éxito | <img src="Capturas/Exito%28iPhone%2012%20Pro%29.png" alt="Exito(iPhone 12 Pro)" width="170"> | <img src="Capturas/Exito%20%28Desktop%29.png" alt="Exito (Desktop)" width="420"> |

## Autor

Sofia Orellana · Diseño UX/UI 2026