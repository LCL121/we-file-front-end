import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/layout/home/Home.vue'
import User from '@/layout/user/User.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: '/signin',
    children: [
      {
        path: 'signin',
        name: 'SignIn',
        component: () => import(/* webpackChunkName: "signin" */ '@/views/signin/SignIn.vue')
      },
      {
        path: 'signup',
        name: 'SignUp',
        component: () => import(/* webpackChunkName: "signup" */ '@/views/signup/SignUp.vue')
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    component: User,
    redirect: '/user/user-home',
    children: [
      {
        path: 'user-home',
        name: 'UserHome',
        component: () => import(/* webpackChunkName: "user-home" */ '@/views/user-home/UserHome.vue')
      },
      {
        path: 'user-details',
        name: 'Userdetails',
        component: () => import(/* webpackChunkName: "user-details" */ '@/views/user-details/Userdetails.vue')
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '@/views/about/About.vue')
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "404" */ '@/views/error-pages/404.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
