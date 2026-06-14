#!/bin/bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
cd /home/nazeer/Finora
npm create vite@latest frontend --yes -- --template react
cd frontend
npm install
npm install tailwindcss postcss autoprefixer react-router-dom lucide-react clsx tailwind-merge
npx tailwindcss init -p
