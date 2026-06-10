import {createRouter,createWebHistory} from 'vue-router'
import Register from '../views/Register.vue'
import Login from '@/views/Login.vue'
import Boards from '@/views/Boards.vue'

const routes=[
    {path:'/register',component:Register},
    {path:'/login',component:Login},
    {path:'/boards',component:Boards},
    {path:'/',component:Register}
]

const router=createRouter({
    history:createWebHistory(),
    routes
})

export default router