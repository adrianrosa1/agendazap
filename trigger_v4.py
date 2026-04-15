import json
import os

with open('package.json', 'r') as f:
    data = json.load(f)

# Minimal deps for build
data['dependencies'] = {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@prisma/client": "^6",
    "prisma": "^6",
    "axios": "^1",
    "date-fns": "^4",
    "next-auth": "^4",
    "node-cron": "^4",
    "lucide-react": "^0.475.0",
    "uuid": "^11"
}

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
