const express=require('express')
const cors=require('cors')
const app=express()
const jwt=require('jsonwebtoken')
require('dotenv').config()
const PORT=5178
const sqlite3=require('sqlite3').verbose()
const db=new sqlite3.Database('./database.db')
app.use(cors())
app.use(express.json())

//бд
//юзеры
db.run(`create table if not exists users(
    id integer primary key autoincrement,
    username text,
    email text unique,
    password text
)`)

//доски
db.run(`create table if not exists boards(
    id integer primary key autoincrement,
    boardname text,
    content text,
    userID integer  
)`)

//проверка jwt токена
const auth=(req,res,next)=>{
    const token=req.headers.authorization?.split(' ')[1]

    if(!token)return res.status(401).json({error:'no token'})

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.userID=decoded.userID
        next()
    }catch(error){return res.status(401).json({error:'incorrect token'})}
}

//post запросы
//регистрация
app.post('/api/register',(req,res)=>{
    console.log('получено',req.body)
    const {username,email,password}=req.body

    db.run(`insert into users (username,email,password) values (?,?,?)`,
        [username,email,password],
        function(err){
            if(err){
                return res.status(400).json({error:'email already exists'})
                console.log('ошибка:',err.message)
            }
            return res.json({message:'user created'})
        }
    )
})

//логин
app.post('/api/login',(req,res)=>{
    const {email,password}=req.body

    db.get(`select * from users where email=(?)`,[email],
        function(err,user){
            if(!user){
                console.log('пользователь не найден')
                return res.status(400).json({message:'user not found'})
            }
            if(password!==user.password){
                console.log('пароль неверный')
                return res.status(400).json({message:'password is wrong'})
            }
            console.log('все в порядке')
            
            const token=jwt.sign(
                {userID:user.id,email:user.email},
                process.env.JWT_SECRET,
                {expiresIn:'7d'}
            )
            
            return res.json({
                message:'ok',
                token:token,
                user:{
                    id:user.id,
                    email:user.email,
                    username:user.username
                }
            }
            )
        }
    )

})

//создать доску
app.post('/api/boards',auth,(req,res)=>{
    const {boardname,content}=req.body
    const userID=req.userID

    if(!boardname)return res.status(400).json({message:'board has to have a name'})

    db.run(`insert into boards (boardname,content,userID) values(?,?,?)`,[boardname,content,userID],
        function(err){
            if(err){
                console.log(err.message)
                return res.status(500).json({error:'ошибка создания доски'})
            }
            console.log('доска создана')
            return res.json({message:'success'})
        }
    )
})

//get запросы
app.get('/api/boards',auth,(req,res)=>{
    const userID=req.userID

    db.all(`select * from boards where userID=?`,[userID],(err,rows)=>{
        if(err)return res.status(500).json({error:err.message})
        res.json(rows)
    })

})

//delete запрос
app.delete('/api/boards/:boardID',(req,res)=>{
    const boardID=req.params.boardID

    db.all(`delete from boards where id=?`,[boardID],
        function(err){
            if(err)return res.status(500).json({error:err.message})
            res.json({message:'доска удалена'})
        }
    )
})

//запуск сервера
app.listen(PORT,()=>{
    console.log(`The server is running: http://localhost:${PORT}`)
})