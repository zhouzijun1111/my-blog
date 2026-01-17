import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupTheme } from './composables/useTheme'

// 引入设计系统样式
import './styles/variables.css'
import './styles/glassmorphism.css'
import './styles/animations.css'

// 创建应用实例
const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(router)

// 初始化主题
setupTheme()

app.mount('#app')
