import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import store from './store'
import axios from 'axios'
import 'common/stylus/index.styl'

Vue.config.productionTip = false
Vue.prototype.$axios = axios

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
