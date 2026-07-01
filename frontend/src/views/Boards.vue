<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h2">Ваши доски</h1>
    </div>

    <div class="row g-2 mb-4">
      <div class="col-sm-5">
        <input v-model="boardname" type="text" class="form-control" placeholder="Название доски">
      </div>
      <div class="col-sm-2">
        <button @click="createBoard" class="btn btn-primary w-100">Создать</button>
      </div>
    </div>

    <div v-if="loading" class="text-center">Загрузка...</div>
    <div v-else class="row">
      <div class="col-md-4 mb-3" v-for="board in boards" :key="board.id">
        <div class="card h-100 shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <div v-if="editBoardID === board.id" class="d-flex gap-2">
                <input v-model="editBoardName" type="text" class="form-control form-control-sm" placeholder="Новое название" @keyup.enter="saveBoardName(board.id)">
                <button class="btn btn-success btn-sm" @click="saveBoardName(board.id)">Сохранить</button>
                <button class="btn btn-secondary btn-sm" @click="editBoardID=null">Отмена</button>
              </div>
              <h5 v-else class="card-title mb-0">{{ board.boardname }}</h5>
              <span class="badge bg-secondary">{{ tasks[board.id]?.length || 0 }}</span>
            </div>
            
            <div class="dropdown">
              <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="removeBoard(board.id)">Удалить доску</a></li>
                <li><a class="dropdown-item text" href="#" @click.prevent="startEditBoard(board)">Изменить название</a></li>
              </ul>
            </div>
          </div>
          
          <div class="card-body">
            <p class="addTask" @click="showTaskInput[board.id] = true">+ Добавить задачу</p>

            <div v-if="!tasks[board.id]?.length" class="text-muted">
              Нет задач. Добавьте первую!
            </div>

            <div v-if="showTaskInput[board.id]">
              <input @blur="showTaskInput[board.id] = false" @keyup.enter="createTask(board.id)" v-model="description[board.id]" type="text" class="form-control mt-2" placeholder="Название задачи">
            </div>

            <div v-for="task in tasks[board.id] || []" :key="task.id" class="mt-2 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div 
                  class="task-status" 
                  :class="{ done: task.status === 'done' }"
                  @click="updateTaskStatus(board.id, task)"
                >
                  <svg v-if="task.status === 'done'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </div>

                <div>
                  <div v-if="editTaskID === task.id" class="d-flex gap-2">
                    <input v-model="editTaskName" type="text" class="form-control form-control-sm" placeholder="Новое название" @keyup.enter="saveTaskName(task.id)">
                    <button class="btn btn-success btn-sm" @click="saveTaskName(task.id)">Сохранить</button>
                    <button class="btn btn-secondary btn-sm" @click="editTaskId = null">Отмена</button>
                  </div>
                  <span v-else class="task-text" :class="{ done: task.status === 'done' }">{{ task.description }}</span>
                  <div class="task-date text-muted small">
                    {{ formatDate(task.createdAt) }}
                  </div>
                </div>
              </div>

              <div class="dropdown">
                <button class="btn btn-link text-secondary p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  </svg>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item text-danger" href="#" @click.prevent="deleteTask(task.id)">Удалить задачу</a></li>
                  <li><a class="dropdown-item text" href="#" @click.prevent="startEditTask(task)">Изменить задачу</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import axios from 'axios'

const showTaskInput=ref({})
const boardname=ref('')
const newBoardName=ref('')
const editBoardID=ref(null)
const editBoardName=ref('')
const newTaskName=ref('')
const boards=ref([])
const tasks=ref({})
const description=ref({})
const loading=ref(true)

const editTaskID=ref(null)
const editTaskName=ref('')

const formatDate=(dateString)=>{
    if(!dateString)return ''
    
    const date=new Date(dateString)
    date.setHours(date.getHours()+5) //времеенно решение для моего часового пояса
    
    return date.toLocaleDateString('ru-RU',{
        day:'2-digit',
        month:'2-digit',
        year:'numeric',
        hour:'2-digit',
        minute:'2-digit'
    })
}

const startEditTask=(task)=>{
    editTaskID.value=task.id
    editTaskName.value=task.description
}

const saveTaskName=async(taskID)=>{
    const token=localStorage.getItem('token')
    const payload={newTaskName:editTaskName.value}
    console.log('отправляю: ',payload)

    try{
        await axios.put(`http://localhost:5178/api/tasks/${taskID}/newTaskName`,payload,{headers:{Authorization:`Bearer ${token}`}})
        editTaskName.value=''
        editTaskID.value=null
        await fetchboard()

    }catch(error){console.log(error)}
}

const startEditBoard=(board)=>{
    editBoardID.value=board.id
    editBoardName.value=board.boardname
}

const saveBoardName=async(boardID)=>{
    const token=localStorage.getItem('token')
    const payload = { newBoardName: editBoardName.value }
    console.log('Отправляю:', payload)
    try{
        await axios.put(`http://localhost:5178/api/boards/${boardID}`,{newBoardName:editBoardName.value},{headers:{Authorization:`Bearer ${token}`}})
        editBoardName.value=''
        editBoardID.value=null
        await fetchboard()
    }catch(error){console.log(error)}
}

const fetchboard=async()=>{
    loading.value=true
    const res=await axios.get('http://localhost:5178/api/boards',
        {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
    )
    boards.value=res.data
    for(const board of boards.value)await getTasks(board.id)
    loading.value=false
}

const getTasks=async(boardID)=>{
    try{
        const token=localStorage.getItem('token')
        const res=await axios.get(`http://localhost:5178/api/tasks/${boardID}`,
            {headers:{Authorization:`Bearer ${token}`}}
        )
        tasks.value[boardID]=res.data
        console.log('задачи получены')
    }catch(error){console.log(error)}
}

const createTask=async(boardID)=>{
    try{
        const desc=description.value[boardID]
        const token=localStorage.getItem(`token`)
        const res=await axios.post('http://localhost:5178/api/task',
            {description:desc,boardID:boardID},
            {headers:{Authorization:`Bearer ${token}`}}
        )
        console.log('запрос за создание задачи отправлен')
        description.value[boardID]=''
        showTaskInput.value[boardID]=false

        const tasksRes=await axios.get(`http://localhost:5178/api/tasks/${boardID}`,
            {headers:{Authorization:`Bearer ${token}`}}
        )
        tasks.value[boardID]=tasksRes.data
    }catch(error){
        console.log(error)
        alert(error.response?.data?.error||'задача с таким именем уже создан')
    }
}

const createBoard=async()=>{
    try{
        if(!boardname.value){
            alert('не указано имя доски')
            return
        }
            const res=await axios.post('http://localhost:5178/api/boards',
                {boardname:boardname.value},
                {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
            )

        console.log(res.data.message)
        console.log('доска создана')

        boardname.value=''
    }
    catch(error){
        console.log(error)
        alert(error.response?.data?.error||'доска с таким именем уже создана')
    }

    await fetchboard()
}

const updateTaskStatus=async(boardID,task)=>{
    const token=localStorage.getItem('token')
    try{
        task.status=task.status==='todo'?'done':'todo'
        await axios.put(`http://localhost:5178/api/tasks/${task.id}`,
            {boardID:boardID,status:task.status},
            {headers:{Authorization:`Bearer ${token}`}}
        )
    }catch(error){console.log(error)}
}

const removeBoard=async(boardID)=>{
    console.log('удаляю доску из бд')
    const token=localStorage.getItem('token')
    try{
        const res=await axios.delete(`http://localhost:5178/api/boards/${boardID}`,
            {headers:{Authorization:`Bearer ${token}`}}
        )
        console.log('ОТвет сервера',res.data)
        boards.value=boards.value.filter(b=>b.id!==boardID)
        delete tasks.value[boardID]
    }catch(error){
        console.log('ошибка удаления ',error.response?.data)
    }
}

const changeNameTask=async(boardID)=>{
    const newBoardName=newBoardName.value
    const token=localStorage.getItem('token')
    try{
        const res=await axios.put(`http://localhost:5178/api/boards/${boardID}`,{boardID,newBoardName},
            {headers:{Authorization:`Bearer ${token}`}}
        )
    }catch(error){console.log(error)}
}

const changeNameBoard=(boardID)=>{
    return
}

onMounted(async()=>{
    await fetchboard()
    console.log('Текущие доски:', boards.value)
console.log('Текущие задачи:', tasks.value)
})
</script>

<style scoped>
.addTask{
    color:blue;
    font-size:20px;
}
.task-status{
    width:22px;
    height:22px;
    border-radius:50%;
    border:2px solid #ccc;
    background-color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    transition:0.2s;
    flex-shrink:0;
}
.task-status.done{
    background-color:#28a745;
    border-color:#28a745;
}
.task-status svg{
    display:none;
}
.task-status.done svg{
    display:block;
}
.task-text.done{
    text-decoration:line-through;
    color:#6c757d;
    opacity:0.7;
}
.task-text{
    /* display:block;
    max-width:180px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis; */
    word-wrap:break-word;
    word-break:break-all;
}
</style>