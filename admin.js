// التحقق من تسجيل الدخول
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// قائمة المعلمين
let teachers = [];

// استدعاء الدوال الأساسية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    createTables();
    if (teachers.length > 0) {
        distributeTeachers(false);
    }
    highlightCurrentDayAndWeek();
});

// دالة لتنسيق التاريخ
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// دالة لإضافة أيام إلى تاريخ
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// دالة للتحقق من تطابق التواريخ
function isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// دالة للتحقق من نفس الأسبوع
function isInSameWeek(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setDate(d1.getDate() - d1.getDay());
    d2.setDate(d2.getDate() - d2.getDay());
    return isSameDate(d1, d2);
}

// إنشاء الجداول
function createTables() {
    const container = document.getElementById('tables-container');
    container.innerHTML = '';
    
    let currentDate = new Date(2024, 10, 17);
    const today = new Date();
    
    for (let week = 1; week <= 12; week++) {
        const table = document.createElement('table');
        table.className = 'week-table';
        
        const weekHeader = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.colSpan = 3;
        headerCell.className = 'week-header';
        headerCell.textContent = `الأسبوع ${getArabicNumber(week)}`;
        
        if (isInSameWeek(currentDate, today)) {
            headerCell.classList.add('current-week');
        }
        
        weekHeader.appendChild(headerCell);
        table.appendChild(weekHeader);
        
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>اليوم</th>
            <th>التاريخ</th>
            <th>اسم المعلم</th>
        `;
        table.appendChild(headerRow);
        
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
        days.forEach(day => {
            const row = document.createElement('tr');
            const dateStr = formatDate(currentDate);
            
            if (isSameDate(currentDate, today)) {
                row.classList.add('current-day');
            }
            
            row.innerHTML = `
                <td>${day}</td>
                <td>${dateStr}</td>
                <td class="teacher-cell" data-teacher=""></td>
            `;
            table.appendChild(row);
            currentDate = addDays(currentDate, 1);
        });
        
        currentDate = addDays(currentDate, 2);
        container.appendChild(table);
    }
}

// تحويل الأرقام إلى العربية
function getArabicNumber(num) {
    const arabicNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().split('').map(digit => arabicNumbers[digit]).join('');
}

// دوال إدارة المعلمين
function openAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'block';
}

function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'none';
    document.getElementById('teacherName').value = '';
}

function addTeacher() {
    const teacherName = document.getElementById('teacherName').value.trim();
    if (teacherName) {
        teachers.push(teacherName);
        saveData();
        closeAddTeacherModal();
        alert('تم إضافة المعلم بنجاح: ' + teacherName);
    } else {
        alert('الرجاء إدخال اسم المعلم');
    }
}

function openManageTeachersModal() {
    const modal = document.getElementById('manageTeachersModal');
    const teachersList = document.getElementById('teachersList');
    teachersList.innerHTML = `
        <table class="teachers-table">
            <thead>
                <tr>
                    <th>اسم المعلم</th>
                    <th>تعديل</th>
                    <th>حذف</th>
                </tr>
            </thead>
            <tbody>
                ${teachers.map((teacher, index) => `
                    <tr>
                        <td>${teacher}</td>
                        <td><button class="edit-btn" onclick="editTeacher(${index})">تعديل</button></td>
                        <td><button class="delete-btn" onclick="deleteTeacher(${index})">حذف</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    modal.style.display = 'block';
}

function closeManageTeachersModal() {
    document.getElementById('manageTeachersModal').style.display = 'none';
}

function editTeacher(index) {
    const newName = prompt('أدخل الاسم الجديد:', teachers[index]);
    if (newName && newName.trim() !== '') {
        teachers[index] = newName.trim();
        saveData();
        distributeTeachers(false);
        openManageTeachersModal();
    }
}

function deleteTeacher(index) {
    if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
        teachers.splice(index, 1);
        saveData();
        distributeTeachers(false);
        openManageTeachersModal();
    }
}

// دوال استيراد المعلمين
function openImportModal() {
    document.getElementById('importModal').style.display = 'block';
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('txtFileInput').value = '';
    document.getElementById('excelFileInput').value = '';
}

function importFromTxt(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const newTeachers = text.split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0);
            
            if (newTeachers.length > 0) {
                const message = `سيتم إضافة ${newTeachers.length} معلم. هل تريد المتابعة؟`;
                if (confirm(message)) {
                    teachers.push(...newTeachers);
                    saveData();
                    alert('تم استيراد المعلمين بنجاح');
                    closeImportModal();
                }
            } else {
                alert('لم يتم العثور على أسماء معلمين في الملف');
            }
        };
        reader.readAsText(file);
    }
}

function importFromExcel(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            // استخراج الأسماء من العمود الأول (تجاهل الصف الأول إذا كان عنواناً)
            const newTeachers = jsonData
                .slice(1) // تجاهل الصف الأول إذا كان عنواناً
                .map(row => row[0]) // أخذ القيمة من العمود الأول
                .filter(name => name && typeof name === 'string' && name.trim().length > 0);
            
            if (newTeachers.length > 0) {
                const message = `سيتم إضافة ${newTeachers.length} معلم. هل تريد المتابعة؟`;
                if (confirm(message)) {
                    teachers.push(...newTeachers);
                    saveData();
                    alert('تم استيراد المعلمين بنجاح');
                    closeImportModal();
                }
            } else {
                alert('لم يتم العثور على أسماء معلمين في الملف');
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

// دوال نافذة الإحصائيات
function openStatsModal() {
    const statsModal = document.getElementById('statsModal');
    statsModal.style.display = 'block';
    updateTeacherStats();
}

function closeStatsModal() {
    const statsModal = document.getElementById('statsModal');
    statsModal.style.display = 'none';
}

function updateTeacherStats() {
    // الحصول على قائمة المعلمين من التخزين المحلي
    const teachers = JSON.parse(localStorage.getItem('teachersList')) || [];
    
    // الحصول على بيانات الجداول
    const tables = document.querySelectorAll('.week-table');
    const teacherCounts = {};

    // تهيئة العداد لكل معلم
    teachers.forEach(teacher => {
        teacherCounts[teacher] = 0;
    });

    // حساب عدد مرات ظهور كل معلم في جميع الجداول
    tables.forEach(table => {
        const cells = table.querySelectorAll('td[data-teacher]');
        cells.forEach(cell => {
            const teacher = cell.getAttribute('data-teacher');
            if (teacher && teacher !== '') {
                teacherCounts[teacher] = (teacherCounts[teacher] || 0) + 1;
            }
        });
    });

    // ترتيب المعلمين حسب عدد مرات التكليف (تنازلياً)
    const sortedTeachers = Object.entries(teacherCounts)
        .sort((a, b) => b[1] - a[1]);

    // تحديث الجدول
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';
    
    sortedTeachers.forEach((teacher, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${teacher[0]}</td>
            <td>${teacher[1]}</td>
        `;
        tbody.appendChild(row);
    });

    // إضافة المعلمين الذين لم يتم تكليفهم بعد
    teachers.forEach(teacher => {
        if (!teacherCounts[teacher]) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td>
                <td>${teacher}</td>
                <td>0</td>
            `;
            tbody.appendChild(row);
        }
    });

    // طباعة البيانات في وحدة التحكم للتحقق
    console.log('Teachers:', teachers);
    console.log('Teacher Counts:', teacherCounts);
    console.log('Sorted Teachers:', sortedTeachers);
}

// دوال الطباعة والتصدير
function printSchedule() {
    const printWindow = window.open('', '_blank');
    const content = document.querySelector('.container').cloneNode(true);
    
    // إزالة الأزرار من نسخة الطباعة
    const buttons = content.querySelectorAll('button, .admin-button, .modal');
    buttons.forEach(button => button.remove());
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <title>طباعة جدول المعلمين</title>
            <link rel="stylesheet" href="style.css">
            <style>
                @media print {
                    .admin-button, .buttons, .modal {
                        display: none !important;
                    }
                    body {
                        padding: 20px;
                    }
                    table {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            ${content.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

function exportToPDF() {
    const element = document.querySelector('.container').cloneNode(true);
    
    // إزالة الأزرار من نسخة PDF
    const buttons = element.querySelectorAll('button, .admin-button, .modal');
    buttons.forEach(button => button.remove());
    
    const opt = {
        margin: 1,
        filename: 'جدول_المعلمين.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
}

// حفظ واسترجاع البيانات
function loadSavedData() {
    const savedTeachers = localStorage.getItem('teachersList');
    if (savedTeachers) {
        teachers = JSON.parse(savedTeachers);
    }
}

function saveData() {
    localStorage.setItem('teachersList', JSON.stringify(teachers));
    const teacherCells = document.querySelectorAll('.teacher-cell');
    const distribution = Array.from(teacherCells).map(cell => cell.textContent);
    localStorage.setItem('teachersDistribution', JSON.stringify(distribution));
}

// توزيع المعلمين
function distributeTeachers(showAlert = true) {
    if (teachers.length === 0) {
        if (showAlert) {
            alert('الرجاء إضافة معلمين أولاً');
        }
        return;
    }

    const teacherCells = document.querySelectorAll('.teacher-cell');
    let teacherIndex = 0;

    teacherCells.forEach(cell => {
        cell.textContent = teachers[teacherIndex];
        cell.setAttribute('data-teacher', teachers[teacherIndex]);
        teacherIndex = (teacherIndex + 1) % teachers.length;
    });
    
    saveData();
    
    if (showAlert) {
        alert('تم توزيع المعلمين بنجاح');
    }
}

// دالة التمرير إلى العنصر
function scrollToElement(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// دالة تحديد وتمرير إلى اليوم والأسبوع الحالي
function highlightCurrentDayAndWeek() {
    const today = new Date();
    const tables = document.querySelectorAll('.week-table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const dateCell = row.querySelector('td:nth-child(2)');
            if (dateCell) {
                const dateParts = dateCell.textContent.split('/');
                if (dateParts.length === 3) {
                    const cellDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                    if (cellDate.getDate() === today.getDate() && 
                        cellDate.getMonth() === today.getMonth() && 
                        cellDate.getFullYear() === today.getFullYear()) {
                        
                        // تحديد الأسبوع الحالي
                        table.classList.add('current-week');
                        // تحديد اليوم الحالي
                        row.classList.add('current-day');
                        // التمرير إلى اليوم الحالي
                        setTimeout(() => scrollToElement(row), 500);
                    }
                }
            }
        });
    });
}

// إغلاق النوافذ المنبثقة عند النقر خارجها
window.onclick = function(event) {
    const modals = [
        document.getElementById('addTeacherModal'),
        document.getElementById('manageTeachersModal'),
        document.getElementById('importModal'),
        document.getElementById('statsModal')
    ];
    
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
