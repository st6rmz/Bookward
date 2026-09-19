import "./AddBook.css"
import { Link } from "react-router-dom";


function AddBook(){
    return(

      <div className="add-book">
      <header className="books-header">
        <p className="eyebrow">Your Library</p>
        <h1>Add Book</h1>
        <p className="subtitle">
          Add a book, to keep track of your progress
        </p>
      </header>
      
      
      <form className="book-form">
       <label>Book Title</label>
       <input type="text" />

       <label>Book Author</label>
       <input type="text" />

       <label>Status</label>
       <select>
         <option>To Start</option>
         <option>Reading</option>
         <option>Completed</option>
       </select>

       <label>Notes</label>
       <textarea></textarea>

       <label>Book Image</label>
       <input type="file" accept="image/*"  />

       <div className="add-button">
       <button type="submit">Add Book</button>
       </div>       
      </form>


     <div className="back-button">
     <Link to="/">
     <button>Back</button>
     </Link>
     </div>

     <div className="add-button">

     </div>
     





      

     </div>
    );
}

export default AddBook;