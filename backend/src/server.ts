import express,{Request,Response,NextFunction} from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import sqlite3 from 'sqlite3'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config();
const app=express()
const PORT=process.env.PORT || 5178
const db=new sqlite3.Database('./database.db')
db.run("PRAGMA foreign_keys=ON")

if(!process.env.JWT_SECRET)throw new Error('JWT_SECRET isnt set in .env')

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

//задачи
db.run(`create table if not exists tasks(
    id integer primary key autoincrement,
    description text,
    status text default 'todo',
    boardID integer,
    createdAt DATETIME DEFAULT (datetime('now', 'localtime')),
    foreign key (boardID) references boards(id) on delete cascade)
`)

//типа для данных
interface User{
    id:number,
    username:string,
    email:string,
    password:string
}

interface Board{
    id:number,
    boardname:string,
    content:string,
    userID:number
}

interface Task{
    id:number,
    title:string,
    description?:string,
    status:string,
    boardID:number
}

declare global{
    namespace Express{
        interface Request{
            userID?:number;
        }
    }
}

//проверка jwt токена
const auth=(req:Request,res:Response,next:NextFunction)=>{
    const token=req.headers.authorization?.split(' ')[1]

    if(!token)return res.status(401).json({error:'no token'})

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET!) as {userID:number}
        req.userID=decoded.userID
        next()
    }catch(error){return res.status(401).json({error:'incorrect token'})}
}

//post запросы      
//регистрация
app.post('/api/register',async (req:Request,res:Response)=>{
    console.log('получено',req.body)
    const {username,email,password}=req.body
    const hashedPassword=await bcrypt.hash(password,10)
    console.log('Отправляю:',{
        username: username,
        email: email,
        password: password
    })

    db.run(`insert into users (username,email,password) values (?,?,?)`,
        [username,email,hashedPassword],
        function(err){
            if(err)return res.status(400).json({error:'email already exists'})
            return res.json({message:'user created'})
        }
    )
})

//логин
app.post('/api/login',(req:Request,res:Response)=>{
    const {email,password}=req.body

    db.get(`select * from users where email=(?)`,[email],
        function(err,user:User){
            if(!user){
                console.log('пользователь не найден')
                return res.status(400).json({message:'user not found'})
            }
            
            bcrypt.compare(password,user.password,(err,isMatch)=>{
                if(!isMatch)return res.status(400).json({error:'password is wrong'})

                console.log('все в порядке')
                const token=jwt.sign(
                    {userID:user.id,email:user.email},
                    process.env.JWT_SECRET!,
                    {expiresIn:'7d'}
                )
                return res.json({
                message:'ok',
                token:token,
                user:{
                    id:user.id,
                    email:user.email,
                    username:user.username
                }})
            })
        }
    )
})

//создать задачу
app.post('/api/task',auth,(req:Request,res:Response)=>{
    const {description,boardID}=req.body
    const userID=req.userID

    if(!description||!boardID)return res.status(400).json({error:'description or boardID required'})

    db.get(`select * from boards where id=? and userID=?`,[boardID,userID],(err,board)=>{

        if(err){
            console.log(err?.message)
            return res.status(500).json({message:'ошибка проверки на дубли'})
        }

        if(!board)return res.status(403).json({error:'board not found'})

        db.get(`select * from tasks where description=? and boardID=?`,[description,boardID],(err,task)=>{
        
            if(err){
                console.log(err.message)
                return res.status(400).json({message:'ошибка проверки на дубли'})
            }

            if(task)return res.status(400).json({error:'задача с таким именем уже существует'})

            db.run(`insert into tasks (description,boardID) values (?,?)`,
                [description,boardID],
                function(err){
                    if(err)return res.status(400).json({error:err.message})
                    res.json({id:this.lastID,description,status:'todo',boardID})
                }
            )
        })
    })
})

//создать доску
app.post('/api/boards',auth,(req:Request,res:Response)=>{
    const {boardname,content}=req.body
    const userID=req.userID!

    if(!boardname)return res.status(400).json({message:'board has to have a name'})

    db.get(`select * from boards where boardname=? and userID=?`,[boardname,userID],(err,exictingBoard)=>{
        if(err){
            console.log(err.message)
            return res.status(500).json({message:'ошибка проверки на дубли'})
        }
        if(exictingBoard)return res.status(400).json({error:'доска с таким именем уже существует'})

        db.run(`insert into boards (boardname,content,userID) values(?,?,?)`,[boardname,content,userID],
        function(err){
            if(err){
                console.log(err.message)
                return res.status(500).json({error:'ошибка создания доски'})
            }
            console.log('доска создана')
            return res.json({id:this.lastID,boardname,content,userID})
        }
    )
    })
})

//get запросы
//получить все доски
app.get('/api/boards',auth,(req:Request,res:Response)=>{
    const userID=req.userID!

    db.all(`select * from boards where userID=?`,[userID],(err,rows:Board[])=>{
        if(err)return res.status(500).json({error:err.message})
        res.json(rows)
    })

})

//получить все задачи
app.get('/api/tasks/:boardID',auth,(req:Request,res:Response)=>{
    const boardID=req.params.boardID
    const userID=req.userID

    if(!boardID)return res.status(400).json({error:'boardID required'})

    db.get(`select * from boards where id=? and userID=?`,[boardID,userID],
        (err,board)=>{
            if(!board)return res.status(400).json({error:'access denied'})

            db.all(`select * from tasks where boardID=?`,[boardID],(err,rows:Task[])=>{
                if(err)return res.status(400).json({error:err.message})
                res.json(rows)
            })
        }
    )
})

//delete запрос
app.delete('/api/boards/:boardID',auth,(req:Request,res:Response)=>{
    const boardID=req.params.boardID
    const userID=req.userID

    if(!boardID)return res.status(400).json({error:'invalid board ID'})

    db.get(`select * from boards where id=?`,[boardID],(err,board:Board)=>{
        if(err){
            console.log('ошибка поиска доски: ',err.message)
            return res.status(500).json({error:'ошибка сервера'})
        }

            if(!board)return res.status(404).json({message:'доска не найдена'})

            if(board.userID!==userID)return res.status(403).json({error:'нет прав на удаление этой доски'})

            db.run(`delete from boards where id=? and userID=?`,[boardID,userID],
        function(err){
                    if(err)return res.status(500).json({error:'failed to delete board'})
                    res.json({message:'доска удалена'})
                }
            )
        
    })
})

//update запросы
app.put(`/api/tasks/:taskID`,auth,(req:Request,res:Response)=>{
    const userID=req.userID
    const taskID=req.params.taskID
    const boardID=req.body.boardID
    const status=req.body.status
    console.log('Обновляем задачу:', taskID, 'Статус:', status)

    try{
        db.get(`select tasks.* from tasks
            join boards on tasks.boardID=boards.id
            where tasks.id=? and boards.userID=?`,
        [taskID,userID],
            (err,task)=>{
                if(!task)return res.status(403).json({error:'access denied'})
                    db.run(`update tasks set status=? where id=?`,[status,taskID],
            function(err){
                if(err)return res.status(500).json({error:err.message})
                res.json({message:'статус задачи обновлен'})
            }
        )
            })
    }catch(error){console.log(error)}
})

//обновление имени доски
app.put(`/api/boards/:boardID`,auth,(req:Request,res:Response)=>{
    const userID=req.userID
    const boardID=req.params.boardID
    const newBoardName=req.body.newBoardName

    try{
        db.get(`select * from boards where id=? and userID=?`,[boardID,userID],(err,board)=>{
            if(err){
                console.log('ошибка select: ',err.message)
                return res.status(500).json({error:err.message})
            }
            if(!board){return res.status(403).json({error:'access denied'})}

            db.run(`update boards set boardname=? where id=?`,[newBoardName,boardID],
                function(err){
                    if(err){
                        console.log('ошибка update',err.message)
                        return res.status(500).json({error:err.message})
                    }
                    res.json({message:'имя доски обновлено'})
                }
            )
        })
    }catch(error){console.log(error)}
})

//обновление имени задачи
app.put(`/api/tasks/:taskID/newTaskName`,auth,(req:Request,res:Response)=>{
    const userID=req.userID
    const taskID=req.params.taskID
    const newTaskName=req.body.newTaskName

    try{
        db.get(`select tasks.* from tasks
            join boards on tasks.boardID=boards.id
            where tasks.id=? and boards.userID=?`,[taskID,userID],(err,task)=>{
                if(err){
                    console.log('ошибка select: ',err.message)
                    return res.status(500).json({error:err.message})
                }
                if(!task)return res.status(403).json({error:'access denied'})

                db.run(`update tasks set description=? where id=?`,[newTaskName,taskID],function(err){
                    if(err){
                        console.log('ошибка update: ',err.message)
                        return res.status(500).json({error:err.message})
                    }
                    res.json({message:'имя задача обновлено'})
                })
            })
    }catch(error){console.log(error)}
})


//запуск сервера
app.listen(PORT,()=>{
    console.log(`The server is running: http://localhost:${PORT}`)
})