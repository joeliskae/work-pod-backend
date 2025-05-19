import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Morjesta pöytään toivottelee bäkkäri!' });
});

app.listen(PORT, () => {
  console.log(`Serveri pyörii portissa ${PORT}`);
});
