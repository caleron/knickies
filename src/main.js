// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import Toasted from 'vue-toasted'
import App from './App.vue'
import router from './router'

Vue.use(Vuetify)
Vue.config.productionTip = false

Vue.use(Toasted, {
  duration: 3000,
  position: 'top-right'
})

// noinspection JSUnusedGlobalSymbols

/* eslint-disable no-new */
new Vue(
  {
    el: '#app',
    router,
    template: '<App/>',
    components: {App}
  })
