const fs = require('fs');
const path = require('path');
const os = require('os');

// Error handling wrapper
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
});

// Get directories
const rootDir = process.cwd();
const isVercel = !!process.env.VERCEL;
const targetDir = isVercel ? path.join(rootDir, '.vercel/output/static') : path.join(rootDir, 'public');
const apiDir = isVercel ? path.join(rootDir, '.vercel/output/functions/api') : path.join(rootDir, 'api');
const publicDir = path.join(targetDir, 'public');

console.log('\n=== Build Configuration ===');
console.log('- Root directory:', rootDir);
console.log('- Target directory:', targetDir);
console.log('- API directory:', apiDir);
console.log('- Environment:', isVercel ? 'Vercel' : 'Local');
console.log('- Node version:', process.version);
console.log('- OS:', os.platform(), os.release());
console.log('- Memory:', Math.round(os.totalmem() / (1024 * 1024)), 'MB');
console.log('=========================\n');

// Function to ensure directory exists with better error handling
function ensureDirectoryExists(dir) {
    try {
        if (!fs.existsSync(dir)) {
            console.log('Creating directory:', dir);
            fs.mkdirSync(dir, { recursive: true });
        } else {
            console.log('Directory exists:', dir);
        }
    } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
        throw error;
    }
}

// Function to copy file with directory creation
function copyFileWithDir(src, dest) {
    ensureDirectoryExists(path.dirname(dest));
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${src} to ${dest}`);
    } else {
        console.warn(`Warning: Source file ${src} does not exist`);
    }
}

// Function to copy directory recursively
function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`Warning: Source directory ${src} does not exist`);
        return;
    }

    ensureDirectoryExists(dest);
    console.log(`Copying directory ${src} to ${dest}`);
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${srcPath} to ${destPath}`);
        }
    }
}

// Main build process
async function build() {
    console.log('Starting build process...');
    
    try {
        // Clear target directory if it exists
        if (fs.existsSync(targetDir)) {
            console.log('Cleaning existing target directory...');
            fs.rmSync(targetDir, { recursive: true, force: true });
        }
        
        // Create target directory
        ensureDirectoryExists(targetDir);
        ensureDirectoryExists(publicDir);
        ensureDirectoryExists(apiDir);

        // Copy static directories with verbose logging
        ['css', 'js', 'data'].forEach(dir => {
            const srcDir = path.join(rootDir, dir);
            const destDir = path.join(publicDir, dir);
            console.log(`Processing directory: ${dir}`);
            if (fs.existsSync(srcDir)) {
                copyDirRecursive(srcDir, destDir);
            } else {
                console.warn(`Warning: Directory ${dir} not found in source`);
            }
        });

        // Copy HTML files
        const htmlFiles = [
            'index.html',
            'dashboard.html',
            'user-management.html',
            'loan-management.html',
            'payment-processing.html',
            'reports.html',
            'admin-sessions.html',
            'active-sessions.html'
        ];

        console.log('Copying HTML files...');
        htmlFiles.forEach(file => {
            copyFileWithDir(
                path.join(rootDir, file),
                path.join(publicDir, file)
            );
        });

        // Copy additional files
        const additionalFiles = [
            'check-payments.js',
            'convert-csv-json.js',
            'update-admin-password.js'
        ];

        console.log('Copying additional files...');
        additionalFiles.forEach(file => {
            copyFileWithDir(
                path.join(rootDir, file),
                path.join(publicDir, file)
            );
        });

        // Copy API files
        console.log('Setting up API...');
        copyDirRecursive(path.join(rootDir, 'api'), apiDir);
        
        // Copy package files for API
        ['package.json', 'package-lock.json'].forEach(file => {
            copyFileWithDir(
                path.join(rootDir, file),
                path.join(apiDir, file)
            );
        });

        // Create a build info file
        const buildInfo = {
            buildTime: new Date().toISOString(),
            nodeVersion: process.version,
            environment: isVercel ? 'vercel' : 'local',
            platform: process.platform,
            memory: Math.round(os.totalmem() / (1024 * 1024)) + 'MB'
        };

        fs.writeFileSync(
            path.join(publicDir, 'build-info.json'),
            JSON.stringify(buildInfo, null, 2)
        );

        console.log('Build completed successfully');
        console.log('Build info:', buildInfo);
    } catch (error) {
        console.error('Build failed:', error);
        throw error;
    }
}

// Run build with error handling
build().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
