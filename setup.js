#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Gemini Chatbot Web App...\n');

// Check if Node.js is installed
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log('✅ Node.js found:', nodeVersion);
} catch (error) {
    console.error('❌ Node.js not found. Please install Node.js from https://nodejs.org/');
    process.exit(1);
}

// Check if npm is available
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log('✅ npm found:', npmVersion);
} catch (error) {
    console.error('❌ npm not found. Please install Node.js with npm.');
    process.exit(1);
}

// Check required files
const requiredFiles = [
    'server.js',
    'package.json',
    'public/index.html'
];

console.log('\n📁 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.error('\n❌ Missing required files:', missingFiles.join(', '));
    console.log('\n📋 Please create these files:');
    console.log('   1. server.js - Backend server file');
    console.log('   2. package.json - Dependencies configuration'); 
    console.log('   3. public/index.html - Frontend interface');
    console.log('\nRefer to the setup guide for file contents.');
    process.exit(1);
}

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
    console.log('✅ Created public directory');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    console.log('Running: npm install');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    console.log('\n💡 Try running manually:');
    console.log('   npm install express cors @google/generative-ai');
    process.exit(1);
}

// Check if all dependencies are installed
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = packageJson.dependencies || {};

console.log('\n🔍 Verifying dependencies...');
Object.keys(dependencies).forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep} installed`);
    } catch (error) {
        console.log(`❌ ${dep} not found`);
    }
});

console.log('\n🎉 Setup completed successfully!');
console.log('\n🚀 To start your chatbot web app:');
console.log('   npm start');
console.log('\n🌐 Then open: http://localhost:3000');
console.log('\n💡 For development with auto-restart:');
console.log('   npm run dev');

console.log('\n📋 Troubleshooting:');
console.log('   • Make sure your Gemini API key is set in server.js');
console.log('   • Check that port 3000 is not in use');
console.log('   • Use Ctrl+C to stop the server');

console.log('\n✨ Happy chatting! 🤖');