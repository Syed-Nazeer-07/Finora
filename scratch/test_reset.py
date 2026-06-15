import requests

res = requests.post("http://127.0.0.1:5000/api/auth/forgot-password", json={"email": "syednazeer2007s@gmail.com"})
print(res.status_code)
print(res.json())
