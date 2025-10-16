import express from 'express';
import jwt from 'jsonwebtoken';
import {PORT, SECRET_JWT_KEY} from './config.js';
import cookieParser from 'cookie-parser';
import { UserRepository } from './user-repository.js';

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(express.static("public")); // Càrrega CSS i altres fitxers públics
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // Motor de plantilles
app.set('views', './views'); // Ubicació de les plantilles

app.get('/',(req,res)=>{
    res.render('login')
});  

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
