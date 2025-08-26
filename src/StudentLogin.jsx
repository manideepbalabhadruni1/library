import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { FaBook, FaInbox, FaSignOutAlt, FaStar, FaArrowCircleUp, FaClipboardList, FaExclamationTriangle } from "react-icons/fa"; // Added FaExclamationTriangle

export default function StudentDashboard() {
  const studentId = 1; // Assuming a fixed studentId for simplicity
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [fullname, setFullname] = useState("");
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowDetails, setBorrowDetails] = useState({ borrowId: "", bookId: "", title: "", borrowDate: "" });
  const [returnBookId, setReturnBookId] = useState("");
  const [returnBookTitle, setReturnBookTitle] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({ bookId: "", rating: "", comment: "" });
  const [latestBorrowed, setLatestBorrowed] = useState(null);

  // --- NEW STATE FOR DAMAGE REPORT ---
  const [damagedBookId, setDamagedBookId] = useState("");
  const [damagedBookTitle, setDamagedBookTitle] = useState("");
  const [damageComments, setDamageComments] = useState("");
  const [damageImages, setDamageImages] = useState([]); // Stores File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Stores data URLs for preview
  // ------------------------------------

  useEffect(() => {
    axios.post("http://localhost:8080/api/users/login", {
      email: "manideepbalabhadruni4@gmail.com",
      password: "Deepu@4567"
    })
    .then(res => {
      setFullname(res.data.fullname);
      fetchBooks();
      fetchBorrowedBooks(studentId);
      fetchFeedbacks();
    })
    .catch(err => {
      console.error("Login failed or error fetching initial data", err);
    });
  }, []); // studentId removed to run once on mount

  const fetchBooks = () => {
    setIsLoadingBooks(true);
    console.log("Attempting to fetch books from API...");
    axios.get("http://localhost:8080/api/books")
      .then(res => {
        console.log("API Response for /api/books (raw):", res);
        if (res.data && Array.isArray(res.data)) {
          console.log("Books data received from API (res.data):", res.data);
          setBooks(res.data);
        } else {
          console.warn("/api/books did not return an array or res.data is missing. Received:", res.data);
          setBooks([]);
        }
      })
      .catch(err => {
        console.error("Error fetching books from API:", err);
        if (err.response) {
          console.error("API Error Response Data:", err.response.data);
          console.error("API Error Response Status:", err.response.status);
        } else if (err.request) {
          console.error("API Error Request Data:", err.request);
        } else {
          console.error("API Error Message:", err.message);
        }
        setBooks([]);
      })
      .finally(() => {
        setIsLoadingBooks(false);
      });
  };

  const fetchBorrowedBooks = (currentStudentId) => {
    axios.get(`http://localhost:8080/api/borrowed/${currentStudentId}`)
      .then(res => {
        const borrowedBooksWithDetails = (Array.isArray(res.data) ? res.data : []).map(borrow => ({
          ...borrow,
          title: (books.find(b => b.id === borrow.bookId) || {}).title || 'N/A',
          borrowDate: new Date(borrow.borrowDate).toLocaleDateString()
        }));
        setBorrowedBooks(borrowedBooksWithDetails);
      })
      .catch(err => {
        console.error("Error fetching borrowed books", err.response ? (err.response.data || err.response.statusText) : err.message);
        setBorrowedBooks([]);
      });
  };

  useEffect(() => {
    if (books.length > 0 && studentId) {
      fetchBorrowedBooks(studentId);
    }
  }, [books, studentId]);

  const fetchFeedbacks = () => {
    axios.get("http://localhost:8080/api/feedback")
      .then(res => {
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Error fetching feedbacks", err);
        setFeedbacks([]);
      });
  };

  const handleLogout = () => {
    navigate("/beforelogin");
  };

  const handleBorrowRequest = () => {
    if (!borrowDetails.bookId) {
      alert("Please enter a Book ID to borrow.");
      return;
    }
    const selectedBook = books.find(b => b.id === parseInt(borrowDetails.bookId));
    if (!selectedBook) {
      alert("Book ID not found. Please enter a valid Book ID.");
      return;
    }
    if (!selectedBook.available) {
      alert("This book is currently unavailable.");
      return;
    }

    const date = borrowDetails.borrowDate || new Date().toISOString().split("T")[0];
    axios.post("http://localhost:8080/api/borrow", {
      studentId,
      bookId: parseInt(borrowDetails.bookId),
      borrowDate: date
    })
      .then(res => {
        alert("Borrow request sent successfully!");
        fetchBorrowedBooks(studentId);
        fetchBooks();
        setLatestBorrowed({
          id: res.data.id || "N/A", // Assuming backend returns the new borrow record with an ID
          title: selectedBook.title || "N/A",
          borrowDate: new Date(date).toLocaleDateString()
        });
        setBorrowDetails({ borrowId: "", bookId: "", title: "", borrowDate: "" });
      })
      .catch(err => {
        console.error("Failed to request borrow.", err.response ? err.response.data : err.message);
        alert(`Failed to request borrow. ${err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : err.message}`);
      });
  };

  const handleReturnBook = () => {
    if (!returnBookId || !returnDate) {
      alert("Please enter Book ID and Return Date.");
      return;
    }
    const bookToReturn = borrowedBooks.find(b => b.bookId === parseInt(returnBookId) && !b.returned);
    if (!bookToReturn) {
      alert("You have not borrowed this book or it has already been returned.");
      return;
    }

    axios.put(`http://localhost:8080/api/return`, {
      studentId,
      bookId: parseInt(returnBookId),
      returnDate: returnDate
    })
      .then(() => {
        alert("Book returned successfully!");
        fetchBorrowedBooks(studentId);
        fetchBooks();
        setReturnBookId("");
        setReturnBookTitle("");
        setReturnDate("");
      })
      .catch(err => {
        console.error("Failed to return book.", err.response ? err.response.data : err.message);
        alert(`Failed to return book. ${err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : err.message}`);
      });
  };

  const handleSubmitFeedback = () => {
    if (!newFeedback.bookId.trim() || !newFeedback.rating.toString().trim()) {
      alert("Please provide Book ID and Rating.");
      return;
    }
    const bookExists = books.find(b => b.id === parseInt(newFeedback.bookId));
    if (!bookExists) {
      alert("Invalid Book ID. Please enter an ID for an existing book.");
      return;
    }

    axios.post("http://localhost:8080/api/feedback", {
      studentId,
      bookId: parseInt(newFeedback.bookId.trim()),
      rating: parseInt(newFeedback.rating, 10),
      comment: newFeedback.comment.trim()
    })
      .then(() => {
        alert("Feedback submitted successfully!");
        fetchFeedbacks();
        setNewFeedback({ bookId: "", rating: "", comment: "" });
      })
      .catch(err => {
        console.error("Failed to submit feedback.", err.response ? err.response.data : err.message);
        alert(`Failed to submit feedback. ${err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : err.message}`);
      });
  };

  // --- HANDLERS FOR DAMAGE REPORT ---
  const handleImageUpload = (event) => {
    // Revoke old previews before setting new ones
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));

    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length === 0) { // User cancelled file dialog or selected no files
      setDamageImages([]);
      setImagePreviews([]);
      return;
    }

    if (selectedFiles.length > 3) {
      alert("You can upload a maximum of 3 images.");
      event.target.value = null; // Clear the file input
      setDamageImages([]);
      setImagePreviews([]);
      return;
    }
    setDamageImages(selectedFiles);

    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Cleanup for image previews to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleDamageReportSubmit = () => {
    if (!damagedBookId.trim()) {
      alert("Please enter the Book ID of the damaged book.");
      return;
    }
    if (damageImages.length === 0) {
      alert("Please upload at least one picture of the damage.");
      return;
    }
    if (!damageComments.trim()) {
      alert("Please provide comments about the damage.");
      return;
    }

    const bookIdNum = parseInt(damagedBookId.trim());
    const bookToReportDetails = books.find(b => b.id === bookIdNum);

    if (!bookToReportDetails) {
      alert("Book ID not found in the library system. Please enter a valid Book ID.");
      return;
    }

    // Ensure the student is reporting a book they have actually borrowed.
    // This aligns with "when returning damaged books".
    const studentBorrowedThisBook = borrowedBooks.find(b => b.bookId === bookIdNum);
    if (!studentBorrowedThisBook) {
        alert("You can only report damage for books you have borrowed. Please ensure the Book ID is correct or that you have borrowed this book.");
        return;
    }

    const formData = new FormData();
    formData.append("studentId", studentId.toString());
    formData.append("bookId", bookIdNum.toString());
    formData.append("comments", damageComments.trim());
    damageImages.forEach((file) => { // Removed index, backend usually handles multiple files with same key
      formData.append(`images`, file);
    });

    // For debugging FormData:
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    axios.post("http://localhost:8080/api/books/report-damage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(res => {
      alert("Damage report submitted successfully!");
      setDamagedBookId("");
      setDamagedBookTitle("");
      setDamageComments("");
      setDamageImages([]);
      setImagePreviews([]); // Previews are revoked by the useEffect cleanup
      const fileInput = document.getElementById('damage-images-upload');
      if (fileInput) fileInput.value = null; // Clear the file input display
    })
    .catch(err => {
      console.error("Failed to submit damage report.", err.response ? err.response.data : err.message);
      alert(`Failed to submit damage report. ${err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : err.message}`);
    });
  };
  // ------------------------------------

  const renderModule = () => {
    // ... (existing cases for viewBooks, borrowBook, borrowedBooks, returnBook, submitFeedback, viewFeedbacks)

    switch (activeModule) {
      case "viewBooks":
        // ... (same as your existing code)
        if (isLoadingBooks) {
          return (
            <div className="module-card full-width">
              <h2>📚 Available Books</h2>
              <p>Loading books, please wait...</p>
            </div>
          );
        }
        return (
          <div className="module-card full-width">
            <h2>📚 Available Books</h2>
            {books.length > 0 ? (
              <ul className="book-list-detailed">
                {books.map(book => (
                  <li key={book.id} className="book-item-detailed">
                    <div className="book-item-main-info">
                      <div>
                        <strong>{book.title || 'No Title Provided'}</strong>
                        <span className="book-author"> by {book.author || 'N/A'}</span>
                      </div>
                      <span className={`status ${book.available ? "status-available" : "status-unavailable"}`}>
                        {book.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="book-item-extra-info">
                      <span>ID: {book.id}</span>
                      <span>ISBN: {book.isbn || 'N/A'}</span>
                      <span>Genre: {book.genre || 'N/A'}</span>
                      <span>Year: {book.publicationYear || 'N/A'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No books found. This could be because none are currently in the library,
                the API is not responding, or there was an error fetching the data.
                Please check the browser console for more details or try again later.
              </p>
            )}
          </div>
        );
      case "borrowBook":
        // ... (same as your existing code)
        return (
          <div className="module-card full-width">
            <h2>📖 Borrow Book</h2>
            <input
              type="number"
              placeholder="Enter Book ID to Borrow"
              value={borrowDetails.bookId}
              onChange={(e) => {
                setBorrowDetails({ ...borrowDetails, bookId: e.target.value });
                const foundBook = books.find(b => b.id === parseInt(e.target.value));
                setBorrowDetails(prev => ({...prev, title: foundBook ? foundBook.title : ""}));
              }}
            />
            <input
              type="text"
              placeholder="Book Title (auto-filled)"
              value={borrowDetails.title}
              readOnly
            />
            <input
              type="date"
              value={borrowDetails.borrowDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setBorrowDetails({ ...borrowDetails, borrowDate: e.target.value })}
            />
            <button onClick={handleBorrowRequest}>Request Borrow</button>
    
            {latestBorrowed && (
              <div className="borrow-info">
                <h3>✅ Recently Borrowed</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Borrow ID</th>
                      <th>Book Title</th>
                      <th>Borrow Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{latestBorrowed.id}</td>
                      <td>{latestBorrowed.title}</td>
                      <td>{latestBorrowed.borrowDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "borrowedBooks":
        // ... (same as your existing code)
        return (
          <div className="module-card full-width">
            <h2>📅 My Borrowed Books</h2>
            {borrowedBooks.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Borrow ID</th>
                    <th>Book ID</th>
                    <th>Book Title</th>
                    <th>Borrow Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowedBooks.map(borrow => (
                    <tr key={borrow.id}>
                      <td>{borrow.id}</td>
                      <td>{borrow.bookId}</td>
                      <td>{borrow.title || (books.find(b => b.id === borrow.bookId) || {}).title || 'N/A'}</td>
                      <td>{borrow.borrowDate}</td>
                      <td>{borrow.returned ? <span className="status-returned">Returned</span> : <span className="status-borrowed">Borrowed</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>You have not borrowed any books yet, or data is loading.</p>}
          </div>
        );
      case "returnBook":
        // ... (same as your existing code)
        return (
          <div className="module-card full-width">
            <h2>📤 Return Book</h2>
            <input
              type="number"
              placeholder="Enter Book ID to Return"
              value={returnBookId}
              onChange={(e) => {
                  setReturnBookId(e.target.value);
                  const borrowedBookEntry = borrowedBooks.find(b => b.bookId === parseInt(e.target.value) && !b.returned);
                  if (borrowedBookEntry) {
                    // The title should already be in borrowedBookEntry from fetchBorrowedBooks
                    setReturnBookTitle(borrowedBookEntry.title || "Book not found in your borrowed list");
                  } else {
                    setReturnBookTitle("");
                  }
              }}
            />
            <input
              type="text"
              placeholder="Book Title (auto-filled)"
              value={returnBookTitle}
              readOnly
            />
            <input
              type="date"
              value={returnDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setReturnDate(e.target.value)}
            />
            <button onClick={handleReturnBook}>Return Book</button>
          </div>
        );
      case "submitFeedback":
        // ... (same as your existing code)
        return (
          <div className="module-card full-width">
            <h2>⭐ Submit Feedback</h2>
            <input
              type="number"
              placeholder="Enter Book ID for Feedback"
              value={newFeedback.bookId}
              onChange={(e) => setNewFeedback({ ...newFeedback, bookId: e.target.value })}
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              min="1"
              max="5"
              value={newFeedback.rating}
              onChange={(e) => setNewFeedback({ ...newFeedback, rating: e.target.value })}
            />
            <textarea
              placeholder="Comment (Optional)"
              value={newFeedback.comment}
              onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
            ></textarea>
            <button onClick={handleSubmitFeedback}>Submit Feedback</button>
          </div>
        );
      case "viewFeedbacks":
        // ... (same as your existing code)
        return (
          <div className="module-card full-width">
            <h2>📥 My Feedback / All Feedback</h2>
            {feedbacks.length > 0 ? (
              <ul>
                {feedbacks.map(f => {
                  const book = books.find(b => b.id === f.bookId);
                  return (
                    <li key={f.id}>
                      <strong>Book: {book ? book.title : `ID ${f.bookId}`}</strong><br />
                      Rating: {f.rating}/5<br />
                      Comment: {f.comment || "No comment"}
                    </li>
                  );
                })}
              </ul>
            ) : <p>No feedback has been submitted yet, or data is loading.</p>}
          </div>
        );
      // --- NEW CASE FOR DAMAGE REPORT ---
      case "reportDamage":
        return (
          <div className="module-card full-width">
            <h2><FaExclamationTriangle style={{ marginRight: '8px' }} /> Report Damaged Book</h2>
            <input
              type="number"
              placeholder="Enter Book ID of Damaged Book"
              value={damagedBookId}
              onChange={(e) => {
                const bookIdInput = e.target.value;
                setDamagedBookId(bookIdInput);
                if (bookIdInput) {
                  const bookIdNum = parseInt(bookIdInput);
                  const studentBorrowedThisBook = borrowedBooks.find(b => b.bookId === bookIdNum);
                  if (studentBorrowedThisBook) {
                    setDamagedBookTitle(studentBorrowedThisBook.title || "Title N/A (Borrowed Book)");
                  } else {
                    const libraryBook = books.find(b => b.id === bookIdNum);
                    setDamagedBookTitle(libraryBook ? libraryBook.title : "Book ID not found");
                  }
                } else {
                  setDamagedBookTitle("");
                }
              }}
            />
            <input
              type="text"
              placeholder="Book Title (auto-filled)"
              value={damagedBookTitle}
              readOnly
            />
            <textarea
              placeholder="Describe the damage..."
              value={damageComments}
              rows="4"
              onChange={(e) => setDamageComments(e.target.value)}
            />
            <div className="form-group">
              <label htmlFor="damage-images-upload">Upload Pictures of Damage (max 3):</label>
              <input
                type="file"
                id="damage-images-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                <h4>Image Previews:</h4>
                {imagePreviews.map((preview, index) => (
                  <img key={index} src={preview} alt={`Damage preview ${index + 1}`} />
                ))}
              </div>
            )}
            <button onClick={handleDamageReportSubmit}>Submit Damage Report</button>
          </div>
        );
      // ------------------------------------
      default: // Dashboard View
        return (
          <div className="dashboard">
            <div className="module-card" onClick={() => setActiveModule("viewBooks")}>
              <FaBook className="module-icon" />
              <div className="module-title">View Books</div>
            </div>
            <div className="module-card" onClick={() => setActiveModule("borrowBook")}>
              <FaClipboardList className="module-icon" />
              <div className="module-title">Borrow Book</div>
            </div>
            <div className="module-card" onClick={() => setActiveModule("borrowedBooks")}>
              <FaInbox className="module-icon" />
              <div className="module-title">My Borrowed Books</div>
            </div>
            <div className="module-card" onClick={() => setActiveModule("returnBook")}>
              <FaArrowCircleUp className="module-icon" />
              <div className="module-title">Return Book</div>
            </div>
            <div className="module-card" onClick={() => setActiveModule("submitFeedback")}>
              <FaStar className="module-icon" />
              <div className="module-title">Submit Feedback</div>
            </div>
            <div className="module-card" onClick={() => setActiveModule("viewFeedbacks")}>
              <FaInbox className="module-icon" /> {/* Consider a different icon if FaInbox is heavily used */}
              <div className="module-title">View All Feedback</div>
            </div>
            {/* --- NEW DASHBOARD CARD FOR DAMAGE REPORT --- */}
            <div className="module-card" onClick={() => setActiveModule("reportDamage")}>
              <FaExclamationTriangle className="module-icon" />
              <div className="module-title">Report Damaged Book</div>
            </div>
            {/* ------------------------------------------- */}
          </div>
        );
    }
  };

  return (
    <div className="student-login-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📘 LMS</h2>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => setActiveModule("dashboard")} className={activeModule === 'dashboard' ? 'active' : ''}><FaBook /><span>Dashboard</span></li>
          <li onClick={() => setActiveModule("viewBooks")} className={activeModule === 'viewBooks' ? 'active' : ''}><FaBook /><span>View Books</span></li>
          <li onClick={() => setActiveModule("borrowBook")} className={activeModule === 'borrowBook' ? 'active' : ''}><FaClipboardList /><span>Borrow Book</span></li>
          <li onClick={() => setActiveModule("borrowedBooks")} className={activeModule === 'borrowedBooks' ? 'active' : ''}><FaInbox /><span>Borrowed</span></li>
          <li onClick={() => setActiveModule("returnBook")} className={activeModule === 'returnBook' ? 'active' : ''}><FaArrowCircleUp /><span>Return</span></li>
          <li onClick={() => setActiveModule("submitFeedback")} className={activeModule === 'submitFeedback' ? 'active' : ''}><FaStar /><span>Feedback</span></li>
          <li onClick={() => setActiveModule("viewFeedbacks")} className={activeModule === 'viewFeedbacks' ? 'active' : ''}><FaInbox /><span>All Feedback</span></li>
          {/* --- NEW SIDEBAR ITEM FOR DAMAGE REPORT --- */}
          <li onClick={() => setActiveModule("reportDamage")} className={activeModule === 'reportDamage' ? 'active' : ''}><FaExclamationTriangle /><span>Report Damage</span></li>
          {/* ----------------------------------------- */}
          <li onClick={handleLogout}><FaSignOutAlt /><span>Logout</span></li>
        </ul>
      </div>

      <div className="main-content">
        <div className="navbar">
          <div className="welcome-text">Welcome, {fullname || "Student"}!</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="module-container">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}