import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Overview from '../components/Overview.vue'
import RunningGameView from '../components/RunningGameView.vue'
import { SessionManager } from '../services/SessionManager'

Vue.use(Router)

let router = new Router(
  {
    routes: [
      {
        path: '/login',
        name: 'Login',
        component: Login
      }, {
        path: '/',
        name: 'Overview',
        component: Overview,
        meta: {
          requiresAuth: true
        }
      }, {
        path: '/game/:id',
        component: RunningGameView,
        meta: {
          requiresAuth: true
        }
      }
    ]
  })

router.beforeEach((to, from, next) => {
  // check before each routing if the route requires auth
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // auth required, now check if logged in
    SessionManager.checkLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        console.log('user not logged in, redirecting to login')
        // not logged in, redirect to login
        next({
          path: '/login',
          query: {redirect: to.fullPath}
        })
      } else {
        // user is logged in, allow the route
        next()
      }
    })
  } else {
    next()
  }
})

export default router
