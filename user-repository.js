import bcrypt from 'bcryptjs'
import DBLocal from 'db-local'
import crypto from 'node:crypto'
import { SALT_ROUNDS } from './config.js'
const {Schema}=new DBLocal({path:'./db'})

const User = Schema('User',{
    id:{type:Number,required:true},
    username:{type:String,required:true},
    password:{type:String,required:true}
})
export class UserRepository{
    static async create({username,password}){
        Validation.username(username)
        Validation.password(password)

        const user=User.findOne({username})
        if (user) throw new Error('username already exists')
        const allUsers = User.find() || []
        const ids = allUsers.map(u => Number(u.id)).filter(id => !isNaN(id))
        const nextId = ids.length ? Math.max(...ids) + 1 : 0

        const hashedPassword=await bcrypt.hash(password,SALT_ROUNDS); 
        
        User.create({
            id:nextId,
            username,
            password:hashedPassword
        }).save()
        return nextId
    }
    static async login({username,password}){
        Validation.username(username)
        Validation.password(password)
        
        const user=User.findOne({username})
        if(!user) throw new Error('username does not exist')
        const isValid=await bcrypt.compare(password,user.password)
        if (!isValid) throw new Error('password is invalid')
        const {password:_,...publicUser}=user
        return publicUser
    }
   
}
class Validation {
    static username(username){
        if(typeof username != 'string') throw new Error('username must be a string');
        if(username.length < 3) throw new Error('El username debe ser superior a 3 caracteres');
    }
    static password(password){
        if(typeof password != 'string') throw new Error('password must be a string');
        if(password.length < 6) throw new Error('password debe ser superior a 5 caracteres');
    }
}