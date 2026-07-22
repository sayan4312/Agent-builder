import sys
import os

# Add backend root to python module path for Vercel serverless execution
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
