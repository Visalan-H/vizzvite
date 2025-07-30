#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectArg = process.argv[2];

const appJsxTemplate = `function App() {

  return (
    <div>App</div>
  );
}

export default App;
`;

const indexCssTemplate = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
`;

const before = new Set(
    fs.readdirSync(process.cwd()).filter(f => fs.statSync(f).isDirectory())
);

const viteCmd = projectArg
    ? `npm create vite@latest ${projectArg} -- --template react`
    : 'npm create vite@latest -- --template react';

execSync(viteCmd, { stdio: 'inherit' });

const after = new Set(
    fs.readdirSync(process.cwd()).filter(f => fs.statSync(f).isDirectory())
);

const newDirs = [...after].filter(f => !before.has(f));

let root = process.cwd();

if (projectArg && projectArg !== '.') {
    if (newDirs.length === 1) {
        root = path.join(process.cwd(), newDirs[0]);
    } else {
        root = path.join(process.cwd(), projectArg);
    }
} else {
    if (newDirs.length === 1) {
        root = path.join(process.cwd(), newDirs[0]);
    }
}

// Determine and update index.html title with project name
const indexHtmlPath = path.join(root, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
    let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    const projectTitle = projectArg && projectArg !== '.' ? projectArg : path.basename(root);

    indexHtmlContent = indexHtmlContent.replace(
        /<title>.*<\/title>/i,
        `<title>${projectTitle}</title>`
    );

    fs.writeFileSync(indexHtmlPath, indexHtmlContent);
} else {
    console.log('Could not find index.html to update the title.');
}

// Delay 500ms before overwriting files to avoid race condition on some systems
const appPath = path.join(root, 'src', 'App.jsx');
setTimeout(() => {
    if (fs.existsSync(appPath)) {
        fs.writeFileSync(appPath, appJsxTemplate);
        fs.writeFileSync(path.join(root, 'src', 'App.css'), '');
        fs.writeFileSync(path.join(root, 'src', 'index.css'), indexCssTemplate);
        const reactSvgPath = path.join(root, 'src', 'assets', 'react.svg');
        if (fs.existsSync(reactSvgPath)) {
            fs.unlinkSync(reactSvgPath);
        }
        console.log(`Project ready at ${root}`);
        console.log("Good luck! Thank you for using vizzvite!");
    } else {
        console.log(
            'Could not find generated src/App.jsx to overwrite. Please check your directory or create the project with a specific name.'
        );
    }
}, 500);

