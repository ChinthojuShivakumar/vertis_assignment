from django.shortcuts import render
import psycopg2
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import jwt
import datetime
from Crypto.Cipher import AES
import base64
import hashlib
import bcrypt

from urllib.parse import urljoin

# Create your views here.

SECRET_ENCRYPTION = 'CRYPTOAGENCY'

DB_NAME='creative_agency'
DB_USER="postgres"
DB_PASSWORD="123456"
DB_HOST="localhost"
DB_PORT=5432

JWT_SECRET = 'CRYPTOAGENCY'


def evp_bytes_to_key(password, salt, key_len, iv_len):
    """
    OpenSSL-compatible EVP_BytesToKey implementation (MD5)
    """
    dtot = b""
    d = b""

    while len(dtot) < (key_len + iv_len):
        d = hashlib.md5(d + password + salt).digest()
        dtot += d

    key = dtot[:key_len]
    iv = dtot[key_len:key_len + iv_len]
    return key, iv


def decrypt_cryptojs(encrypted_text: str) -> str:
    if not encrypted_text:
        return ""

    raw = base64.b64decode(encrypted_text)

    # CryptoJS AES prefix
    if raw[:8] != b"Salted__":
        raise ValueError("Invalid encrypted data")

    salt = raw[8:16]
    ciphertext = raw[16:]

    key, iv = evp_bytes_to_key(
        SECRET_ENCRYPTION.encode("utf-8"),
        salt,
        key_len=32,
        iv_len=16
    )

    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(ciphertext)

    # PKCS7 padding removal
    pad_len = decrypted[-1]
    return decrypted[:-pad_len].decode("utf-8")

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

def create_users_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
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
            id SERIAL PRIMARY KEY,
            title TEXT,
            slug TEXT UNIQUE,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()

def create_contact_forms_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_forms (
            id SERIAL PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            enquiry_type TEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()

def generate_jwt_token(payload):
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return token

@csrf_exempt
def add_user(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None
    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'message': "Invalid data received", 'status': 400})

        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')

        decrypted_password = decrypt_cryptojs(password)
        print(decrypted_password, 'decrypted_password')
        
        hashed_password = bcrypt.hashpw(decrypted_password.encode('utf-8'), bcrypt.gensalt(rounds=12))
        hashed_password_str = hashed_password.decode('utf-8')
        print(hashed_password_str, 'hashed_password')



        if not all([first_name, last_name, email, password]):
            return JsonResponse({'message': "Required fields are missing", 'status': 400})

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO public.users (first_name, last_name, email, password)
            VALUES (%s, %s, %s, %s)
            RETURNING id, first_name, last_name
        """, (first_name, last_name, email, hashed_password_str))
        conn.commit()
        row = cursor.fetchone()  # tuple: (user_id, first_name, last_name)
        print(row)
        return JsonResponse({
            'message': "User added successfully",
            'status': 200,
            'data': {
                'user_id': row[0],
                'first_name': row[1],
                'last_name': row[2]
            }
        })

    except Exception as e:
        print('Error:', str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None
    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'message': "Invalid data received", 'status': 400})

        
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return JsonResponse({'message': "Required fields are missing", 'status': 400})
        
        decrypted_password = decrypt_cryptojs(password)
        print(decrypted_password, 'decrypted_password')


        cursor = conn.cursor()

        cursor.execute("""
            SELECT email, password FROM users WHERE email = %s
        """, (email,))

        row = cursor.fetchone()
     
        if not row[0]:
            return JsonResponse({'message': "Invalid Email or Password", 'status': 401})
        print(row)
        if bcrypt.checkpw(decrypted_password.encode('utf-8'), row[1].encode('utf-8')):
            payload = {
            'email':row[0],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }
            generated_token = generate_jwt_token(payload)
            return JsonResponse({
                'message':'login successful',
                'token': generated_token,
                'status': 200,
                
            })
        else:
            return JsonResponse({"status": 401, "message": "Invalid Email or password"})
    except Exception as e:
        print('Error:', str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def get_user_details(request):
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None
    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        

        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM public.users
        """,)

        rows = cursor.fetchall()  # tuple: (user_id, first_name, last_name)
        columns = ['user_id', 'first_name', 'last_name', 'email']

        users = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({
            'message': "User list fetched successfully",
            'status': 200,
            'data': users
        })

    except Exception as e:
        print('Error:', str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.utils.crypto import get_random_string

def save_images_to_blog(files):
    """
    Saves uploaded images to media/blogs/ and returns a list of paths.
    files: list of InMemoryUploadedFile or UploadedFile
    """
    saved_paths = []

    # Create blogs folder if not exists
    blogs_dir = os.path.join(settings.MEDIA_ROOT, 'blogs')
    os.makedirs(blogs_dir, exist_ok=True)

    for f in files:
        # Generate unique file name
        ext = os.path.splitext(f.name)[1]
        filename = get_random_string(16) + ext
        filepath = os.path.join('blogs', filename)

        # Save file
        with default_storage.open(filepath, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)

        # Store relative path for DB with leading slash
        saved_paths.append('/' + filepath)

    return saved_paths

@csrf_exempt
def create_blog(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

   

        title = request.POST.get('title')
        slug = request.POST.get('slug')
        content = request.POST.get('content')
        status = request.POST.get('status')
        files = request.FILES.getlist('images')  # already correct



        if not all([title, slug, content]):
            return JsonResponse({'message': "Required fields missing", 'status': 400})
        
        image_paths = save_images_to_blog(files)
        print('images_path:', image_paths)
        images_array = '{' + ','.join(image_paths) + '}'
        print('images_array:', images_array)

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO blog_posts (title, slug, content, status, images)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (title, slug, content, status, image_paths))

        blog_id = cursor.fetchone()[0]

        conn.commit()

        return JsonResponse({
            'message': "Blog created successfully",
            'status': 201,
            'blog_id': blog_id
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@csrf_exempt
def get_blogs(request):
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, title, slug, content, status, images, created_at
            FROM blog_posts
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        columns = ['id','title','slug','content','status','images','created_at']
        blogs = []
        for row in rows:
            blog = dict(zip(columns, row))

            # Convert TEXT[] to Python list if not None
            images_list = blog['images'] if blog['images'] else []

            # Build full URL for each image with /media/
            blog['images'] = [f"{settings.BASE_MEDIA_URL}/{img.replace('\\', '/')}" for img in images_list]

            blogs.append(blog)

        return JsonResponse({
            'message': "Blogs fetched successfully",
            'status': 200,
            'data': blogs
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def update_blog(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        cursor = conn.cursor()

        

        # Get data from multipart/form-data
        blog_id = request.POST.get('id')
        title = request.POST.get('title')
        slug = request.POST.get('slug')
        content = request.POST.get('content')
        status = request.POST.get('status', 'active')

        files = request.FILES.getlist('images')

        if not blog_id:
            return JsonResponse({'message': "Blog id is required", 'status': 400})

        if not all([title, slug, content]):
            return JsonResponse({'message': "Title, slug and content are required", 'status': 400})

        # Check if blog exists
        cursor.execute("""
            SELECT id FROM blog_posts 
            WHERE id = %s
        """, (blog_id,))

        if not cursor.fetchone():
            return JsonResponse({'message': "Blog not found", 'status': 404})

        # Handle new image uploads
        new_image_paths = []
        if files:
            new_image_paths = save_images_to_blog(files)

        # Update the blog
        if new_image_paths:
            # If new images are uploaded, append them to existing images (JSON field)
            cursor.execute("""
                UPDATE blog_posts 
                SET title = %s, 
                    slug = %s, 
                    content = %s,
                    status = %s,
                    images = COALESCE(images, '[]'::jsonb) || %s::jsonb
                WHERE id = %s
            """, (title, slug, content, status, json.dumps(new_image_paths), blog_id))
        else:
            # No new images, just update text fields
            cursor.execute("""
                UPDATE blog_posts 
                SET title = %s, 
                    slug = %s, 
                    content = %s,
                    status = %s
                WHERE id = %s
            """, (title, slug, content, status, blog_id))

        conn.commit()

        return JsonResponse({
            'message': "Blog updated successfully",
            'status': 200
        })

    except Exception as e:
        print('Error in update_blog:', str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def delete_blog(request):

    if request.method != 'DELETE':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'message': "Invalid data received", 'status': 400})

        blog_id = data.get('id')

        if not blog_id:
            return JsonResponse({'message': "Blog id required", 'status': 400})

        cursor = conn.cursor()

        # check if exists
        cursor.execute("""
            SELECT id FROM blog_posts WHERE id=%s
        """, (blog_id,))

        row = cursor.fetchone()

        if not row:
            return JsonResponse({
                'message': "Blog not found",
                'status': 404
            })

        # delete record
        cursor.execute("""
            DELETE FROM blog_posts WHERE id=%s
        """, (blog_id,))

        conn.commit()

        return JsonResponse({
            'message': "Blog deleted successfully",
            'status': 200
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def create_contact(request):

    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()

        data = json.loads(request.body.decode('utf-8'))

        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        enquiry_type = data.get('enquiry_type')
        summary = data.get('summary')

        if not all([first_name, last_name, email]):
            return JsonResponse({'message': "Required fields missing", 'status': 400})

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO contact_forms
            (first_name, last_name, email, enquiry_type, summary)
            VALUES (%s,%s,%s,%s,%s)
            RETURNING id
        """,(first_name,last_name,email,enquiry_type,summary))

        contact_id = cursor.fetchone()[0]

        conn.commit()

        return JsonResponse({
            'message': "Contact form submitted",
            'status': 201,
            'contact_id': contact_id
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def get_contacts(request):

    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, first_name, last_name, email, enquiry_type, summary, created_at, status
            FROM contact_forms
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        columns = ['id','first_name','last_name','email','enquiry_type','summary','created_at', 'status']

        contacts = [dict(zip(columns,row)) for row in rows]

        return JsonResponse({
            'message': "Contacts fetched successfully",
            'status': 200,
            'data': contacts
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def delete_contact(request):

    if request.method != 'DELETE':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'message': "Invalid data received", 'status': 400})

        contact_id = data.get('id')

        if not contact_id:
            return JsonResponse({'message': "Contact id required", 'status': 400})

        cursor = conn.cursor()

        # check if exists
        cursor.execute("""
            SELECT id FROM contact_forms WHERE id=%s
        """, (contact_id,))

        row = cursor.fetchone()

        if not row:
            return JsonResponse({
                'message': "Contact not found",
                'status': 404
            })

        # delete
        cursor.execute("""
            DELETE FROM contact_forms WHERE id=%s
        """, (contact_id,))

        conn.commit()

        return JsonResponse({
            'message': "Contact deleted successfully",
            'status': 200
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@csrf_exempt
def update_contact_status(request):
    if request.method != 'PUT':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        cursor = conn.cursor()

        data = json.loads(request.body.decode('utf-8'))

        contact_id = data.get('id')
        new_status = data.get('status')          # e.g., "read", "replied", "in_progress", "closed"

        if not contact_id or not new_status:
            return JsonResponse({'message': "Contact ID and status are required", 'status': 400})

        # Optional: Validate status
        valid_statuses = ['pending', 'read', 'in_progress', 'replied', 'closed']
        if new_status not in valid_statuses:
            return JsonResponse({'message': "Invalid status", 'status': 400})

        cursor.execute("""
            UPDATE contact_forms 
            SET status = %s
            WHERE id = %s
            RETURNING id
        """, (new_status, contact_id))

        updated = cursor.fetchone()

        if not updated:
            return JsonResponse({'message': "Contact not found", 'status': 404})

        conn.commit()

        return JsonResponse({
            'message': f"Contact status updated to '{new_status}'",
            'status': 200
        })

    except Exception as e:
        print("Error in update_contact_status:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def save_about_image(file):
    """
    Save uploaded About page image to media/about/ and return relative path.
    """
    about_dir = os.path.join(settings.MEDIA_ROOT, 'about')
    os.makedirs(about_dir, exist_ok=True)

    ext = os.path.splitext(file.name)[1]
    filename = get_random_string(16) + ext
    filepath = os.path.join('about', filename)

    # Save file to disk
    with default_storage.open(filepath, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    # Ensure path uses forward slashes for URLs
    return filepath.replace('\\', '/')

@csrf_exempt
def create_or_update_about(request):
    """
    Create or update About page content
    """
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        if not conn:
            return JsonResponse({'message': "Database connection failed", 'status': 500})

        data = request.POST
        file = request.FILES.get('image')

        title = data.get('title')
        subtitle = data.get('subtitle')
        description = data.get('description')
        mission = data.get('mission')
        vision = data.get('vision')
        values = data.getlist('values[]')  # Expecting multiple values from form
        stats_raw = data.get('stats')      # Expecting JSON string [{"number": "...", "label": "..."}]
        print(file)
        if not title:
            return JsonResponse({'message': "Title is required", 'status': 400})

        # Save image if uploaded
        image_path = save_about_image(file) if file else None
        print(image_path, 'image_path')
        # Parse stats JSON
        stats = json.loads(stats_raw) if stats_raw else []

        cursor = conn.cursor()

        # Check if About page already exists
        cursor.execute("SELECT id FROM about_page LIMIT 1")
        existing = cursor.fetchone()

        if existing:
            # Update existing
            query = """
                UPDATE about_page
                SET title=%s, subtitle=%s, description=%s, mission=%s, vision=%s,
                    values=%s, stats=%s, image=%s,
                    updated_at=NOW()
                WHERE id=%s
            """
            cursor.execute(query, (
                title, subtitle, description, mission, vision,
                '{' + ','.join(values) + '}',  # TEXT[]
                json.dumps(stats),              # JSONB
                image_path,
                existing[0]
            ))
            action = "updated"
        else:
            # Insert new
            query = """
                INSERT INTO about_page (title, subtitle, description, mission, vision, values, stats, image)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            cursor.execute(query, (
                title, subtitle, description, mission, vision,
                '{' + ','.join(values) + '}',
                json.dumps(stats),
                image_path
            ))
            existing = cursor.fetchone()
            action = "created"

        conn.commit()

        return JsonResponse({
            'message': f"About page {action} successfully",
            'status': 201,
            'about_id': existing[0] if existing else None
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def get_about(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed", "status": 405})

    try:
        conn = get_database_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, title, subtitle, description, mission, vision, values, stats, image
            FROM about_page
            ORDER BY id DESC
            LIMIT 1
        """)

        row = cursor.fetchone()
        if not row:
            return JsonResponse({"message": "No about data found", "status": 404, "data": None})

        columns = ["id", "title", "subtitle", "description", "mission", "vision", "values", "stats", "image"]
        about = dict(zip(columns, row))

        # Convert TEXT[] or JSON string to Python list
        if about["values"]:
            if isinstance(about["values"], str):
                about["values"] = json.loads(about["values"])
        else:
            about["values"] = []

        if about["stats"]:
            if isinstance(about["stats"], str):
                about["stats"] = json.loads(about["stats"])
        else:
            about["stats"] = []

        # Build full media URL
        if about["image"]:
            about["image"] = request.build_absolute_uri(
                os.path.join(settings.MEDIA_URL, about["image"]).replace("\\", "/")
            )

        cursor.close()
        conn.close()

        return JsonResponse({"message": "About page fetched", "status": 200, "data": about})

    except Exception as e:
        print("Error fetching about:", str(e))
        return JsonResponse({"message": "Internal Server Error", "status": 500})

@csrf_exempt
def get_dashboard(request):

    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        cursor = conn.cursor()

        # Latest Blogs
        cursor.execute("""
            SELECT id, title, slug, content, status, images, created_at
            FROM blog_posts
            ORDER BY created_at DESC
            LIMIT 3
        """)
        blog_rows = cursor.fetchall()

        blog_columns = ['id','title','slug','content','status','images','created_at']
        latest_blogs = [dict(zip(blog_columns,row)) for row in blog_rows]


        # Latest Enquiries
        cursor.execute("""
            SELECT id, first_name, last_name, email, enquiry_type, summary, status, created_at
            FROM contact_forms
            ORDER BY created_at DESC
            LIMIT 3
        """)
        enquiry_rows = cursor.fetchall()

        enquiry_columns = ['id','first_name','last_name','email','enquiry_type','summary','status','created_at']
        latest_enquiries = [dict(zip(enquiry_columns,row)) for row in enquiry_rows]


        # Blog Stats
        cursor.execute("""
            SELECT
            (SELECT COUNT(*) FROM blog_posts) AS total_blogs_count,
            (SELECT COUNT(*)
             FROM blog_posts
             WHERE created_at >= date_trunc('week', CURRENT_DATE)) AS last_week_blogs_count
        """)
        blog_stats = cursor.fetchone()


        # Enquiry Stats
        cursor.execute("""
            SELECT
            (SELECT COUNT(*) FROM contact_forms) AS total_enquiry_count,
            (SELECT COUNT(*)
             FROM contact_forms
             WHERE created_at >= date_trunc('week', CURRENT_DATE)
             AND status NOT IN ('read','replied')) AS unread_enquiry_count
        """)
        enquiry_stats = cursor.fetchone()


        dashboard_data = {
            "blogs": {
                "total": blog_stats[0],
                "last_week": blog_stats[1],
                "latest": latest_blogs
            },
            "enquiries": {
                "total": enquiry_stats[0],
                "unread": enquiry_stats[1],
                "latest": latest_enquiries
            }
        }

        return JsonResponse({
            'message': "Dashboard data fetched successfully",
            'status': 200,
            'data': dashboard_data
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({'message': "Internal Server Error", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def save_service_image(file):
    """
    Save uploaded service icon/image to media/services/
    """

    service_dir = os.path.join(settings.MEDIA_ROOT, 'services')
    os.makedirs(service_dir, exist_ok=True)

    ext = os.path.splitext(file.name)[1]
    filename = get_random_string(16) + ext
    filepath = os.path.join('services', filename)

    with default_storage.open(filepath, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    return filepath.replace("\\", "/")

@csrf_exempt
def create_service(request):

    if request.method != "POST":
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        title = request.POST.get("title")
        slug = request.POST.get("slug")
        description = request.POST.get("description")
        status = request.POST.get("status", "active")

        icon = None
        if "icon" in request.FILES:
            icon = save_service_image(request.FILES["icon"])

        conn = get_database_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO services (title, slug, description, icon, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, [title, slug, description, icon, status])

        service_id = cursor.fetchone()[0]
        conn.commit()

        return JsonResponse({
            "message": "Service created successfully",
            "status": 201,
            "service_id": service_id
        })

    except Exception as e:
        print(e)
        return JsonResponse({'message': 'Internal server error', 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def get_services(request):
    if request.method != "GET":
        return JsonResponse({
            'message': 'Method not allowed', 
            'status': 405
        })

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, title, slug, description, icon, status, created_at
            FROM services
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        columns = ['id', 'title', 'slug', 'description', 'icon', 'status', 'created_at']
        services = []

        for row in rows:
            service_dict = dict(zip(columns, row))
            
            # Convert icon to absolute URL if it exists
            if service_dict.get('icon'):
                # If icon is stored as relative path (e.g., "uploads/services/icon.png")
                icon_path = service_dict['icon']
                
                # Generate absolute URI
                if icon_path.startswith('http'):
                    # Already absolute (rare case)
                    absolute_icon = icon_path
                else:
                    # Make it absolute using request.build_absolute_uri()
                    absolute_icon = request.build_absolute_uri(f"/media/{icon_path}" if not icon_path.startswith('media/') else f"/{icon_path}")
                
                service_dict['icon'] = absolute_icon
            else:
                service_dict['icon'] = None

            services.append(service_dict)

        return JsonResponse({
            'message': "Services fetched successfully",
            'status': 200,
            'data': services
        })

    except Exception as e:
        print("Error in get_services:", str(e))
        return JsonResponse({
            'message': "Internal Server Error", 
            'status': 500
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def update_service(request):

    if request.method != "PUT":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    conn = None
    cursor = None

    try:
        service_id = request.POST.get("id")
        title = request.POST.get("title")
        slug = request.POST.get("slug")
        description = request.POST.get("description")
        status = request.POST.get("status")

        icon_file = request.FILES.get("icon")
        icon_path = None

        # save icon if uploaded
        if icon_file:
            icon_path = save_service_image(icon_file)

        conn = get_database_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE services
            SET
                title = COALESCE(%s, title),
                slug = COALESCE(%s, slug),
                description = COALESCE(%s, description),
                status = COALESCE(%s, status),
                icon = COALESCE(%s, icon)
            WHERE id = %s
        """, (
            title,
            slug,
            description,
            status,
            icon_path,
            service_id,
        ))

        conn.commit()

        return JsonResponse({
            "message": "Service updated successfully",
            "status": 200
        })

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"message": "Internal Server Error", "status": 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@csrf_exempt
def delete_service(request):

    if request.method != "DELETE":
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        data = json.loads(request.body)
        service_id = data.get("id")

        conn = get_database_connection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM services
            WHERE id = %s
        """, [service_id])

        conn.commit()

        return JsonResponse({
            "message": "Service deleted successfully",
            "status": 200
        })

    except Exception as e:
        print(e)
        return JsonResponse({'message': 'Internal server error', 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


from django.core.mail import send_mail


@csrf_exempt
def send_contact_reply(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed', 'status': 405})

    conn = None
    cursor = None

    try:
        conn = get_database_connection()
        cursor = conn.cursor()

        data = json.loads(request.body.decode('utf-8'))

        contact_id = data.get('id')
        reply_subject = data.get('subject')
        reply_message = data.get('message')      # Admin's reply content
        admin_email = data.get('admin_email')    # Optional: who is replying

        if not all([contact_id, reply_subject, reply_message]):
            return JsonResponse({'message': "Contact ID, subject and message are required", 'status': 400})

        # Get contact details (especially email)
        cursor.execute("""
            SELECT first_name, last_name, email, enquiry_type 
            FROM contact_forms 
            WHERE id = %s
        """, (contact_id,))

        contact = cursor.fetchone()
        if not contact:
            return JsonResponse({'message': "Contact not found", 'status': 404})

        first_name, last_name, user_email, enquiry_type = contact

        # Send email to user
        full_name = f"{first_name} {last_name}".strip()



        send_mail(
            subject=reply_subject,
            message=reply_message,
            from_email='mymobile1208@gmail.com',
            recipient_list=[user_email],
            fail_silently=False,
        )

        # Update status to 'replied'
        cursor.execute("""
            UPDATE contact_forms 
            SET status = 'replied'
            WHERE id = %s
        """, (contact_id,))

        conn.commit()

        return JsonResponse({
            'message': "Reply email sent successfully",
            'status': 200,
            'sent_to': user_email
        })

    except Exception as e:
        print("Error in send_contact_reply:", str(e))
        return JsonResponse({'message': "Failed to send email", 'status': 500})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

