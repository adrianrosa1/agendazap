import psycopg2
import sys

passwords = ["agendazap_db_prod_user", "agendazap_db_prod", "admin", "password", "demo123", "agendazap123"]
host = "dpg-d7fr6f3bc2fs739pj320-a.oregon-postgres.render.com"
user = "agendazap_db_prod_user"
dbname = "agendazap_db_prod"

for pw in passwords:
    try:
        conn = psycopg2.connect(
            host=host,
            database=dbname,
            user=user,
            password=pw,
            sslmode='require'
        )
        print(f"SUCCESS: Password is {pw}")
        conn.close()
        sys.exit(0)
    except Exception as e:
        print(f"FAILED: {pw} - {e}")
