# divide-expenses

**Reparto de consumos entre personas, con impuestos y propina.**

La idea es dividir una cuenta según lo que consumió cada participante. Se cargan productos con precio y cantidad, se asignan unidades a cada persona y se consulta su total individual.

## Qué incluye

- Alta y consulta de participantes.
- Registro y eliminación de productos o tickets con precio y cantidad.
- Asignación de cantidades a cada participante.
- Consulta de consumos por persona.
- Cálculo del total individual con impuesto porcentual y propina por porcentaje o importe fijo.
- API con persistencia en MongoDB mediante Mongoose.

Por ejemplo: cargar las bebidas de una mesa, asignar cuántas tomó cada persona y calcular el importe correspondiente con propina.

## Tecnologías y estructura

| Parte | Implementación |
| --- | --- |
| Aplicación móvil | React Native, Expo SDK 51 y React Navigation |
| Comunicación | Peticiones HTTP a la API |
| Servidor | Node.js y Express |
| Datos | MongoDB y Mongoose |

Las pantallas están en `src/`. El servidor utilizado por esos flujos está en `src/db/server.js`.

## Ejecutar en desarrollo

Requiere Node.js, npm, una instancia de MongoDB y un dispositivo o emulador compatible con la versión de Expo del proyecto.

```bash
git clone https://github.com/mateorogatky/divide-expenses.git
cd divide-expenses
npm install
```

1. Configurar la conexión de MongoDB en `src/db/server.js` para el entorno de prueba.
2. Reemplazar las direcciones `API_URL` de las pantallas en `src/` por la dirección accesible del servidor. En un teléfono físico, usar la IP del equipo en la misma red.
3. Iniciar la API en una terminal:

```bash
cd src/db
npm install
npm start
```

La API escucha en el puerto 5000. En otra terminal, desde la raíz:

```bash
npm start
```

## Estado

Prototipo en desarrollo. La configuración de red y de base de datos todavía está definida en el código. No incluye un flujo de pago: los importes son cálculos para repartir la cuenta.

Próximas mejoras propuestas: centralizar la URL de la API, externalizar la configuración de MongoDB y mejorar la consistencia de cantidades al modificar o eliminar asignaciones.

## Autor

[Mateo Nicolás Rogatky](https://github.com/mateorogatky)
