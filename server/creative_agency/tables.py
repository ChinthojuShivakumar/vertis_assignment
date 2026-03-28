import psycopg2
from psycopg2 import sql

DB_NAME='creative_agency'
DB_USER="postgres"
DB_PASSWORD="123456"
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

def create_database_if_not_exists():
    # Connect to default 'postgres' database
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.autocommit = True  # Required for CREATE DATABASE
    cursor = conn.cursor()

    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname=%s", (DB_NAME,))
    exists = cursor.fetchone()
    if not exists:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
        print(f"Database '{DB_NAME}' created successfully!")
    else:
        print(f"Database '{DB_NAME}' already exists.")

    cursor.close()
    conn.close()

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

