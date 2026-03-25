import jwt
import datetime

email = "messi@gmail.com"
name = "MESSI"
role = "player"
SECRET_KEY = 'injury_guard_secret_2026'

token = jwt.encode({
    'user': email, 'name': name, 'role': role,
    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
}, SECRET_KEY, algorithm="HS256")

print(token)
