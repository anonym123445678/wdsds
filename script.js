// Define an array to store student data
let students = [];
let undoStack = [];
let redoStack = [];

// Function to add a new student
function addStudent() {
  const nameInput = document.getElementById('studentNameInput');
  const name = nameInput.value.trim();
  if (name !== "") {
    students.push({ 
      name, 
      presence: { marks: 0, editable: true }, 
      discipline: { marks: 0, editable: true }, 
      teamwork: { marks: 0, editable: true }, 
      participation: { marks: 0, editable: true }, 
      totalPoints: 0 
    });
    nameInput.value = ''; // Clear input field after adding student
    undoStack.push({ action: 'add', student: students[students.length - 1] });
    redoStack = []; // Clear redo stack after new action
    renderStudents(); // Render updated student list
  }
}

// Function to clear all marks for all students
function clearAllMarks() {
  const currentState = JSON.parse(JSON.stringify(students));
  students.forEach(student => {
    student.presence.marks = 0;
    student.discipline.marks = 0;
    student.teamwork.marks = 0;
    student.participation.marks = 0;
    student.totalPoints = 0;
  });
  undoStack.push({ action: 'modify', state: currentState });
  redoStack = []; // Clear redo stack after new action
  renderStudents(); // Render updated student list
}

// Function to remove a student from the list
function removeStudent(index) {
  const currentState = JSON.parse(JSON.stringify(students));
  const removedStudent = students.splice(index, 1)[0];
  undoStack.push({ action: 'remove', student: removedStudent });
  redoStack = []; // Clear redo stack after new action
  renderStudents(); // Render updated student list
}

// Function to undo the last action
function undo() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    if (lastAction.action === 'add') {
      students.pop();
    } else if (lastAction.action === 'modify') {
      redoStack.push({ action: 'modify', state: JSON.parse(JSON.stringify(students)) });
      students = lastAction.state;
    } else if (lastAction.action === 'remove') {
      const removedStudent = lastAction.student;
      students.push(removedStudent);
    }
    renderStudents();
  }
}

// Function to redo the last undone action
function redo() {
  if (redoStack.length > 0) {
    const lastRedo = redoStack.pop();
    if (lastRedo.action === 'modify') {
      undoStack.push({ action: 'modify', state: JSON.parse(JSON.stringify(students)) });
      students = lastRedo.state;
    } else if (lastRedo.action === 'add') {
      students.push(lastRedo.student);
    } else if (lastRedo.action === 'remove') {
      const removedStudent = lastRedo.student;
      const index = students.findIndex(student => student.name === removedStudent.name);
      if (index !== -1) {
        students.splice(index, 1);
      }
    }
    renderStudents();
  }
}

// Function to update a mark for a student
function updateMark(element, category, index) {
  let newValue = parseFloat(element.innerText); // Get the new value from the cell
  if (!isNaN(newValue)) {
    students[index][category].marks = newValue; // Update the mark in the student data
    students[index].totalPoints = students[index].presence.marks + students[index].discipline.marks + students[index].teamwork.marks + students[index].participation.marks; // Recalculate total points
    renderStudents(); // Render updated student list
  }
}

// Function to add or subtract marks from a cell
function addOrSubtractMark(operation, category, index) {
  let cell = students[index][category];
  if (operation === 'add') {
    cell.marks++;
  } else if (operation === 'subtract') {
    cell.marks--;
  }
  students[index].totalPoints = students[index].presence.marks + students[index].discipline.marks + students[index].teamwork.marks + students[index].participation.marks; // Recalculate total points
  renderStudents(); // Render updated student list
}

// Function to save data as Excel
function saveAsExcel() {
  const wsData = [];
  students.forEach(student => {
    wsData.push([student.name, student.presence.marks, student.discipline.marks, student.teamwork.marks, student.participation.marks, student.totalPoints]);
  });
  const ws = XLSX.utils.aoa_to_sheet([["Name", "Presence", "Discipline", "Teamwork", "Participation", "Total Points"], ...wsData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  const wbout = XLSX.write(wb, {bookType: 'xlsx',  type: 'binary'});
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'excellence_academy_data.xlsx';
  link.click();
}

// Function to render the student list
function renderStudents() {
  const studentsBody = document.getElementById('students-body');
  studentsBody.innerHTML = ''; // Clear existing student rows
  students.forEach((student, index) => {
    const studentRow = document.createElement('tr');
    
    // Name cell
    const nameCell = document.createElement('td');
    nameCell.textContent = student.name;
    studentRow.appendChild(nameCell);
    
    // Presence cell with buttons
    const presenceCell = document.createElement('td');
    const presenceAddButton = document.createElement('button');
    presenceAddButton.textContent = '+';
    presenceAddButton.addEventListener('click', () => addOrSubtractMark('add', 'presence', index));
    const presenceSubtractButton = document.createElement('button');
    presenceSubtractButton.textContent = '-';
    presenceSubtractButton.addEventListener('click', () => addOrSubtractMark('subtract', 'presence', index));
    presenceCell.appendChild(presenceAddButton);
    presenceCell.appendChild(presenceSubtractButton);
    presenceCell.appendChild(document.createTextNode(student.presence.marks));
    studentRow.appendChild(presenceCell);
    
    // Discipline cell with buttons
    const disciplineCell = document.createElement('td');
    const disciplineAddButton = document.createElement('button');
    disciplineAddButton.textContent = '+';
    disciplineAddButton.addEventListener('click', () => addOrSubtractMark('add', 'discipline', index));
    const disciplineSubtractButton = document.createElement('button');
    disciplineSubtractButton.textContent = '-';
    disciplineSubtractButton.addEventListener('click', () => addOrSubtractMark('subtract', 'discipline', index));
    disciplineCell.appendChild(disciplineAddButton);
    disciplineCell.appendChild(disciplineSubtractButton);
    disciplineCell.appendChild(document.createTextNode(student.discipline.marks));
    studentRow.appendChild(disciplineCell);
    
    // Teamwork cell with buttons
    const teamworkCell = document.createElement('td');
    const teamworkAddButton = document.createElement('button');
    teamworkAddButton.textContent = '+';
    teamworkAddButton.addEventListener('click', () => addOrSubtractMark('add', 'teamwork', index));
    const teamworkSubtractButton = document.createElement('button');
    teamworkSubtractButton.textContent = '-';
    teamworkSubtractButton.addEventListener('click', () => addOrSubtractMark('subtract', 'teamwork', index));
    teamworkCell.appendChild(teamworkAddButton);
    teamworkCell.appendChild(teamworkSubtractButton);
    teamworkCell.appendChild(document.createTextNode(student.teamwork.marks));
    studentRow.appendChild(teamworkCell);
    
    // Participation cell with buttons
    const participationCell = document.createElement('td');
    const participationAddButton = document.createElement('button');
    participationAddButton.textContent = '+';
    participationAddButton.addEventListener('click', () => addOrSubtractMark('add', 'participation', index));
    const participationSubtractButton = document.createElement('button');
    participationSubtractButton.textContent = '-';
    participationSubtractButton.addEventListener('click', () => addOrSubtractMark('subtract', 'participation', index));
    participationCell.appendChild(participationAddButton);
    participationCell.appendChild(participationSubtractButton);
    participationCell.appendChild(document.createTextNode(student.participation.marks));
    studentRow.appendChild(participationCell);
    
    // Total Points cell
    const totalPointsCell = document.createElement('td');
    totalPointsCell.textContent = student.totalPoints;
    studentRow.appendChild(totalPointsCell);
    
    // Remove button
    const removeCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      removeStudent(index);
    });
    removeCell.appendChild(removeButton);
    studentRow.appendChild(removeCell);
    
    studentsBody.appendChild(studentRow);
  });
}

// Autosave function
function autoSave() {
  // Assuming localStorage is available
  localStorage.setItem('excellence_academy_data', JSON.stringify(students));
}

// Load saved data if available
function loadSavedData() {
  const savedData = localStorage.getItem('excellence_academy_data');
  if (savedData) {
    students = JSON.parse(savedData);
    renderStudents();
  }
}

// Save data before exiting
window.addEventListener('beforeunload', (event) => {
  const confirmationMessage = 'Are you sure you want to exit? Your changes may not be saved.';
  event.returnValue = confirmationMessage;
});

// Initial rendering and autosave
loadSavedData();
setInterval(autoSave, 30000); // Autosave every 30 seconds



