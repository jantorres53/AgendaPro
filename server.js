const express = require('express');
const app = express();
const path = require('path');

// Servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
  console.log('Servidor funcionando en http://localhost:3000');
});
