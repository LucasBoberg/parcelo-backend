import 'reflect-metadata';

import { createConnection } from 'typeorm';


(async () => {
    console.log('Beginning dbseed task.');

    const conn = await createConnection();
    console.log('PG connected.');

    // Create seed data.
    

    // Close connection
    await conn.close();
    console.log('PG connection closed.');

    console.log('Finished dbseed task.');
})();