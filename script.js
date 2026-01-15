const API = "https://695201a33b3c518fca112cf3.mockapi.io/students";
let editId = null;

// Elements
const modal = document.getElementById("modal");
const table = document.getElementById("table");
const form = document.getElementById("form");
const formTitle = document.getElementById("formTitle");

const nameInput = document.getElementById("name");
const semesterInput = document.getElementById("semester");
const departmentInput = document.getElementById("department");
const fatherInput = document.getElementById("father");
const fatherMobileInput = document.getElementById("fatherMobile");
const motherInput = document.getElementById("mother");
const motherMobileInput = document.getElementById("motherMobile");
const addressInput = document.getElementById("address");

const addBtn = document.getElementById("addBtn");
const closeBtn = document.getElementById("closeBtn");

// ---------- Modal Functions ----------
function openForm() {
    modal.classList.add("show");
    formTitle.textContent = editId ? "Edit Student" : "Add Student";
    clearErrors();
}
function closeForm() {
    modal.classList.remove("show");
    form.reset();
    editId = null;
    clearErrors();
}
function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
    document.querySelectorAll("input").forEach(e => e.classList.remove("invalid"));
}

// ---------- Event Listeners ----------
addBtn.addEventListener("click", openForm);
closeBtn.addEventListener("click", closeForm);

// ---------- Load Students ----------
async function loadStudents() {
    const res = await fetch(API);
    const students = await res.json();
    table.innerHTML = "";

    students.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.semester}</td>
            <td>${s.department}</td>
            <td>${s.father}</td>
            <td>${s.fatherMobile}</td>
            <td>${s.mother}</td>
            <td>${s.motherMobile}</td>
            <td>${s.address}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;
        tr.querySelector(".editBtn").addEventListener("click", () => startEdit(s.id));
        tr.querySelector(".deleteBtn").addEventListener("click", () => removeStudent(s.id));
        table.appendChild(tr);
    });
}

// ---------- Form Submit ----------
form.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors();

    const student = {
        name: nameInput.value.trim(),
        semester: semesterInput.value.trim(),
        department: departmentInput.value.trim(),
        father: fatherInput.value.trim(),
        fatherMobile: fatherMobileInput.value.trim(),
        mother: motherInput.value.trim(),
        motherMobile: motherMobileInput.value.trim(),
        address: addressInput.value.trim()
    };

    // Validation
    let valid = true;
    if (!student.name) { valid = false; nameInput.classList.add("invalid"); document.getElementById("nameError").textContent = "Required"; }
    if (!student.semester) { valid = false; semesterInput.classList.add("invalid"); document.getElementById("semesterError").textContent = "Required"; }
    if (!student.department) { valid = false; departmentInput.classList.add("invalid"); document.getElementById("departmentError").textContent = "Required"; }
    if (!student.address) { valid = false; addressInput.classList.add("invalid"); document.getElementById("addressError").textContent = "Required"; }
    if (!valid) return;

    if (editId) {
        await fetch(`${API}/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(student) });
    } else {
        await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(student) });
    }

    closeForm();
    loadStudents();
});

// ---------- Start Edit ----------
async function startEdit(id) {
    const res = await fetch(`${API}/${id}`);
    const s = await res.json();
    editId = s.id;

    nameInput.value = s.name;
    semesterInput.value = s.semester;
    departmentInput.value = s.department;
    fatherInput.value = s.father;
    fatherMobileInput.value = s.fatherMobile;
    motherInput.value = s.mother;
    motherMobileInput.value = s.motherMobile;
    addressInput.value = s.address;

    openForm();
}

// ---------- Remove Student ----------
async function removeStudent(id) {
    if (confirm("Delete this student?")) {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        loadStudents();
    }
}

// ---------- Initial Load ----------
loadStudents();
