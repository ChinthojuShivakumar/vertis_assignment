import psycopg2

DB_NAME='creative_agency'
DB_USER="postgres"
DB_PASSWORD="Pinky@143"
DB_HOST="localhost"
DB_PORT=5432

def get_database_connection():
    return psycopg2.connect(
        dbname = DB_NAME,
        user = DB_USER,
        password = DB_PASSWORD,
        host = DB_HOST,
        port = DB_PORT
    )

def get_postgres_connection():
    return psycopg2.connect(
        dbname = 'postgres',
        user = DB_USER,
        password = DB_PASSWORD,
        host = DB_HOST,
        port = DB_PORT
    )



def check_users_table_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema='public'
            AND table_name='users'
        );
    """)
    exists = cursor.fetchone()[0]
    cursor.close()
    return exists

def check_blog_posts_table_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema='public'
            AND table_name='blog_posts'
        );
    """)
    exists = cursor.fetchone()[0]
    cursor.close()
    return exists

def check_contact_forms_table_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema='public'
            AND table_name='contact_forms'
        );
    """)
    exists = cursor.fetchone()[0]
    cursor.close()
    return exists

def check_about_page_table_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema='public'
            AND table_name='about_page'
        );
    """)
    exists = cursor.fetchone()[0]
    cursor.close()
    return exists

def check_services_table_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema='public'
            AND table_name='services'
        );
    """)
    exists = cursor.fetchone()[0]
    cursor.close()
    return exists

def create_users_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY NOT NULL,
            first_name TEXT,
            last_name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()

def create_blog_posts_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blog_posts (
            id SERIAL PRIMARY KEY NOT NULL,
            title TEXT,
            slug TEXT UNIQUE,
            content TEXT,
            status TEXT DEFAULT 'active',
            images TEXT[],
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()

def create_contact_forms_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_forms (
            id SERIAL PRIMARY KEY NOT NULL,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            enquiry_type TEXT,
            summary TEXT,
            status TEXT DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()

def create_about_page_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS about_page (
            id SERIAL PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            description TEXT,
            mission TEXT,
            vision TEXT,
            values TEXT[],         -- Array of strings
            stats JSONB,           -- Array of objects {number, label}
            image TEXT,            -- URL or relative path
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()

def create_services_table_if_not_exists(conn):
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY NOT NULL,
            title TEXT,
            slug TEXT UNIQUE,
            description TEXT,
            icon TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    cursor.close()

