const express = require('express');
const cors = require('cors');
require('dotenv').config();

const statsRoute = require('./routes/stats');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/stats', statsRoute);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Dashboard backend running on port ${PORT}`);
});