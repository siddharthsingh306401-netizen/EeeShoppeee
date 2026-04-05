import express from 'express';
import cors from 'cors'; 
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(cors(
  {origin: 'http://localhost:3000', // Adjust this to your frontend's origin
    allowedHeaders : [ 'Authorization', 'Content-Type'],
    credentials : true,
  }
));

app.get('/', (req, res) => {
    res.send({ 'message': 'Utkarsh bkl'});
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 6001;
const server = app.listen(PORT, () => {
    console.log(`Auth service is running at http://localhost:${PORT}/api`);
});
server.on('error',(err) =>{ 
    console.log('Server error:', err);
})
    


