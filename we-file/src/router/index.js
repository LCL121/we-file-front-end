import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/layout/home'
import User from '@/layout/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

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
        component: () => import(/* webpackChunkName: "signin" */ '@/views/signin')
      },
      {
        path: 'signup',
        name: 'SignUp',
        component: () => import(/* webpackChunkName: "signup" */ '@/views/signup')
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
        component: () => import(/* webpackChunkName: "user-home" */ '@/views/user-home')
      },
      {
        path: 'user-details',
        name: 'UserDetails',
        component: () => import(/* webpackChunkName: "user-details" */ '@/views/user-details')
      },
      {
        path: 'user-group',
        name: 'UserGroup',
        component: () => import(/* webpackChunkName: "user-group" */ '@/views/user-group')
      },
      {
        path: 'group-home',
        name: 'GroupHome',
        component: () => import(/* webpackChunkName: "group-home" */ '@/views/group-home')
      },
      {
        path: 'group-details',
        name: 'GroupDetails',
        component: () => import(/* webpackChunkName: "group-details" */ '@/views/group-details')
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '@/views/about')
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "404" */ '@/views/error-pages/404.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach((to, from) => {
  NProgress.done()
  console.log(to.fullPath, 'finished')
})

export default router
