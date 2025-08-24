const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { deobfuscateCode } = require('./deobfuscator');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temp folder for file uploads

app.use(bodyParser.text({ limit: '1mb' })); // Handle pasted text
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Deobfuscation endpoint
app.post('/deobfuscate', upload.single('file'), (req, res) => {
  let inputCode = req.body.code; // From textarea
  const verbose = !!req.body.verbose;

  // If file uploaded, read it
  if (req.file) {
    inputCode = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path); // Clean up
  }

  if (!inputCode) {
    return res.status(400).send('Error: No code provided.');
  }

  try {
    const deobfuscated = deobfuscateCode(inputCode, verbose);
    res.send(`
      <html>
        <body>
          <h1>Deobfuscation Result</h1>
          <pre>${deobfuscated}</pre>
          <a href="/">Back</a>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}<br><a href="/">Back</a>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
