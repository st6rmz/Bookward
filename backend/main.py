from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





#Tells python to expect a certain data format
class Book(BaseModel):
    title: str
    author: str
    status: str
    notes: str | None = None

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

@app.get("/books")
def get_books():
    response = supabase.table("books").select("*").execute()
    return response.data

@app.post("/books")
def add_book(book: Book):
    response = supabase.table("books").insert(book.model_dump()).execute()
    return response.data