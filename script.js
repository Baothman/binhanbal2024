// إضافة وظائف تسجيل الدخول
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // يمكنك تغيير اسم المستخدم وكلمة المرور هنا
    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// إغلاق النافذة المنبثقة عند النقر خارجها
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
}

// قائمة المعلمين
let teachers = [];

// استرجاع البيانات المحفوظة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    createTables();
    if (teachers.length > 0) {
        distributeTeachers(false); // توزيع المعلمين بدون رسالة تأكيد
    }
    hideSplashScreen(); // التحكم في شاشة البداية
});

// حفظ البيانات في localStorage
function saveData() {
    localStorage.setItem('teachersList', JSON.stringify(teachers));
    const teacherCells = document.querySelectorAll('.teacher-cell');
    const distribution = Array.from(teacherCells).map(cell => cell.textContent);
    localStorage.setItem('teachersDistribution', JSON.stringify(distribution));
}

// استرجاع البيانات من localStorage
function loadSavedData() {
    const savedTeachers = localStorage.getItem('teachersList');
    if (savedTeachers) {
        teachers = JSON.parse(savedTeachers);
    }
}

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

// دالة للتحقق من تطابق التواريخ (بدون مقارنة الوقت)
function isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// دالة للتحقق ما إذا كان التاريخ يقع في نفس الأسبوع
function isInSameWeek(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // تعيين التواريخ إلى بداية الأسبوع (الأحد)
    d1.setDate(d1.getDate() - d1.getDay());
    d2.setDate(d2.getDate() - d2.getDay());
    
    return isSameDate(d1, d2);
}

// إنشاء 12 جدول
function createTables() {
    const container = document.getElementById('tables-container');
    container.innerHTML = '';
    
    // تاريخ البداية: 17-11-2024
    let currentDate = new Date(2024, 10, 17);
    const today = new Date();
    
    for (let week = 1; week <= 12; week++) {
        const table = document.createElement('table');
        table.className = 'week-table';
        
        // إنشاء عنوان الأسبوع
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
        
        // إنشاء رؤوس الأعمدة
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>اليوم</th>
            <th>التاريخ</th>
            <th>اسم المعلم</th>
        `;
        table.appendChild(headerRow);
        
        // إضافة 5 صفوف لكل أسبوع
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
        days.forEach((day, index) => {
            const row = document.createElement('tr');
            const dateStr = formatDate(currentDate);
            
            if (isSameDate(currentDate, today)) {
                row.classList.add('current-day');
            }
            
            row.innerHTML = `
                <td>${day}</td>
                <td>${dateStr}</td>
                <td class="teacher-cell"></td>
            `;
            table.appendChild(row);
            currentDate = addDays(currentDate, 1);
        });
        
        currentDate = addDays(currentDate, 2);
        container.appendChild(table);
    }

    // استرجاع التوزيع المحفوظ
    const savedDistribution = localStorage.getItem('teachersDistribution');
    if (savedDistribution) {
        const distribution = JSON.parse(savedDistribution);
        const cells = document.querySelectorAll('.teacher-cell');
        cells.forEach((cell, index) => {
            if (distribution[index]) {
                cell.textContent = distribution[index];
            }
        });
    }
}

// تحويل الأرقام إلى العربية
function getArabicNumber(num) {
    const arabicNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().split('').map(digit => arabicNumbers[digit]).join('');
}

// دالة تحديد وتمرير إلى اليوم الحالي
function highlightCurrentDayAndWeek() {
    const today = new Date();
    let foundRow = null;

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
                        row.classList.add('current-day');
                        foundRow = row;
                    }
                }
            }
        });
    });

    // إذا وجدنا الصف المطابق، نقوم بالتمرير
    if (foundRow) {
        // ننتظر حتى يتم تحميل الصفحة بالكامل
        setTimeout(() => {
            // التمرير إلى أعلى أولاً
            window.scrollTo(0, 0);
            
            // ثم ننتظر قليلاً قبل التمرير إلى الصف
            setTimeout(() => {
                const yOffset = foundRow.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: yOffset - (window.innerHeight / 2),
                    behavior: 'smooth'
                });
            }, 500);
        }, 1000);
    }
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', createTables);

// التحكم في الوضع الليلي/النهاري
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    // تطبيق الوضع المحفوظ
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // تحديث أيقونة الزر حسب الوضع الحالي
    updateThemeIcon();

    // إضافة مستمع الحدث للزر
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        updateThemeIcon();
        
        // حفظ الوضع في localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}

// تحديث أيقونة الوضع
function updateThemeIcon() {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// تشغيل بعد تحميل كل شيء
window.onload = function() {
    createTables();
    loadSavedData();
    highlightCurrentDayAndWeek();
    initThemeToggle(); // إضافة تهيئة الوضع الليلي
};

// فتح نافذة إضافة معلم
function openAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'block';
}

// إغلاق نافذة إضافة معلم
function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'none';
    document.getElementById('teacherName').value = '';
}

// إضافة معلم جديد
function addTeacher() {
    const teacherName = document.getElementById('teacherName').value.trim();
    if (teacherName) {
        teachers.push(teacherName);
        saveData(); // حفظ البيانات بعد إضافة معلم
        closeAddTeacherModal();
        alert('تم إضافة المعلم بنجاح: ' + teacherName);
    } else {
        alert('الرجاء إدخال اسم المعلم');
    }
}

// توزيع المعلمين على الجداول
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
        teacherIndex = (teacherIndex + 1) % teachers.length;
    });
    
    saveData(); // حفظ البيانات بعد التوزيع
    
    if (showAlert) {
        alert('تم توزيع المعلمين بنجاح');
    }
}

// إغلاق النافذة المنبثقة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById('addTeacherModal');
    const loginModal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeAddTeacherModal();
    } else if (event.target === loginModal) {
        closeLoginModal();
    }
}

// التحكم في شاشة البداية
function hideSplashScreen() {
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.remove();
            }, 800); // زيادة مدة تلاشي الشاشة
        }, 4000); // زيادة مدة العرض إلى 4 ثواني
    }
}
