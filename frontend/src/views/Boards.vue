<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h2">Ваши доски</h1>
    </div>

    <div class="row g-2 mb-4">
      <div class="col-sm-5">
        <input v-model="boardname" type="text" class="form-control" placeholder="Название доски">
      </div>
      <div class="col-sm-5">
        <input v-model="content" type="text" class="form-control" placeholder="Описание">
      </div>
      <div class="col-sm-2">
        <button @click="createBoard" class="btn btn-primary w-100">Создать</button>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-3" v-for="board in boards" :key="board.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ board.boardname }}</h5>
            <p class="card-text text-muted">{{ board.content }}</p>
            <button @click="removeBoard(board.id)" class="btn btn-danger btn-sm w-100">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import axios from 'axios'

const boardname=ref('')
const content=ref('')
const boards=ref([])

const fetchboard=async()=>{
    const res=await axios.get('http://localhost:5178/api/boards',
        {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
    )
    boards.value=res.data
    boards.value.forEach(b=>console.log(b.boardname))
}

const createBoard=async()=>{
    try{
        if(!boardname.value){
            alert('не указано имя доски')
            return
        }
            const res=await axios.post('http://localhost:5178/api/boards',
                {boardname:boardname.value,content:content.value},
                {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
            )

        console.log(res.data.message)
        console.log('доска создана')

        boardname.value=''
        content.value=''
    }
    catch(error){
        console.log(error)
    }

    await fetchboard()
}

const removeBoard=async(boardID)=>{
    const res=await axios.delete(`http://localhost:5178/api/boards/${boardID}`,
        {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
    )

    await fetchboard()
}

onMounted(()=>{
    fetchboard()
})
</script>

<style scoped>

</style>