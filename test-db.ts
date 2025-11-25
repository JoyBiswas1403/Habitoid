import postgres from 'postgres';
import 'dotenv/config';

async function testConnection() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL is not set!");
        process.exit(1);
    }

    try {
        // Extract and log hostname for debugging (safe to show)
        const match = url.match(/@([^/]+)/);
        const host = match ? match[1] : "unknown";
        console.log(`Attempting to connect to host: ${host}`);

        const sql = postgres(url, { connect_timeout: 5 });
        const result = await sql`SELECT 1+1 as result`;
        console.log("✅ Connection successful!", result);
        await sql.end();
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Connection failed:");
        console.error(`Code: ${error.code}`);
        console.error(`Message: ${error.message}`);
        if (error.code === 'ENOTFOUND') {
            console.error("👉 The hostname could not be resolved. Check for typos in the Supabase URL.");
        } else if (error.code === '28P01') {
            console.error("👉 Authentication failed. Check your password.");
        }
        process.exit(1);
    }
}

testConnection();
