<template>
  <div class="container mt-5" style="max-width: 400px;">
    <div class="card shadow">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Вход</h2>
        
        <div class="mb-3">
          <input v-model="email" autocomplete="off" type="text" class="form-control" placeholder="Email">
        </div>
        
        <div class="mb-3">
          <input v-model="password" autocomplete="off" type="password" class="form-control" placeholder="Пароль">
        </div>
        
        <button @click="login" class="btn btn-primary w-100 mb-3">Войти</button>
        
        <router-link to="/register" class="btn btn-link w-100">Нет аккаунта? Регистрация</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import axios from 'axios'

const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5178'

const router=useRouter()
const email=ref('')
const password=ref('')

const login=async()=>{
    try{
        const res=await axios.post(`${API_URL}/api/login`,
            {email:email.value,password:password.value})
        localStorage.setItem('token',res.data.token)
        localStorage.setItem('user',JSON.stringify(res.data.user))

        console.log('success')
        router.push('/boards')
    }
    catch(error){
        console.log('ошибка: ',error)
        alert('ошибка входа')
    }
}

</script>

<style scoped>

</style>