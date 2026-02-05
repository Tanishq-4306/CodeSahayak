#!/usr/bin/env node

/**
 * CodeSahayak Deployment Script
 * Automated deployment and health check system
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════╗
║              CodeSahayak Deployment                  ║
║          Full-Stack Integration Complete             ║
╚═══════════════════════════════════════════════════════╝
`);

class DeploymentManager {
    constructor() {
        this.backendProcess = null;
        this.frontendProcess = null;
        this.isDeployed = false;
    }

    async deploy() {
        console.log('🚀 Starting CodeSahayak deployment...\n');
        
        try {
            // Check prerequisites
            await this.checkPrerequisites();
            
            // Install dependencies
            await this.installDependencies();
            
            // Start backend server
            await this.startBackend();
            
            // Start frontend server
            await this.startFrontend();
            
            // Health check
            await this.healthCheck();
            
            // Success message
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...');
        
        // Check Node.js
        try {
            const nodeVersion = await this.execCommand('node --version');
            console.log(`✅ Node.js: ${nodeVersion.trim()}`);
        } catch (error) {
            throw new Error('Node.js is not installed');
        }
        
        // Check npm
        try {
            const npmVersion = await this.execCommand('npm --version');
            console.log(`✅ npm: ${npmVersion.trim()}`);
        } catch (error) {
            throw new Error('npm is not installed');
        }
        
        // Check project structure
        const requiredFiles = [
            'package.json',
            'backend/server.js',
            'web-ide/index.html',
            'web-ide/dashboard.html'
        ];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                throw new Error(`Required file missing: ${file}`);
            }
        }
        
        console.log('✅ Project structure verified\n');
    }

    async installDependencies() {
        console.log('📦 Installing dependencies...');
        
        try {
            await this.execCommand('npm install');
            console.log('✅ Dependencies installed\n');
        } catch (error) {
            throw new Error('Failed to install dependencies');
        }
    }

    async startBackend() {
        console.log('🔧 Starting backend server...');
        
        return new Promise((resolve, reject) => {
            const backend = spawn('node', ['server.js'], {
                cwd: path.join(__dirname, 'backend'),
                stdio: 'pipe'
            });
            
            let output = '';
            
            backend.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('Ready to receive connections')) {
                    console.log('✅ Backend server started on port 3000\n');
                    this.backendProcess = backend;
                    resolve();
                }
            });
            
            backend.stderr.on('data', (data) => {
                const error = data.toString();
                if (error.includes('EADDRINUSE')) {
                    console.log('✅ Backend server already running on port 3000\n');
                    resolve();
                } else {
                    console.error('Backend error:', error);
                }
            });
            
            setTimeout(() => {
                if (!this.backendProcess) {
                    reject(new Error('Backend server failed to start'));
                }
            }, 10000);
        });
    }

    async startFrontend() {
        console.log('🌐 Starting frontend server...');
        
        return new Promise((resolve, reject) => {
            const frontend = spawn('npx', ['http-server', '.', '-p', '5179'], {
                cwd: path.join(__dirname, 'web-ide'),
                stdio: 'pipe'
            });
            
            let output = '';
            
            frontend.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('Available on:')) {
                    console.log('✅ Frontend server started on port 5179\n');
                    this.frontendProcess = frontend;
                    resolve();
                }
            });
            
            frontend.stderr.on('data', (data) => {
                const error = data.toString();
                if (error.includes('EADDRINUSE')) {
                    console.log('✅ Frontend server already running on port 5179\n');
                    resolve();
                } else {
                    console.error('Frontend error:', error);
                }
            });
            
            setTimeout(() => {
                if (!this.frontendProcess) {
                    reject(new Error('Frontend server failed to start'));
                }
            }, 10000);
        });
    }

    async healthCheck() {
        console.log('🏥 Running health checks...');
        
        // Wait for servers to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            // Check backend health
            const response = await fetch('http://localhost:3000/health');
            const health = await response.json();
            
            if (health.status === 'OK') {
                console.log('✅ Backend health check passed');
            } else {
                throw new Error('Backend health check failed');
            }
            
            // Check frontend accessibility
            const frontendResponse = await fetch('http://localhost:5179/index.html');
            if (frontendResponse.ok) {
                console.log('✅ Frontend accessibility check passed');
            } else {
                throw new Error('Frontend not accessible');
            }
            
            console.log('✅ All health checks passed\n');
            
        } catch (error) {
            throw new Error(`Health check failed: ${error.message}`);
        }
    }

    showSuccessMessage() {
        console.log(`
╔═══════════════════════════════════════════════════════╗
║            🎉 DEPLOYMENT SUCCESSFUL! 🎉              ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  CodeSahayak is now running and ready to use!        ║
║                                                       ║
║  🌐 Frontend: http://localhost:5179                   ║
║  🔧 Backend:  http://localhost:3000                   ║
║  🧪 Tests:    http://localhost:5179/test-integration  ║
║                                                       ║
║  📱 Access Points:                                    ║
║  • Landing Page: /index.html                         ║
║  • Dashboard:    /dashboard.html                     ║
║  • Login:        /login.html                         ║
║  • Sign Up:      /signup.html                        ║
║                                                       ║
║  🚀 Features Available:                               ║
║  ✅ Full-stack integration                           ║
║  ✅ 8 Indian languages support                      ║
║  ✅ AI-powered code tutor                           ║
║  ✅ Interactive IDE                                  ║
║  ✅ Progress tracking                                ║
║  ✅ Code library management                         ║
║  ✅ Responsive design                               ║
║                                                       ║
║  Press Ctrl+C to stop the servers                    ║
╚═══════════════════════════════════════════════════════╝
        `);
        
        this.isDeployed = true;
    }

    async execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    async stop() {
        console.log('\n🛑 Stopping CodeSahayak servers...');
        
        if (this.backendProcess) {
            this.backendProcess.kill();
            console.log('✅ Backend server stopped');
        }
        
        if (this.frontendProcess) {
            this.frontendProcess.kill();
            console.log('✅ Frontend server stopped');
        }
        
        console.log('👋 CodeSahayak deployment stopped');
        process.exit(0);
    }
}

// Handle graceful shutdown
const deployment = new DeploymentManager();

process.on('SIGINT', () => {
    deployment.stop();
});

process.on('SIGTERM', () => {
    deployment.stop();
});

// Start deployment
if (require.main === module) {
    deployment.deploy().catch(error => {
        console.error('💥 Deployment failed:', error.message);
        process.exit(1);
    });
}

module.exports = DeploymentManager;