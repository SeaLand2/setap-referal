import express from 'express';
import * as db from './db_handler.js';
import * as url from 'url';

const app = express();
const PORT = 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Middleware to parse JSON bodies


function notFound(req, res) {
  res.status(404).sendFile(`${__dirname}/client/server-error-pages/404.html`);
}


app.use(express.static('client'));


// Middleware to handle JSON requests
//app.get('urlEnd', function);

app.get('/app/*subpage/', handleAppUrls); // Handle all app URLs
app.all('*all', notFound);


// Make the server listen on the specified port and log a message saying where to access it
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});