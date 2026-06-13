const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');

const PORT = Number(process.env.PORT) || 3006;

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutandose en el puerto ${PORT}`);
});
