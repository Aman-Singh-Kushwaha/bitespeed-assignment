import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import router from './routes';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router);

app.use(errorHandler);


app.get('/health', (req: Request, res: Response) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
