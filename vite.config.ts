import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Укажите здесь имя вашего репозитория между слэшами
  base: '/Stroi1/', 

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Оптимизация сборки: объединение мелких CSS файлов в один
    cssCodeSplit: false,
    // Убираем предупреждения о размере бандла для тяжелых нейросетевых библиотек
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      // Это позволит использовать красивые пути в будущем (например, '@/components/...')
      '@': '/',
    },
  },
})
