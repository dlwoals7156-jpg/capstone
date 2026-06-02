import os
from pathlib import Path


# Centralized settings. Environment-specific values can be overridden from .env
# or real environment variables when the project is deployed to AWS.
BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR / "backend"
DATABASE_DIR = BACKEND_DIR / "database"
PRODUCT_SQL_PATH = DATABASE_DIR / "deeplook_product_database.sql"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_DIR / 'app.db'}")
configured_db_path = Path(DATABASE_URL.replace("sqlite:///", "", 1)) if DATABASE_URL.startswith("sqlite:///") else DATABASE_DIR / "app.db"
APP_DB_PATH = configured_db_path if configured_db_path.is_absolute() else BASE_DIR / configured_db_path

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-for-production")
JWT_ISSUER = os.getenv("JWT_ISSUER", "deeplook")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
