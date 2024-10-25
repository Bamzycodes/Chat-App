/** @type {import('tailwindcss').Config} */
export default {
  content: [  
    "./views/**/*.ejs",  // Adjust the path as necessary   
    "./public/**/*.html"  
  ], 
	theme: {
		extend: {},
	},
	// eslint-disable-next-line no-undef
	plugins: [require("daisyui")],
};