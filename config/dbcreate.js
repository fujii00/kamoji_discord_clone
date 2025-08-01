import mysql from 'mysql2/promise';

async function db_connection() {
    try {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
           // Utiliser la base de données système pour créer une nouvelle base
           
        });

        console.log(connection);
const database = 'discord';
        (await connection).query(`CREATE DATABASE IF NOT EXISTS ${database}`);

        console.log('Base de données créée ou déjà existante: ' + database);
        (await connection).end();
    }
    catch (error) {
        console.error('Erreur lors de la création de la base de données:', error);
        process.exit(1);  // Arrête le processus avec une erreur
    }
}

db_connection()