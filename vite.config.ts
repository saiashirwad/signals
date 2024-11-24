import { defineConfig } from 'vite'

export default defineConfig({
	root: '.',
	base: '/',
	build: {
		outDir: 'examples/dist',
	},
	server: {
		open: '/examples/index.html',
	},
})
