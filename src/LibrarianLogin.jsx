// Librarian.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LibrarianLogin.css"; // Make sure this CSS file exists and is correctly styled
import {
  FaBook, FaUser, FaClipboardList, FaCommentDots, FaSignOutAlt,
  FaTachometerAlt, FaCalendarTimes, FaRupeeSign, FaBookOpen,
  FaPlusCircle
} from "react-icons/fa";

export default function Librarian() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [allBorrowRecords, setAllBorrowRecords] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    publicationYear: "",
  });

  useEffect(() => {
    // Fetch initial data for dashboard cards
    fetchLibraryBooks();
    fetchStudents();
    fetchAllSystemBorrowRecords();
    fetchFeedbacks();
  }, []);

  // Fetch data when a specific module becomes active
  useEffect(() => {
    if (activeModule === "viewBooks") fetchLibraryBooks();
    if (activeModule === "viewStudents") fetchStudents();
    if (activeModule === "viewBorrows") fetchAllSystemBorrowRecords();
    if (activeModule === "viewFeedbacks") fetchFeedbacks();
  }, [activeModule]);


  const fetchLibraryBooks = () => {
    axios.get("http://localhost:8080/api/books")
      .then(res => {
        setBooks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Librarian - Error fetching books:", err.response ? err.response.data : err.message);
        setBooks([]);
      });
  };

  const fetchStudents = () => {
    axios.get("http://localhost:8080/api/users") // Assuming this endpoint returns all users including students
      .then(res => {
        setStudents(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Librarian - Error fetching students:", err.response ? err.response.data : err.message);
        setStudents([]);
      });
  };

  const fetchAllSystemBorrowRecords = () => {
    axios.get("http://localhost:8080/api/borrow/all")
      .then(res => {
        if (Array.isArray(res.data)) {
          const processedRecords = res.data.map(record => {
            let fineStr = "0.00";
            if (record.fineAmount !== null && record.fineAmount !== undefined) {
              const fineNum = parseFloat(record.fineAmount);
              fineStr = !isNaN(fineNum) ? fineNum.toFixed(2) : "0.00";
            }
            return {
              ...record,
              fineAmount: fineStr
            };
          });
          setAllBorrowRecords(processedRecords);
        } else {
          console.error("Librarian - Borrow records API did not return an array:", res.data);
          setAllBorrowRecords([]);
        }
      })
      .catch(err => {
        console.error("Librarian - Error fetching all borrow records:", err.response ? err.response.data : err.message);
        setAllBorrowRecords([]);
      });
  };

  const fetchFeedbacks = () => {
    axios.get("http://localhost:8080/api/feedback")
      .then(res => {
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Librarian - Error fetching feedbacks:", err.response ? err.response.data : err.message);
        setFeedbacks([]);
      });
  };

  const handleLogout = () => {
    navigate("/beforelogin");
  };

  const handleNewBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prevBook => ({
      ...prevBook,
      [name]: value
    }));
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.isbn.trim() || !newBook.genre.trim() || !newBook.publicationYear.trim()) {
      alert("Please fill in all fields: Title, Author, ISBN, Genre, and Publication Year.");
      return;
    }
    const year = parseInt(newBook.publicationYear, 10);
    if (isNaN(year) || newBook.publicationYear.length !== 4) {
        alert("Publication Year must be a valid 4-digit number.");
        return;
    }
    try {
      const bookPayload = {
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        isbn: newBook.isbn.trim(),
        genre: newBook.genre.trim(),
        publicationYear: year,
      };
      const response = await axios.post("http://localhost:8080/api/books", bookPayload);
      if (response.status === 201) {
        alert("Book added successfully!");
        setNewBook({ title: "", author: "", isbn: "", genre: "", publicationYear: "" });
        fetchLibraryBooks(); // Refresh book list
        setActiveModule("viewBooks"); // Navigate to view books
      } else {
        alert(`Failed to add book. Status: ${response.status} - ${response.data?.message || response.data || ''}`);
      }
    } catch (error) {
      console.error("Librarian - Error adding book:", error.response ? error.response.data : error.message);
      let errorMessage = "An unknown error occurred.";
      if (error.response) {
        errorMessage = typeof error.response.data === 'string' ? error.response.data : error.response.data?.message || JSON.stringify(error.response.data);
      } else {
        errorMessage = error.message;
      }
      alert(`Failed to add book: ${errorMessage}`);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case "viewBooks":
        return (
          <div className="module-card full-width">
            <h2><FaBookOpen /> Manage Books</h2>
            {books.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Title</th><th>Author</th><th>ISBN</th>
                    <th>Genre</th><th>Pub. Year</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.id}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.genre || 'N/A'}</td>
                      <td>{book.publicationYear || 'N/A'}</td>
                      <td className={book.available ? "status-available" : "status-unavailable"}>
                        {book.available ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No books found in the system.</p>}
          </div>
        );
      case "addBook":
        return (
          <div className="module-card full-width">
            <h2><FaPlusCircle /> Add New Book</h2>
            <form onSubmit={handleAddBookSubmit} className="add-book-form">
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" name="title" value={newBook.title} onChange={handleNewBookChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="author">Author:</label>
                <input type="text" id="author" name="author" value={newBook.author} onChange={handleNewBookChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="isbn">ISBN:</label>
                <input type="text" id="isbn" name="isbn" value={newBook.isbn} onChange={handleNewBookChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="genre">Genre:</label>
                <input type="text" id="genre" name="genre" value={newBook.genre} onChange={handleNewBookChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="publicationYear">Publication Year:</label>
                <input type="number" id="publicationYear" name="publicationYear" value={newBook.publicationYear} onChange={handleNewBookChange} required placeholder="YYYY" min="1000" max={new Date().getFullYear()}/>
              </div>
              <button type="submit" className="btn-submit-book">Add Book to Library</button>
            </form>
          </div>
        );
      case "viewStudents":
        return (
          <div className="module-card full-width">
            <h2><FaUser /> All Users</h2>
            {students.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User ID</th><th>Email</th><th>Full Name</th><th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    // Make sure student.id is unique and present
                    <tr key={student.id || student.email}>
                      <td>{student.id || 'N/A'}</td>
                      <td>{student.email}</td>
                      <td>{student.fullname || "N/A"}</td>
                      <td>{student.role === 0 ? "Student" : (student.role === 1 ? "Librarian" : "Unknown")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No users found.</p>}
          </div>
        );
      case "viewBorrows":
        return (
          <div className="module-card full-width">
            <h2><FaClipboardList /> All Borrow Records</h2>
            {allBorrowRecords.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Borrow ID</th>
                    <th>Student Email (or ID)</th>
                    <th>Book Title (or ID)</th>
                    <th>Borrow Date</th>
                    <th><FaCalendarTimes/> Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th><FaRupeeSign/> Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {allBorrowRecords.map(record => {
                    const student = students.find(s => s.id === record.studentId);
                    const book = books.find(b => b.id === record.bookId);
                    return (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{student ? student.email : `Student ID: ${record.studentId}`}</td>
                        <td>{book ? book.title : `Book ID: ${record.bookId}`}</td>
                        <td>{record.borrowDate ? new Date(record.borrowDate).toLocaleDateString() : 'N/A'}</td>
                        <td style={new Date(record.dueDate) < new Date() && !record.returnDate ? {color: 'red', fontWeight: 'bold'} : {}}>
                            {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'Not Returned'}</td>
                        <td>
                          {record.returned ?
                            <span className="status-returned">Returned</span> :
                            <span className="status-borrowed">Borrowed</span>
                          }
                        </td>
                        <td className={parseFloat(record.fineAmount) > 0 ? "fine-applied" : ""}>
                          ₹{record.fineAmount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <p>No borrow records found in the system.</p>}
          </div>
        );
      case "viewFeedbacks":
        return (
          <div className="module-card full-width">
            <h2><FaCommentDots /> All Feedback</h2>
            {feedbacks.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Feedback ID</th>
                    <th>Student Email (or ID)</th>
                    <th>Book Title (or ID)</th>
                    <th>Rating</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map(fb => {
                    const student = students.find(s => s.id === fb.studentId);
                    const book = books.find(b => b.id === fb.bookId);
                    return (
                      <tr key={fb.id}>
                        <td>{fb.id}</td>
                        <td>{student ? student.email : `Student ID: ${fb.studentId}`}</td>
                        <td>{book ? book.title : `Book ID: ${fb.bookId}`}</td>
                        <td>{fb.rating}/5</td>
                        <td>{fb.comment || "No comment"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <p>No feedback submitted yet.</p>}
          </div>
        );
      default: // Dashboard view
        const totalBooks = books.length;
        const availableBooksCount = books.filter(b => b.available).length;
        const totalRegisteredUsers = students.length;
        const activeBorrows = allBorrowRecords.filter(r => !r.returned).length;
        const totalFinesRecorded = allBorrowRecords
            .reduce((sum, record) => sum + (record.fineAmount ? parseFloat(record.fineAmount) : 0), 0)
            .toFixed(2);

        return (
          <div className="dashboard">
            <div className="module-card" onClick={() => setActiveModule("addBook")}>
              <FaPlusCircle className="module-icon" />
              <div className="module-title">Add New Book</div>
              <p className="module-count"> </p>
            </div>
            <div className="module-card">
              <FaBook className="module-icon" />
              <div className="module-title">Total Books</div>
              <p className="module-count">{totalBooks} ( {availableBooksCount} Available )</p>
            </div>
            <div className="module-card">
              <FaUser className="module-icon" />
              <div className="module-title">Registered Users</div>
              <p className="module-count">{totalRegisteredUsers}</p>
            </div>
            <div className="module-card">
              <FaClipboardList className="module-icon" />
              <div className="module-title">Books Currently Borrowed</div>
              <p className="module-count">{activeBorrows}</p>
            </div>
            <div className="module-card">
              <FaRupeeSign className="module-icon" />
              <div className="module-title">Total Fines Recorded</div>
              <p className="module-count">₹{totalFinesRecorded}</p>
            </div>
            <div className="module-card" onClick={() => setActiveModule("viewFeedbacks")}>
              <FaCommentDots className="module-icon" />
              <div className="module-title">Feedbacks Received</div>
              <p className="module-count">{feedbacks.length}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="librarian-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📚 LMS</h2>
          <span>Librarian Panel</span>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => setActiveModule("dashboard")} className={activeModule === "dashboard" ? "active" : ""}><FaTachometerAlt /><span>Dashboard</span></li>
          <li onClick={() => setActiveModule("addBook")} className={activeModule === "addBook" ? "active" : ""}><FaPlusCircle /><span>Add New Book</span></li>
          <li onClick={() => setActiveModule("viewBooks")} className={activeModule === "viewBooks" ? "active" : ""}><FaBookOpen /><span>Manage Books</span></li>
          <li onClick={() => setActiveModule("viewStudents")} className={activeModule === "viewStudents" ? "active" : ""}><FaUser /><span>View Users</span></li>
          <li onClick={() => setActiveModule("viewBorrows")} className={activeModule === "viewBorrows" ? "active" : ""}><FaClipboardList /><span>Borrow Records</span></li>
          <li onClick={() => setActiveModule("viewFeedbacks")} className={activeModule === "viewFeedbacks" ? "active" : ""}><FaCommentDots /><span>View Feedbacks</span></li>
          <li onClick={handleLogout} className="logout-item"><FaSignOutAlt /><span>Logout</span></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="navbar">
          <div className="welcome-text">Welcome, Librarian!</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="module-display-area">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}