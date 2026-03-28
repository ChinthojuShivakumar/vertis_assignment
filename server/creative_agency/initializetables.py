from .tables import ( get_database_connection, create_database_if_not_exists, check_users_table_exists, 
                    check_contact_forms_table_exists, check_blog_posts_table_exists, 
                    create_blog_posts_table_if_not_exists, create_contact_forms_table_if_not_exists, 
                    create_users_table_if_not_exists, check_about_page_table_exists, create_about_page_table_if_not_exists,
                      check_services_table_exists,create_services_table_if_not_exists, create_admin_user_if_not_exists)

def initialize_tables():
    create_database_if_not_exists()
    conn = get_database_connection()

    

    if not check_users_table_exists(conn):
        create_users_table_if_not_exists(conn)
        print('users table created successfully')

    if not check_blog_posts_table_exists(conn):
        create_blog_posts_table_if_not_exists(conn)
        print('blogs table created successfully')


    if not check_contact_forms_table_exists(conn):
        create_contact_forms_table_if_not_exists(conn)
        print('contact form table created successfully')

    if not check_about_page_table_exists(conn):
        create_about_page_table_if_not_exists(conn)
        print('about us table created successfully')

    if not check_services_table_exists(conn):
        create_services_table_if_not_exists(conn)
        print('services table created successfully')

    create_admin_user_if_not_exists()

    print('users table already exists')
    print('blogs table already exists')
    print('contact form table already exists')
    print('about us table already exists')
    print('services table already exists')


    conn.close()