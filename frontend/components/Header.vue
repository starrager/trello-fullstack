<template>
  <div v-if="$route.path !== '/login' && $route.path !== '/register'" class="bg-light border-bottom">
    <div class="container py-2 d-flex justify-content-end">
      <button @click="logout" class="btn btn-outline-danger btn-sm">
        Выйти из аккаунта
      </button>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'

const router=useRouter()
const logout=()=>{
    localStorage.removeItem('token'),
    localStorage.removeItem('user'),
    router.push('/login')
}
</script>

<style scoped>
.header{
    padding:10px 20px;
    background:#f8f9fa;
    text-align:right;
    border-bottom:1px solid #ddd;
}
</style>