const API = "https://695201a33b3c518fca112cf3.mockapi.io/students";
let editId = null;
let studentsData = [];
let currentPage = 1;
const rowsPerPage = 5;
let sortKey = '';
let sortAsc = true;

const modal = document.getElementById("modal");
const table = document.getElementById("table");
const form = document.getElementById("form");
const formTitle = document.getElementById("formTitle");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("pagination");

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

// Modal functions
function openForm(){ modal.classList.add("show"); formTitle.textContent = editId?"Edit Student":"Add Student"; clearErrors();}
function closeForm(){ modal.classList.remove("show"); form.reset(); editId=null; clearErrors();}
function clearErrors(){ document.querySelectorAll(".error").forEach(e=>e.textContent=""); document.querySelectorAll("input").forEach(e=>e.classList.remove("invalid"));}

// Event listeners
addBtn.addEventListener("click", openForm);
closeBtn.addEventListener("click", closeForm);
searchInput.addEventListener("input", ()=>{ currentPage=1; renderTable(); });

// Load students
async function loadStudents(){
    const res = await fetch(API);
    studentsData = await res.json();
    renderTable();
}

// Render table with search, sort, pagination
function renderTable(){
    let data = [...studentsData];

    // Search
    const query = searchInput.value.toLowerCase();
    if(query) data = data.filter(s=> s.name.toLowerCase().includes(query) || s.department.toLowerCase().includes(query) || s.semester.toLowerCase().includes(query));

    // Sort
    if(sortKey) data.sort((a,b)=>{
        if(a[sortKey] < b[sortKey]) return sortAsc?-1:1;
        if(a[sortKey] > b[sortKey]) return sortAsc?1:-1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(data.length/rowsPerPage);
    const start = (currentPage-1)*rowsPerPage;
    const pageData = data.slice(start, start+rowsPerPage);

pageData.forEach(s => {
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
    // Attach event listeners **after creating the row**
    tr.querySelector(".editBtn").addEventListener("click", () => startEdit(s.id));
    tr.querySelector(".deleteBtn").addEventListener("click", () => removeStudent(s.id));
    table.appendChild(tr);
});
;

    renderPagination(totalPages);
}

// Render pagination buttons
function renderPagination(total){
    pagination.innerHTML="";
    for(let i=1;i<=total;i++){
        const btn=document.createElement("button");
        btn.textContent=i;
        if(i===currentPage) btn.classList.add("active");
        btn.addEventListener("click",()=>{ currentPage=i; renderTable(); });
        pagination.appendChild(btn);
    }
}

// Form submit
form.addEventListener("submit", async e=>{
    e.preventDefault();
    clearErrors();

    const student={
        name:nameInput.value.trim(),
        semester:semesterInput.value.trim(),
        department:departmentInput.value.trim(),
        father:fatherInput.value.trim(),
        fatherMobile:fatherMobileInput.value.trim(),
        mother:motherInput.value.trim(),
        motherMobile:motherMobileInput.value.trim(),
        address:addressInput.value.trim()
    };

    let valid=true;
    if(!student.name){ valid=false; nameInput.classList.add("invalid"); document.getElementById("nameError").textContent="Required"; }
    if(!student.semester){ valid=false; semesterInput.classList.add("invalid"); document.getElementById("semesterError").textContent="Required"; }
    if(!student.department){ valid=false; departmentInput.classList.add("invalid"); document.getElementById("departmentError").textContent="Required"; }
    if(!student.address){ valid=false; addressInput.classList.add("invalid"); document.getElementById("addressError").textContent="Required"; }
    if(!valid) return;

    if(editId){
        await fetch(`${API}/${editId}`, {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(student)});
    } else{
        await fetch(API,{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(student)});
    }

    closeForm();
    await loadStudents();
});

// Start edit
async function startEdit(id){
    const res=await fetch(`${API}/${id}`);
    const s=await res.json();
    editId=s.id;
    nameInput.value=s.name;
    semesterInput.value=s.semester;
    departmentInput.value=s.department;
    fatherInput.value=s.father;
    fatherMobileInput.value=s.fatherMobile;
    motherInput.value=s.mother;
    motherMobileInput.value=s.motherMobile;
    addressInput.value=s.address;
    openForm();
}

// Delete student
async function removeStudent(id){
    if(confirm("Delete this student?")){
        await fetch(`${API}/${id}`, {method:"DELETE"});
        await loadStudents();
    }
}

// Column sort
document.querySelectorAll("th[data-key]").forEach(th=>{
    th.addEventListener("click",()=>{
        const key=th.getAttribute("data-key");
        if(sortKey===key) sortAsc=!sortAsc;
        else { sortKey=key; sortAsc=true; }
        renderTable();
    });
});

// Initial load
loadStudents();
