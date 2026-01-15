const API = "https://695201a33b3c518fca112cf3.mockapi.io/students";
let editId = null;

const modal = document.getElementById("modal");
const table = document.getElementById("table");
const form = document.getElementById("form");

function openForm() { modal.style.display = "block"; clearErrors(); }
function closeForm() { modal.style.display = "none"; form.reset(); editId = null; clearErrors(); }

function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
    document.querySelectorAll("input, select").forEach(e => e.classList.remove("invalid"));
}

async function loadStudents() {
    const res = await fetch(API);
    const students = await res.json();
    table.innerHTML = "";

    students.forEach(s => {
        table.innerHTML += `
        <tr>
            <td>${s.name}</td>
            <td>${s.semester}</td>
            <td>${s.department}</td>
            <td>${s.father}</td>
            <td>${s.fatherMobile}</td>
            <td>${s.mother}</td>
            <td>${s.motherMobile}</td>
            <td>${s.address}</td>
            <td>
                <button onclick="startEdit('${s.id}')">Edit</button>
                <button class="delete" onclick="removeStudent('${s.id}')">Delete</button>
            </td>
        </tr>`;
    });
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors();

    const student = {
        name: name.value.trim(),
        semester: semester.value,
        department: department.value,
        father: father.value.trim(),
        fatherMobile: fatherMobile.value.trim(),
        mother: mother.value.trim(),
        motherMobile: motherMobile.value.trim(),
        address: address.value.trim()
    };

    if (!student.name || !student.semester || !student.department || !student.address) return;

    if (editId) {
        await fetch(`${API}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });
    } else {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });
    }

    closeForm();
    loadStudents();
});

async function startEdit(id) {
    const res = await fetch(`${API}/${id}`);
    const s = await res.json();
    editId = s.id;

    name.value = s.name;
    semester.value = s.semester;
    department.value = s.department;
    father.value = s.father;
    fatherMobile.value = s.fatherMobile;
    mother.value = s.mother;
    motherMobile.value = s.motherMobile;
    address.value = s.address;

    openForm();
}

async function removeStudent(id) {
    if (confirm("Delete this student?")) {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        loadStudents();
    }
}

loadStudents();
