import express from 'express';
import 'dotenv/config';
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Hello, Bitespeed!');
});