import os
import bcrypt

# Default password is "admin123" if not set in environment
current_password_hash = os.environ.get("ADMIN_PASSWORD_HASH", "")

async def verify_password(password: str) -> bool:
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    if not current_password_hash:
        # If no hash is set, we compare against the plain text env var or default
        print("No ADMIN_PASSWORD_HASH found, checking against plain text password")
        return password == admin_password
    
    try:
        # bcrypt.checkpw expects bytes
        password_bytes = password.encode('utf-8')
        hash_bytes = current_password_hash.encode('utf-8')
        
        is_hash_valid = bcrypt.checkpw(password_bytes, hash_bytes)
        if is_hash_valid:
            return True
        
        # Fallback check against plain text in case the hash was misconfigured
        return password == admin_password
    except Exception as e:
        print(f"Password verification error: {e}")
        return password == admin_password

async def update_password(new_password: str):
    global current_password_hash
    # bcrypt.hashpw expects bytes
    password_bytes = new_password.encode('utf-8')
    salt = bcrypt.gensalt(10)
    hash_bytes = bcrypt.hashpw(password_bytes, salt)
    current_password_hash = hash_bytes.decode('utf-8')
    # Note: In serverless, this memory update won't persist across instances.
    # The user should set ADMIN_PASSWORD_HASH in their environment variables for persistence.
