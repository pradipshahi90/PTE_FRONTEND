// tailwind.config.js
module.exports = {
	content: [
		"./index.html",         // HTML file
		"./src/**/*.{js,ts,jsx,tsx}", // All React components and JS files
	],
	theme: {
		extend: {
			colors: {
				// Custom colors
				primary: "#3498db",   // Blue color for primary actions
				secondary: "#2ecc71", // Green color for secondary actions
				accent: "#e74c3c",    // Red color for accents or errors
				background: "#f5f5f5", // Light background color
				textPrimary: "#333333", // Dark text color for primary text
				textSecondary: "#666666", // Lighter text color for secondary text
			},
		},
	},
	plugins: [],
};
