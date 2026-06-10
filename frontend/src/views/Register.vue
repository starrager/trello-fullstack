<template>
  <div class="container mt-5" style="max-width: 400px;">
    <div class="card shadow">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Регистрация</h2>
        
        <div class="mb-3">
          <input v-model="username" type="text" class="form-control" placeholder="Имя пользователя">
        </div>
        
        <div class="mb-3">
          <input v-model="email" type="text" class="form-control" placeholder="Email">
        </div>
        
        <div class="mb-3">
          <input v-model="password" type="password" class="form-control" placeholder="Пароль">
        </div>
        
        <button @click="register" class="btn btn-primary w-100 mb-3">Зарегистрироваться</button>
        
        <router-link to="/login" class="btn btn-link w-100">Есть аккаунт? Войти</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'
import axios from 'axios'
import {ref} from 'vue'

const router=useRouter()
const username=ref('')
const email=ref('')
const password=ref('')

const register=async()=>{
    try{
        const res=await axios.post('http://localhost:5178/api/register',
        {username:username.value,email:email.value,password:password.value})
        
        const logres=await axios.post('http://localhost:5178/api/login',
            {email:email.value,password:password.value}
        )

        localStorage.setItem('token',logres.data.token)
        localStorage.setItem('user',JSON.stringify(logres.data.user))

        console.log('success')
        router.push('/boards')
    }
    catch(error){
        console.error('ошибка регистрации',error)
        alert('ошибка регистрации')
    }
}
</script>

<style scoped>

</style>