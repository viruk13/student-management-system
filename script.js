const API = "https://695201a33b3c518fca112cf3.mockapi.io/students";
let editId=null, studentsData=[], currentPage=1, rowsPerPage=5, sortKey='', sortAsc=true;

const modal=document.getElementById("modal");
const profileModal=document.getElementById("profileModal");
const table=document.getElementById("table");
const form=document.getElementById("form");
const formTitle=document.getElementById("formTitle");
const searchInput=document.getElementById("searchInput");
const pagination=document.getElementById("pagination");
const toast=document.getElementById("toast");

const nameInput=document.getElementById("name");
const semesterInput=document.getElementById("semester");
const departmentInput=document.getElementById("department");
const fatherInput=document.getElementById("father");
const fatherMobileInput=document.getElementById("fatherMobile");
const motherInput=document.getElementById("mother");
const motherMobileInput=document.getElementById("motherMobile");
const addressInput=document.getElementById("address");

const addBtn=document.getElementById("addBtn");
const closeBtn=document.getElementById("closeBtn");
const closeProfileBtn=document.getElementById("closeProfileBtn");
const profileContent=document.getElementById("profileContent");

// --- Modal functions ---
function openForm(){ modal.classList.add("show"); formTitle.textContent=editId?"Edit Student":"Add Student"; clearErrors();}
function closeForm(){ modal.classList.remove("show"); form.reset(); editId=null; clearErrors();}
function clearErrors(){ document.querySelectorAll(".error").forEach(e=>e.textContent=""); document.querySelectorAll("input,select").forEach(e=>e.classList.remove("invalid"));}
function showToast(msg){ toast.textContent=msg; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),2500); }

// --- Event listeners ---
addBtn.addEventListener("click",openForm);
closeBtn.addEventListener("click",closeForm);
closeProfileBtn.addEventListener("click",()=>profileModal.classList.remove("show"));
searchInput.addEventListener("input",()=>{currentPage=1; renderTable();});

// --- Load students ---
async function loadStudents(){ const res=await fetch(API); studentsData=await res.json(); renderTable(); }

// --- Render table ---
function renderTable(){
    let data=[...studentsData];
    const query=searchInput.value.toLowerCase();
    if(query) data=data.filter(s=>s.name.toLowerCase().includes(query)||s.department.toLowerCase().includes(query)||s.semester.toLowerCase().includes(query));
    if(sortKey) data.sort((a,b)=>{if(a[sortKey]<b[sortKey]) return sortAsc?-1:1;if(a[sortKey]>b[sortKey]) return sortAsc?1:-1;return 0;});
    
    const totalPages=Math.ceil(data.length/rowsPerPage);
    const start=(currentPage-1)*rowsPerPage;
    const pageData=data.slice(start,start+rowsPerPage);

    table.innerHTML="";
    pageData.forEach(s=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`
            <td class="name-cell">${s.name}</td>
            <td><span class="badge semester-${s.semester}">${s.semester}</span></td>
            <td><span class="badge department-${s.department}">${s.department}</span></td>
            <td>${s.father}</td>
            <td>${s.fatherMobile}</td>
            <td>${s.mother}</td>
            <td>${s.motherMobile}</td>
            <td>${s.address}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
                <button class="viewBtn">View</button>
            </td>
        `;
        tr.querySelector(".editBtn").addEventListener("click",()=>startEdit(s.id));
        tr.querySelector(".deleteBtn").addEventListener("click",()=>removeStudent(s.id));
        tr.querySelector(".viewBtn").addEventListener("click",()=>viewProfile(s));
        table.appendChild(tr);
    });

    renderPagination(totalPages);
}

// --- Pagination ---
function renderPagination(total){ pagination.innerHTML=""; for(let i=1;i<=total;i++){ const btn=document.createElement("button"); btn.textContent=i; if(i===currentPage) btn.classList.add("active"); btn.addEventListener("click",()=>{currentPage=i; renderTable();}); pagination.appendChild(btn); } }

// --- Form submit ---
form.addEventListener("submit", async e=>{
    e.preventDefault(); clearErrors();
    const student={ name:nameInput.value.trim(), semester:semesterInput.value, department:departmentInput.value, father:fatherInput.value.trim(), fatherMobile:fatherMobileInput.value.trim(), mother:motherInput.value.trim(), motherMobile:motherMobileInput.value.trim(), address:addressInput.value.trim() };
    let valid=true;
    if(!student.name){ valid=false; nameInput.classList.add("invalid"); document.getElementById("nameError").textContent="Required"; }
    if(!student.semester){ valid=false; semesterInput.classList.add("invalid"); document.getElementById("semesterError").textContent="Required"; }
    if(!student.department){ valid=false; departmentInput.classList.add("invalid"); document.getElementById("departmentError").textContent="Required"; }
    if(!student.address){ valid=false; addressInput.classList.add("invalid"); document.getElementById("addressError").textContent="Required"; }
    if(!valid) return;

    if(editId){
        await fetch(`${API}/${editId}`, {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(student)});
        showToast("Student updated successfully!");
    } else{
        await fetch(API, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(student)});
        showToast("Student added successfully!");
    }

    closeForm(); await loadStudents();
});

// --- Edit student ---
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

// --- Delete student ---
async function removeStudent(id){
    if(confirm("Delete this student?")){
        await fetch(`${API}/${id}`,{method:"DELETE"});
        showToast("Student deleted successfully!");
        await loadStudents();
    }
}

// --- Profile modal ---
function viewProfile(s){
    profileContent.innerHTML=`
        <p><strong>Name:</strong> ${s.name}</p>
        <p><strong>Semester:</strong> ${s.semester}</p>
        <p><strong>Department:</strong> ${s.department}</p>
        <p><strong>Father:</strong> ${s.father} (${s.fatherMobile})</p>
        <p><strong>Mother:</strong> ${s.mother} (${s.motherMobile})</p>
        <p><strong>Address:</strong> ${s.address}</p>
    `;
    profileModal.classList.add("show");
}

// --- Column sort ---
document.querySelectorAll("th[data-key]").forEach(th=>{
    th.addEventListener("click",()=>{
        const key=th.getAttribute("data-key");
        if(sortKey===key) sortAsc=!sortAsc; else { sortKey=key; sortAsc=true; }
        renderTable();
    });
});

// --- Initial load ---
loadStudents();
