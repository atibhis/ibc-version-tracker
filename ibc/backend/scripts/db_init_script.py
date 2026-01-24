from app.core.database import init_db
from app.models.domain import *

if __name__ == "__main__":
    print("Initializing database tables...")
    try:
        init_db()
        print("Successfully created tables!")
    except Exception as e:
        print(f"Error creating tables: {e}")
