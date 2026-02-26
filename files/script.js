// Student Management System - Data and Functions

let students = [];
let currentModalStudentId = null;

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSampleData(); // Optional: Load sample data for testing
});

// Initialize all event listeners
function initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    // Registration form
    document.getElementById('registrationForm').addEventListener('submit', registerStudent);

    // Performance student selection
    document.getElementById('performanceStudentId').addEventListener('change', function() {
        loadPerformanceForm(this.value);
    });

    // Search input
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStudent();
        }
    });
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Update content based on tab
    if (tabName === 'list') {
        displayStudentList();
    } else if (tabName === 'performance') {
        updatePerformanceDropdown();
    }
}

// ==================== STUDENT REGISTRATION ====================

function registerStudent(e) {
    e.preventDefault();

    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const form = parseInt(document.getElementById('form').value);

    const message = document.getElementById('registrationMessage');

    // Validation
    if (!name || !id || !gender || !age || !form) {
        showMessage(message, 'Please fill all required fields', 'error');
        return;
    }

    if (name.length < 3) {
        showMessage(message, 'Student name must be at least 3 characters', 'error');
        return;
    }

    if (age < 10 || age > 30) {
        showMessage(message, 'Please enter a valid age', 'error');
        return;
    }

    // Check for duplicate ID
    if (students.some(student => student.id === id)) {
        showMessage(message, 'Error: Student ID already exists!', 'error');
        return;
    }

    // Create student object
    const newStudent = {
        id: id,
        name: name,
        age: age,
        gender: gender,
        form: form,
        performance: []
    };

    // Add to students array
    students.push(newStudent);

    // Show success message
    showMessage(message, 'Student registered successfully!', 'success');

    // Reset form
    document.getElementById('registrationForm').reset();

    // Clear message after 3 seconds
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// ==================== STUDENT LIST DISPLAY ====================

function displayStudentList() {
    const container = document.getElementById('studentListContainer');

    if (students.length === 0) {
        container.innerHTML = '<p class="no-data">No students registered yet.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Current Form</th>
                    <th>Average Score</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    students.forEach(student => {
        const averageScore = calculateStudentAverage(student).toFixed(2);
        tableHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.age}</td>
                <td>${student.gender}</td>
                <td>Form ${student.form}</td>
                <td>${student.performance.length > 0 ? averageScore : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="viewStudentDetails('${student.id}')">View</button>
                        <button class="btn btn-danger" onclick="deleteStudentFromList('${student.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// View Student Details in Modal
function viewStudentDetails(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    currentModalStudentId = studentId;
    const modalBody = document.getElementById('modalBody');

    let detailsHTML = `
        <div class="student-detail-item">
            <strong>Student ID:</strong> ${student.id}
        </div>
        <div class="student-detail-item">
            <strong>Name:</strong> ${student.name}
        </div>
        <div class="student-detail-item">
            <strong>Age:</strong> ${student.age}
        </div>
        <div class="student-detail-item">
            <strong>Gender:</strong> ${student.gender}
        </div>
        <div class="student-detail-item">
            <strong>Current Form:</strong> Form ${student.form}
        </div>
    `;

    if (student.performance.length > 0) {
        detailsHTML += `<div class="student-detail-item"><strong>Overall Average:</strong> ${calculateStudentAverage(student).toFixed(2)}</div>`;

        detailsHTML += '<h3>Performance Records:</h3>';
        student.performance.forEach(perf => {
            const average = (
                (parseInt(perf.subjects.math) +
                 parseInt(perf.subjects.english) +
                 parseInt(perf.subjects.science) +
                 parseInt(perf.subjects.social)) / 4
            ).toFixed(2);

            detailsHTML += `
                <div class="performance-record">
                    <h4>Form ${perf.form}</h4>
                    <div class="subject-score">
                        <strong>Mathematics:</strong> <span>${perf.subjects.math}</span>
                    </div>
                    <div class="subject-score">
                        <strong>English:</strong> <span>${perf.subjects.english}</span>
                    </div>
                    <div class="subject-score">
                        <strong>Science:</strong> <span>${perf.subjects.science}</span>
                    </div>
                    <div class="subject-score">
                        <strong>Social Studies:</strong> <span>${perf.subjects.social}</span>
                    </div>
                    <div class="average-display">Average: ${average}</div>
                </div>
            `;
        });
    } else {
        detailsHTML += '<p class="no-data">No performance records yet.</p>';
    }

    modalBody.innerHTML = detailsHTML;
    openModal();
}

// Delete Student
function deleteStudent() {
    if (currentModalStudentId === null) return;

    const studentIndex = students.findIndex(s => s.id === currentModalStudentId);
    if (studentIndex > -1) {
        const studentName = students[studentIndex].name;
        students.splice(studentIndex, 1);
        closeModal();
        displayStudentList();
        alert('Student ' + studentName + ' has been deleted.');
    }
}

function deleteStudentFromList(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student && confirm('Are you sure you want to delete ' + student.name + '?')) {
        const index = students.findIndex(s => s.id === studentId);
        if (index > -1) {
            students.splice(index, 1);
            displayStudentList();
        }
    }
}

// Modal Functions
function openModal() {
    document.getElementById('studentModal').classList.add('show');
    document.getElementById('studentModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('studentModal').classList.remove('show');
    document.getElementById('studentModal').classList.add('hidden');
    currentModalStudentId = null;
}

// ==================== ACADEMIC PERFORMANCE ====================

function updatePerformanceDropdown() {
    const dropdown = document.getElementById('performanceStudentId');
    dropdown.innerHTML = '<option value="">Choose a student</option>';

    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.id}) - Form ${student.form}`;
        dropdown.appendChild(option);
    });
}

function loadPerformanceForm(studentId) {
    const formSection = document.getElementById('performanceForm');
    const displaySection = document.getElementById('performanceDisplay');

    if (!studentId) {
        formSection.classList.add('hidden');
        displaySection.classList.add('hidden');
        return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    formSection.classList.remove('hidden');
    displaySection.classList.remove('hidden');

    // Display existing records
    displayStudentPerformance(studentId);

    // Reset form
    document.getElementById('performanceFormLevel').value = '';
    document.getElementById('math').value = '';
    document.getElementById('english').value = '';
    document.getElementById('science').value = '';
    document.getElementById('social').value = '';
}

function savePerformance() {
    const studentId = document.getElementById('performanceStudentId').value;
    const formLevel = parseInt(document.getElementById('performanceFormLevel').value);
    const math = parseInt(document.getElementById('math').value);
    const english = parseInt(document.getElementById('english').value);
    const science = parseInt(document.getElementById('science').value);
    const social = parseInt(document.getElementById('social').value);

    const message = document.getElementById('performanceMessage');

    // Validation
    if (!studentId) {
        showMessage(message, 'Please select a student', 'error');
        return;
    }

    if (!formLevel) {
        showMessage(message, 'Please select a form level', 'error');
        return;
    }

    if (isNaN(math) || isNaN(english) || isNaN(science) || isNaN(social)) {
        showMessage(message, 'Please enter all subject marks', 'error');
        return;
    }

    if (math < 0 || math > 100 || english < 0 || english > 100 ||
        science < 0 || science > 100 || social < 0 || social > 100) {
        showMessage(message, 'Marks must be between 0 and 100', 'error');
        return;
    }

    // Find student
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Check if performance record exists for this form
    const existingPerformance = student.performance.find(p => p.form === formLevel);

    if (existingPerformance) {
        // Update existing record
        existingPerformance.subjects = {
            math: math,
            english: english,
            science: science,
            social: social
        };
        showMessage(message, 'Performance record updated successfully!', 'success');
    } else {
        // Add new record
        student.performance.push({
            form: formLevel,
            subjects: {
                math: math,
                english: english,
                science: science,
                social: social
            }
        });
        showMessage(message, 'Performance record added successfully!', 'success');
    }

    // Refresh display
    displayStudentPerformance(studentId);

    // Reset form
    document.getElementById('performanceFormLevel').value = '';
    document.getElementById('math').value = '';
    document.getElementById('english').value = '';
    document.getElementById('science').value = '';
    document.getElementById('social').value = '';

    // Clear message after 3 seconds
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

function displayStudentPerformance(studentId) {
    const student = students.find(s => s.id === studentId);
    const container = document.getElementById('performanceRecords');

    if (!student || student.performance.length === 0) {
        container.innerHTML = '<p class="no-data">No performance records for this student.</p>';
        return;
    }

    let recordsHTML = '';

    student.performance.forEach(perf => {
        const average = (
            (parseInt(perf.subjects.math) +
             parseInt(perf.subjects.english) +
             parseInt(perf.subjects.science) +
             parseInt(perf.subjects.social)) / 4
        ).toFixed(2);

        recordsHTML += `
            <div class="performance-record">
                <h4>Form ${perf.form}</h4>
                <div class="subject-score">
                    <strong>Mathematics:</strong> <span>${perf.subjects.math}</span>
                </div>
                <div class="subject-score">
                    <strong>English:</strong> <span>${perf.subjects.english}</span>
                </div>
                <div class="subject-score">
                    <strong>Science:</strong> <span>${perf.subjects.science}</span>
                </div>
                <div class="subject-score">
                    <strong>Social Studies:</strong> <span>${perf.subjects.social}</span>
                </div>
                <div class="average-display">Form Average: ${average}</div>
            </div>
        `;
    });

    container.innerHTML = recordsHTML;
}

// Calculate student's overall average
function calculateStudentAverage(student) {
    if (student.performance.length === 0) return 0;

    let totalSum = 0;
    let totalScores = 0;

    student.performance.forEach(perf => {
        totalSum += parseInt(perf.subjects.math);
        totalSum += parseInt(perf.subjects.english);
        totalSum += parseInt(perf.subjects.science);
        totalSum += parseInt(perf.subjects.social);
        totalScores += 4;
    });

    return totalScores === 0 ? 0 : totalSum / totalScores;
}

// ==================== SEARCH FUNCTIONALITY ====================

function searchStudent() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('searchResult');
    const detailDiv = document.getElementById('studentDetail');

    if (!searchInput) {
        resultDiv.classList.add('hidden');
        return;
    }

    const student = students.find(s =>
        s.id.toLowerCase().includes(searchInput) ||
        s.name.toLowerCase().includes(searchInput)
    );

    if (!student) {
        detailDiv.innerHTML = '<p class="no-data">No student found matching your search.</p>';
        resultDiv.classList.remove('hidden');
        return;
    }

    let searchHTML = `
        <div class="student-detail-item">
            <strong>Student ID:</strong> ${student.id}
        </div>
        <div class="student-detail-item">
            <strong>Name:</strong> ${student.name}
        </div>
        <div class="student-detail-item">
            <strong>Age:</strong> ${student.age}
        </div>
        <div class="student-detail-item">
            <strong>Gender:</strong> ${student.gender}
        </div>
        <div class="student-detail-item">
            <strong>Current Form:</strong> Form ${student.form}
        </div>
    `;

    if (student.performance.length > 0) {
        searchHTML += `<div class="student-detail-item"><strong>Overall Average:</strong> ${calculateStudentAverage(student).toFixed(2)}</div>`;

        searchHTML += '<h3>Performance Records:</h3>';
        student.performance.forEach(perf => {
            const average = (
                (parseInt(perf.subjects.math) +
                 parseInt(perf.subjects.english) +
                 parseInt(perf.subjects.science) +
                 parseInt(perf.subjects.social)) / 4
            ).toFixed(2);

            searchHTML += `
                <div class="performance-record">
                    <h4>Form ${perf.form}</h4>
                    <div class="subject-score">
                        <strong>Mathematics:</strong> <span>${perf.subjects.math}</span>
                    </div>
                    <div class="subject-score">
                        <strong>English:</strong> <span>${perf.subjects.english}</span>
                    </div>
                    <div class="subject-score">
                        <strong>Science:</strong> <span>${perf.subjects.science}</span>
                    </div>
                    <div class="subject-score">
                        <strong>Social Studies:</strong> <span>${perf.subjects.social}</span>
                    </div>
                    <div class="average-display">Form Average: ${average}</div>
                </div>
            `;
        });
    } else {
        searchHTML += '<p class="no-data">No performance records yet.</p>';
    }

    detailDiv.innerHTML = searchHTML;
    resultDiv.classList.remove('hidden');
}

function closeDetails() {
    document.getElementById('searchResult').classList.add('hidden');
    document.getElementById('searchInput').value = '';
}

// ==================== UTILITY FUNCTIONS ====================

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'message show ' + type;
}

// Load Sample Data for Testing (Optional)
function loadSampleData() {
    // Uncomment to load sample data
    /*
    students = [
        {
            id: 'S001',
            name: 'John Doe',
            age: 15,
            gender: 'Male',
            form: 2,
            performance: [
                {
                    form: 1,
                    subjects: { math: 85, english: 78, science: 82, social: 80 }
                }
            ]
        },
        {
            id: 'S002',
            name: 'Jane Smith',
            age: 14,
            gender: 'Female',
            form: 1,
            performance: []
        },
        {
            id: 'S003',
            name: 'Peter Johnson',
            age: 16,
            gender: 'Male',
            form: 3,
            performance: [
                {
                    form: 1,
                    subjects: { math: 72, english: 75, science: 68, social: 73 }
                },
                {
                    form: 2,
                    subjects: { math: 80, english: 82, science: 78, social: 85 }
                }
            ]
        }
    ];
    */
}
