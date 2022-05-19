import "reflect-metadata";
import express from "express";
import routes from './routes'

const port = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? 4041 : 4040);

const app = express();
console.log(`START NODE-CRUD-ORQUESTRADOR - AMBIENTE ${process.env.NODE_ENV}   PORTA ${port}`)

app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb'}));

app.use(express.json());
app.use(routes);

app.listen(port); 