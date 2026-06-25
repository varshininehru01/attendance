import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getStudents();
  }, []);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getStudents = async () => {
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        // fetch("http://localhost:3000/students"),
        fetch(`${API_URL}/students`),
        // fetch("http://localhost:3000/attendance/today"),
        fetch(`${API_URL}/attendance`),
      ]);

      const studentsData = await studentsRes.json();
      const attendanceData = await attendanceRes.json();

      const attendanceMap = {};

      attendanceData.forEach((record) => {
        const sId = record.studentId._id || record.studentId;
        attendanceMap[sId] = record.status;
      });

      const updatedStudents = studentsData.map((student) => ({
        ...student,
        attendance: attendanceMap[student._id] || "",
      }));

      setStudents(updatedStudents);
    } catch (err) {
      console.log("Error fetching data:", err);
    }
  };

  const saveAttendance = async (studentId, status) => {
    try {
      await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          status,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      console.log("Attendance Saved");
    } catch (err) {
      console.log("Error saving attendance:", err);
    }
  };

  const markAttendance = (id, status) => {
    setStudents(
      students.map((student) =>
        student._id === id
          ? { ...student, attendance: status }
          : student
      )
    );
  };

  const presentCount = students.filter(
    (student) => student.attendance === "P"
  ).length;

  const absentCount = students.filter(
    (student) => student.attendance === "A"
  ).length;

  const resetAttendance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance/today`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete records");
      }

      setStudents(
        students.map((student) => ({
          ...student,
          attendance: "",
        }))
      );

      console.log("Attendance Reset Successfully");
    } catch (err) {
      console.log("Error resetting attendance:", err);
      alert("Could not reset attendance.");
    }
  };

  return (
    <div className="container">
      <h1>Attendance Management System</h1>

      {/* Summary Cards */}
      <div className="summary-container">
        <div className="card present-card">
          <h3>Total Present</h3>
          <h2>{presentCount}</h2>
        </div>

        <div className="card absent-card">
          <h3>Total Absent</h3>
          <h2>{absentCount}</h2>
        </div>
      </div>

      <button
        className="reset-btn"
        onClick={resetAttendance}
      >
        Reset All
      </button>

      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Actions</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                style={{ textAlign: "center" }}
              >
                No Students Found
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student._id}>
                <td>{student.rollNo}</td>

                <td>{student.name}</td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="present-btn"
                      onClick={() => {
                        markAttendance(student._id, "P");
                        saveAttendance(student._id, "P");
                      }}
                    >
                      P
                    </button>

                    <button
                      className="absent-btn"
                      onClick={() => {
                        markAttendance(student._id, "A");
                        saveAttendance(student._id, "A");
                      }}
                    >
                      A
                    </button>
                  </div>
                </td>

                <td>
                  {student.attendance === "P" ? (
                    <span className="status present">
                      Present
                    </span>
                  ) : student.attendance === "A" ? (
                    <span className="status absent">
                      Absent
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;