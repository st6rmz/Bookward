from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os
import requests

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://bookward.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





#Tells python to expect a certain data format
#class Book(BaseModel):
#    title: str
#    author: str
#    status: str
#    notes: str | None = None

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

google_books_key = os.getenv("GOOGLE_BOOKS_API_KEY")

supabase = create_client(url, key)


#Get all books from the database
@app.get("/books")
def get_books(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = user.user.id    

    response = (
        supabase
        .table("books")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    return response.data



# Search for book via Google Books API
@app.get("/books/search")
def search_books(q: str):
    response = requests.get(
        "https://www.googleapis.com/books/v1/volumes",
        params={
            "q": q,
            "maxResults": 10,
            "key": google_books_key
        }
    )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail="Google Books search failed"
        )

    data = response.json()

    books = []

    for item in data.get("items", []):
        volume = item.get("volumeInfo", {})

        # Get the highest quality cover available
        image_links = volume.get("imageLinks", {})

        image_url = (
            image_links.get("extraLarge")
            or image_links.get("large")
            or image_links.get("medium")
            or image_links.get("small")
            or image_links.get("thumbnail")
            or image_links.get("smallThumbnail")
        )

        books.append({
            "id": item.get("id"),
            "title": volume.get("title"),
            "authors": volume.get("authors", []),
            "description": volume.get("description"),
            "cover": image_url
        })

    return books



# Return information of book via unique book ID
@app.get("/books/{book_id}")
def get_books_by_id(
    book_id: int,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = user.user.id

    try:
        response = (
            supabase
            .table("books")
            .select("*")
            .eq("id", book_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Book not found"
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )







#Add a book to the database
@app.post("/books")
async def add_book(
    authorization: str = Header(None),
    title: str = Form(...),
    author: str = Form(...),
    status: str = Form(...),
    notes: str = Form(""),
    google_image_url: str | None = Form(None),
    image: UploadFile | None = File(None)
):

    if not authorization:
        raise HTTPException(
            status_code= 401,
            detail= "Missing authorization header"
        )

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code= 401,
            detail= "Invalid or expired user"
        )

    user_id = user.user.id



    
    image_url = google_image_url

    if image:
        file_content = await image.read()

        file_path = image.filename

        supabase.storage.from_("book-images").upload(
            file_path,
            file_content,
            {
                "content-type": image.content_type
            }
        )

        image_url = supabase.storage.from_("book-images").get_public_url(
            file_path
        )

    book_data = {
        "title": title,
        "author": author,
        "status": status,
        "notes": notes,
        "image_url": image_url,
        "user_id": user_id
    }


    response = supabase.table("books").insert(book_data).execute()


    return response.data








#Delete a book based off ID in database
@app.delete("/books/{book_id}")
async def delete_book(
    book_id: int,
    authorization: str = Header(None)
    ):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail= "Missing authorization Header"
        )

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code= 401,
            detail= "Invalid or expired token"
        )

    user_id = user.user.id



    try:
        response = (
            supabase
            .table("books")
            .delete()
            .eq("id", book_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Book not found"
            )

        return {
            "message": "Book deleted successfully",
            "deleted": response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail= str(e)
        )

# Edit a Book based off the ID in database
@app.put("/books/{book_id}")
async def update_book(
    book_id: int,
    authorization: str = Header(None),
    title: str = Form(...),
    author: str = Form(...),
    status: str = Form(...),
    notes: str = Form(""),
    image: UploadFile | None = File(None)
):
    
    # Check if authorization header exists
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )

    # Get the token from the authorization header
    token = authorization.replace("Bearer ", "")

    # Validate the token
    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    # Get the logged-in user's ID
    user_id = user.user.id

    # Find the existing book belonging to the logged-in user
    existing_book = (
        supabase
        .table("books")
        .select("*")
        .eq("id", book_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not existing_book.data:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    book = existing_book.data[0]

    # Keep the existing image by default
    image_url = book["image_url"]

    # If a new image was selected, upload it
    if image:
        file_content = await image.read()

        file_path = image.filename

        supabase.storage.from_("book-images").upload(
            file_path,
            file_content,
            {
                "content-type": image.content_type
            }
        )

        image_url = supabase.storage.from_(
            "book-images"
        ).get_public_url(file_path)

    # Update the book
    book_data = {
        "title": title,
        "author": author,
        "status": status,
        "notes": notes,
        "image_url": image_url
    }

    response = (
        supabase
        .table("books")
        .update(book_data)
        .eq("id", book_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response.data