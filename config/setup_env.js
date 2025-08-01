import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const setupEnvironment = () => {
    const envLocalPath = resolve('.env.local');
    const envExamplePath = resolve('.env');

    if (!existsSync(envLocalPath)) {
        if (existsSync(envExamplePath)) {
            const template = readFileSync(envExamplePath, 'utf-8');
            writeFileSync(envLocalPath, template);
            console.log('✅ .env.local créé depuis .env.example');
            console.log('🔧 Veuillez modifier .env.local avec vos valeurs personnelles');
        } else {
            console.log('❌ .env.example introuvable');
        }
    } else {
        console.log('ℹ️ .env.local existe déjà');
    }
}

setupEnvironment()