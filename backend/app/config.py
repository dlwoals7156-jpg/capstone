import os
from pathlib import Path


# Centralized settings. Environment-specific values can be overridden from .env
# or real environment variables when the project is deployed to AWS.
BASE_DIR = Path(__file__).resolve().parents[2]

try:
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
except Exception:
    pass

BACKEND_DIR = BASE_DIR / "backend"
DATABASE_DIR = BACKEND_DIR / "database"
PRODUCT_SQL_PATH = DATABASE_DIR / "deeplook_product_database.sql"
PRODUCT_CATALOG_JSON_PATH = DATABASE_DIR / "product_catalog.json"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_DIR / 'app.db'}")
configured_db_path = Path(DATABASE_URL.replace("sqlite:///", "", 1)) if DATABASE_URL.startswith("sqlite:///") else DATABASE_DIR / "app.db"
APP_DB_PATH = configured_db_path if configured_db_path.is_absolute() else BASE_DIR / configured_db_path

APP_ENV = os.getenv("APP_ENV", "development").lower()
_configured_jwt_secret = os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET")
if APP_ENV == "production" and not _configured_jwt_secret:
    raise RuntimeError("JWT_SECRET must be configured in production")
JWT_SECRET_KEY = _configured_jwt_secret or "change-this-secret-for-production"
JWT_ISSUER = os.getenv("JWT_ISSUER", "deeplook")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
PUBLIC_API_BASE_URL = os.getenv("PUBLIC_API_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
