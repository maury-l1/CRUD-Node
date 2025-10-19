import express from 'express';
import jwt from 'jsonwebtoken';
import bookRoutes from './routes/bookRoute.js';
import {PORT, SECRET_JWT_KEY} from './config.js';
import cookieParser from 'cookie-parser';
import { UserRepository } from './user-repository.js';
import methodOverride from 'method-override';

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(express.static("public")); // Sirve para usar css en varios ficheros y cargar codigo publico
app.use(express.urlencoded({ extended: true })); // para leer datos de formulario
app.use(methodOverride('_method')); // permite usar PUT/DELETE con formularios
app.set('view engine', 'ejs'); // Motor de plantillas
app.set('views', './views'); // Ubicacion de las plantillas 

app.get('/',(req,res)=>{
    res.render('login')
});  
//Middleware
app.use((req,res,next)=>{
    const token =req.cookies.access_token
    req.session={user: null}
    try{
        const data=jwt.verify(token,SECRET_JWT_KEY)
        req.session.user=data
    }catch(error){
        req.session.user=null
    }
    next() 
})

app.use('/bookRoute', bookRoutes)

app.post('/login', async (req,res)=>{
    try{
        const {username,password}=req.body
        const user = await UserRepository.login({username,password})
        const token = jwt.sign(
            {id: user._id, username: user.username},
            SECRET_JWT_KEY, 
            {
            expiresIn:'1h'
            })
        res.cookie('access_token',token,{
            httpOnly:true, 
            
            secure: process.env.NODE_ENV==='production',
            sameSite:'strict', 
            maxAge:1000*60*60 
        })
        .send({ user,token })
    }catch (error){
        res.status(401).send(error.message)
    }
});

app.post('/register', async (req,res)=>{
    
    const {username,password}=req.body
    console.log(req.body)
    try{
        const id= await UserRepository.create({username,password});
        res.send({id})
    }catch(error){
        res.status(400).send(error.message)
    }
});

app.get('/protected',(req,res)=>{
    const {user}=req.session
    if (!user) return res.status(403).send('acceso no autorizado')
    res.render('home',user)
});

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});
