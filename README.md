# UCENM Calculator 

Calculadora web profesional desarrollada como proyecto académico para UCENM.
Diseño inspirado en Apple, con identidad propia y funcionalidades completas.

---

## Estructura del Proyecto

```
ucenm-calculator/
├── index.html       → Estructura HTML semántica
├── styles.css       → Estilos completos (modo claro/oscuro, animaciones)
├── calculator.js    → Lógica completa de la calculadora
└── README.md        → Esta documentación
```

---

## Características

### Diseño
- Estética **glassmorphism** con blur y transparencias
- Paleta de colores coherente con gradientes azul-violeta
- **Modo oscuro / claro** con toggle animado (persiste entre sesiones)
- **Orbs de fondo** animados flotantes como ambiente visual
- Tipografía **Space Grotesk** para un look moderno y distinguido
- Totalmente **responsive** para móvil, tablet y desktop

### Animaciones
- Entrada de la tarjeta calculadora con efecto **spring (pop-in)**
- **Ripple effect** en cada botón al presionar
- Botón de operador activo con resaltado gradient
- Flash de resultado al presionar `=`
- Panel de historial con deslizamiento suave
- **Toast notification** al copiar el resultado
- Hover con elevación suave en todos los botones

### Funcionalidad
- **Operaciones básicas**: suma, resta, multiplicación, división
- **Porcentaje** (relativo al número anterior si hay operador activo)
- **Cambio de signo** (+/−)
- **Decimal** con prevención de doble punto
- **Encadenamiento de operaciones** sin necesidad de presionar = entre cada una
- **Historial** de últimas 30 operaciones (con panel deslizante)
  - Click en un item del historial para recuperar ese resultado
  - Botón para limpiar el historial
- **Copiar resultado** al portapapeles con botón dedicado
- Ajuste dinámico del tamaño de fuente según longitud del número
- Manejo de **error** en división por cero
- Máximo **15 dígitos** de entrada

### Teclado
| Tecla | Acción |
|-------|--------|
| `0-9` | Dígitos |
| `.` | Decimal |
| `+`, `-`, `*`, `/` | Operadores |
| `Enter` / `=` | Igual |
| `Escape` | Limpiar todo (AC) |
| `Backspace` | Borrar último dígito |
| `%` | Porcentaje |

---

## Despliegue en Servidor

El proyecto es **100% estático** — no requiere backend ni build tools.

### Opción 1 – Servidor propio / cPanel
1. Subir los 3 archivos (`index.html`, `styles.css`, `calculator.js`) a la carpeta `public_html` o la raíz del dominio.
2. Listo. Acceder desde el navegador.

### Opción 2 – GitHub Pages (gratuito)
1. Crear repositorio en GitHub.
2. Subir los 3 archivos.
3. Ir a *Settings → Pages → Source: main branch*.
4. URL pública: `https://tuusuario.github.io/ucenm-calculator/`

### Opción 3 – Netlify / Vercel (gratuito)
1. Arrastrar la carpeta del proyecto a [netlify.com/drop](https://app.netlify.com/drop).
2. Netlify genera una URL pública al instante.

---

## 🛠 Personalización

### Cambiar colores principales
En `styles.css`, modificar las variables en `:root`:
```css
--accent:   #5B8BF5;   /* Color principal (azul) */
--accent-2: #A78BFA;   /* Color secundario (violeta) */
```

### Cambiar nombre/logo
En `index.html`, editar la sección `.brand`:
```html
<span class="brand-name">UCENM</span>
<span class="brand-sub">Calculator</span>
```

---

## 🎓 Información Académica

**Proyecto**: Calculadora Web  
**Universidad**: UCENM | Universidad Critiana Evangelica Nuevo Milenio
**Tecnologías**: HTML5, CSS3 (variables, grid, backdrop-filter), JavaScript ES6+  
**Sin dependencias externas** (salvo Google Fonts)

---

*Desarrollado con <3 para UCENM © 2025*
