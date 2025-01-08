from flask import Flask, request, jsonify
import jwt
import datetime
from functools import wraps
from jwcrypto import jwk
import requests
import sqlite3
import uuid

app = Flask(__name__)

# Configuration
CLIENT_ID = "4097858c-9c98-49fb-a6ca-3f8f819ff048"
TENANT_ID = "b50daf19-b943-4734-9bb2-292a55b4e912"
JWKS_URI = f"https://login.microsoftonline.com/common/discovery/v2.0/keys"
SECRET_KEY = "your-secret-key"  # For signing activation codes
DB_PATH = "activation_codes.db"  # SQLite DB file

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS activation_codes (
                        code TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        expiry TIMESTAMP NOT NULL
                      )''')
    conn.commit()
    conn.close()

init_db()

# Utility: Fetch JWKS keys
def get_jwks_keys():
    response = requests.get(JWKS_URI)
    response.raise_for_status()
    return response.json()

JWKS_KEYS = get_jwks_keys()

# Utility: Verify ID token
def verify_id_token(id_token):
    try:
        headers = jwt.get_unverified_header(id_token)
        kid = headers.get("kid")

        # Find the corresponding public key in JWKS
        jwk_key = next(key for key in JWKS_KEYS["keys"] if key["kid"] == kid)
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk_key)
        decoded = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
        )
        return decoded
    except Exception as e:
        raise ValueError(f"Invalid ID token: {str(e)}")

# Endpoint: Verify ID token and generate activation code
@app.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.json
    id_token = data.get('idToken')

    if not id_token:
        return jsonify({"error": "ID token is required"}), 400

    try:
        user_info = verify_id_token(id_token)
        user_id = user_info["sub"]

        # Generate a unique activation code
        activation_code = str(uuid.uuid4())
        expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

        # Store the activation code in the database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO activation_codes (code, user_id, expiry) VALUES (?, ?, ?)",
                       (activation_code, user_id, expiry))
        conn.commit()
        conn.close()

        # Return the activation URL
        activation_url = f"https://your-web-app.com/activate?activationCode={activation_code}"
        return jsonify({"activationUrl": activation_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Endpoint: Validate activation code
@app.route('/validate-activation-code', methods=['POST'])
def validate_activation_code():
    data = request.json
    activation_code = data.get('activationCode')

    if not activation_code:
        return jsonify({"error": "Activation code is required"}), 400

    try:
        # Check the activation code in the database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, expiry FROM activation_codes WHERE code = ?", (activation_code,))
        record = cursor.fetchone()
        conn.close()

        if not record:
            return jsonify({"error": "Invalid activation code"}), 400

        user_id, expiry = record
        expiry = datetime.datetime.strptime(expiry, "%Y-%m-%d %H:%M:%S.%f")

        if expiry < datetime.datetime.utcnow():
            return jsonify({"error": "Activation code has expired"}), 400

        # Activate the user account (mocked for simplicity)
        # Replace this with actual user activation logic
        return jsonify({"message": "Account activated successfully", "userId": user_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Main entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
