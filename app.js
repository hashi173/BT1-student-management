/**
 * Student Management System
 * Hệ thống quản lý thông tin sinh viên
 */

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    return str;
}

// ===== Lớp SinhVien (Student Class) =====
class SinhVien {
    constructor(maSV, hoTen, ngaySinh, lopHoc, gpa) {
        this._maSV = maSV;
        this._hoTen = hoTen;
        this._ngaySinh = ngaySinh;
        this._lopHoc = lopHoc;
        this._gpa = gpa;
    }

    // Getters
    get maSV() { return this._maSV; }
    get hoTen() { return this._hoTen; }
    get ngaySinh() { return this._ngaySinh; }
    get lopHoc() { return this._lopHoc; }
    get gpa() { return this._gpa; }

    // Setters với validation
    set maSV(value) {
        if (value && value.trim() !== '') {
            this._maSV = value.trim();
        }
    }

    set hoTen(value) {
        if (value && value.trim() !== '') {
            this._hoTen = value.trim();
        }
    }

    set ngaySinh(value) {
        if (value) {
            this._ngaySinh = value;
        }
    }

    set lopHoc(value) {
        if (value && value.trim() !== '') {
            this._lopHoc = value.trim();
        }
    }

    set gpa(value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 4) {
            this._gpa = numValue;
        }
    }

    // Phương thức cập nhật thông tin
    capNhatThongTin(hoTen, ngaySinh, lopHoc, gpa) {
        if (hoTen) this.hoTen = hoTen;
        if (ngaySinh) this.ngaySinh = ngaySinh;
        if (lopHoc) this.lopHoc = lopHoc;
        if (gpa !== undefined) this.gpa = gpa;
    }

    // Phương thức xếp loại học lực
    xepLoai() {
        if (this._gpa >= 3.6) return { text: 'Xuất sắc', class: 'gpa-excellent' };
        if (this._gpa >= 3.2) return { text: 'Giỏi', class: 'gpa-good' };
        if (this._gpa >= 2.5) return { text: 'Khá', class: 'gpa-average' };
        return { text: 'Trung bình', class: 'gpa-below' };
    }

    // Format ngày sinh
    formatNgaySinh() {
        const date = new Date(this._ngaySinh);
        return date.toLocaleDateString('vi-VN');
    }

    // Chuyển đối tượng thành JSON
    toJSON() {
        return {
            maSV: this._maSV,
            hoTen: this._hoTen,
            ngaySinh: this._ngaySinh,
            lopHoc: this._lopHoc,
            gpa: this._gpa
        };
    }

    // Tạo đối tượng từ JSON
    static fromJSON(json) {
        return new SinhVien(json.maSV, json.hoTen, json.ngaySinh, json.lopHoc, json.gpa);
    }
}

// ===== Lớp QuanLySinhVien (Student Manager Class) =====
class QuanLySinhVien {
    constructor() {
        this.danhSach = [];
        this.loadFromStorage();
    }

    // Thêm sinh viên
    themSinhVien(sinhVien) {
        if (this.timTheoMa(sinhVien.maSV)) {
            return { success: false, message: 'Mã sinh viên đã tồn tại!' };
        }
        this.danhSach.push(sinhVien);
        this.saveToStorage();
        return { success: true, message: 'Thêm sinh viên thành công!' };
    }

    // Xóa sinh viên
    xoaSinhVien(maSV) {
        const index = this.danhSach.findIndex(sv => sv.maSV === maSV);
        if (index !== -1) {
            this.danhSach.splice(index, 1);
            this.saveToStorage();
            return { success: true, message: 'Xóa sinh viên thành công!' };
        }
        return { success: false, message: 'Không tìm thấy sinh viên!' };
    }

    // Cập nhật sinh viên
    capNhatSinhVien(maSV, hoTen, ngaySinh, lopHoc, gpa) {
        const sinhVien = this.timTheoMa(maSV);
        if (sinhVien) {
            sinhVien.capNhatThongTin(hoTen, ngaySinh, lopHoc, gpa);
            this.saveToStorage();
            return { success: true, message: 'Cập nhật thành công!' };
        }
        return { success: false, message: 'Không tìm thấy sinh viên!' };
    }

    // Tìm sinh viên theo mã
    timTheoMa(maSV) {
        return this.danhSach.find(sv => sv.maSV === maSV);
    }

    // Tìm kiếm sinh viên (hỗ trợ tìm không dấu)
    timKiem(keyword) {
        const normalizedKeyword = removeVietnameseTones(keyword);
        return this.danhSach.filter(sv =>
            removeVietnameseTones(sv.maSV).includes(normalizedKeyword) ||
            removeVietnameseTones(sv.hoTen).includes(normalizedKeyword) ||
            removeVietnameseTones(sv.lopHoc).includes(normalizedKeyword)
        );
    }

    // Lọc theo GPA
    locTheoGPA(filter) {
        switch (filter) {
            case 'excellent':
                return this.danhSach.filter(sv => sv.gpa >= 3.6);
            case 'good':
                return this.danhSach.filter(sv => sv.gpa >= 3.2 && sv.gpa < 3.6);
            case 'average':
                return this.danhSach.filter(sv => sv.gpa >= 2.5 && sv.gpa < 3.2);
            case 'below':
                return this.danhSach.filter(sv => sv.gpa < 2.5);
            default:
                return this.danhSach;
        }
    }

    // Tính GPA trung bình
    tinhGPATrungBinh() {
        if (this.danhSach.length === 0) return 0;
        const sum = this.danhSach.reduce((acc, sv) => acc + sv.gpa, 0);
        return (sum / this.danhSach.length).toFixed(2);
    }

    // Đếm sinh viên xuất sắc
    demXuatSac() {
        return this.danhSach.filter(sv => sv.gpa >= 3.6).length;
    }

    // Lưu vào localStorage
    saveToStorage() {
        const data = this.danhSach.map(sv => sv.toJSON());
        localStorage.setItem('danhSachSinhVien', JSON.stringify(data));
    }

    // Load từ localStorage
    loadFromStorage() {
        const data = localStorage.getItem('danhSachSinhVien');
        if (data) {
            const parsed = JSON.parse(data);
            this.danhSach = parsed.map(item => SinhVien.fromJSON(item));
        }
    }
}

// ===== Khởi tạo và quản lý UI =====
const quanLy = new QuanLySinhVien();
let editingMaSV = null;
let deleteTargetMaSV = null;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const fullNameInput = document.getElementById('fullName');
const birthDateInput = document.getElementById('birthDate');
const classNameInput = document.getElementById('className');
const gpaInput = document.getElementById('gpa');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentTableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterGpa = document.getElementById('filterGpa');
const deleteModal = document.getElementById('deleteModal');
const deleteStudentName = document.getElementById('deleteStudentName');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const toast = document.getElementById('toast');

// Stats Elements
const totalStudentsEl = document.getElementById('totalStudents');
const avgGpaEl = document.getElementById('avgGpa');
const excellentCountEl = document.getElementById('excellentCount');

// ===== Event Listeners =====

// Submit form
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const maSV = studentIdInput.value.trim();
    const hoTen = fullNameInput.value.trim();
    const ngaySinh = birthDateInput.value;
    const lopHoc = classNameInput.value.trim();
    const gpa = parseFloat(gpaInput.value);

    if (editingMaSV) {
        const result = quanLy.capNhatSinhVien(editingMaSV, hoTen, ngaySinh, lopHoc, gpa);
        showToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            resetForm();
            renderTable();
            updateStats();
        }
    } else {
        const sinhVien = new SinhVien(maSV, hoTen, ngaySinh, lopHoc, gpa);
        const result = quanLy.themSinhVien(sinhVien);
        showToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            resetForm();
            renderTable();
            updateStats();
        }
    }
});

// Cancel edit
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Search
searchInput.addEventListener('input', (e) => {
    renderTable(e.target.value, filterGpa.value);
});

// Filter
filterGpa.addEventListener('change', (e) => {
    renderTable(searchInput.value, e.target.value);
});

// Confirm delete
confirmDeleteBtn.addEventListener('click', () => {
    if (deleteTargetMaSV) {
        const result = quanLy.xoaSinhVien(deleteTargetMaSV);
        showToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            renderTable();
            updateStats();
        }
        hideDeleteModal();
    }
});

// Cancel delete
cancelDeleteBtn.addEventListener('click', hideDeleteModal);

// Close modal on overlay click
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        hideDeleteModal();
    }
});

// ===== Functions =====

// Render table
function renderTable(searchKeyword = '', gpaFilter = 'all') {
    let data = quanLy.danhSach;

    if (searchKeyword) {
        data = quanLy.timKiem(searchKeyword);
    }

    if (gpaFilter !== 'all') {
        data = data.filter(sv => {
            switch (gpaFilter) {
                case 'excellent': return sv.gpa >= 3.6;
                case 'good': return sv.gpa >= 3.2 && sv.gpa < 3.6;
                case 'average': return sv.gpa >= 2.5 && sv.gpa < 3.2;
                case 'below': return sv.gpa < 2.5;
                default: return true;
            }
        });
    }

    studentTableBody.innerHTML = '';

    if (data.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    data.forEach((sv, index) => {
        const xepLoai = sv.xepLoai();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${sv.maSV}</strong></td>
            <td>${sv.hoTen}</td>
            <td>${sv.formatNgaySinh()}</td>
            <td>${sv.lopHoc}</td>
            <td><strong>${sv.gpa.toFixed(2)}</strong></td>
            <td><span class="gpa-badge ${xepLoai.class}">${xepLoai.text}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="editStudent('${sv.maSV}')">Sửa</button>
                    <button class="action-btn delete-btn" onclick="showDeleteModal('${sv.maSV}', '${sv.hoTen}')">Xóa</button>
                </div>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}

// Update statistics
function updateStats() {
    totalStudentsEl.textContent = quanLy.danhSach.length;
    avgGpaEl.textContent = quanLy.tinhGPATrungBinh();
    excellentCountEl.textContent = quanLy.demXuatSac();
}

// Edit student
function editStudent(maSV) {
    const sv = quanLy.timTheoMa(maSV);
    if (sv) {
        editingMaSV = maSV;
        studentIdInput.value = sv.maSV;
        studentIdInput.disabled = true;
        fullNameInput.value = sv.hoTen;
        birthDateInput.value = sv.ngaySinh;
        classNameInput.value = sv.lopHoc;
        gpaInput.value = sv.gpa;

        submitBtn.textContent = 'Cập Nhật';
        cancelBtn.style.display = 'inline-block';

        studentForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Reset form
function resetForm() {
    editingMaSV = null;
    studentForm.reset();
    studentIdInput.disabled = false;
    submitBtn.textContent = 'Thêm Sinh Viên';
    cancelBtn.style.display = 'none';
}

// Show delete modal
function showDeleteModal(maSV, hoTen) {
    deleteTargetMaSV = maSV;
    deleteStudentName.textContent = hoTen;
    deleteModal.classList.add('show');
}

// Hide delete modal
function hideDeleteModal() {
    deleteTargetMaSV = null;
    deleteModal.classList.remove('show');
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.className = `toast ${type}`;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    updateStats();
});
