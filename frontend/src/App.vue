<template>
    <div>
        <Header></Header>
        <router-view></router-view>
    </div>
</template>

<script setup>
import Header from '../components/Header.vue';
const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5178'
</script>