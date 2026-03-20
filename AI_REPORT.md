# AI REPORT

**Công cụ AI đã sử dụng:** Gemini

---

Chi tiết những phần khó nhất đã dùng AI để hỗ trợ:

### Nâng cấp Custom Hook `useLocalStorage` thành Real-time

- **Vấn đề:** Mặc định, sự kiện `window.addEventListener('storage', ...)` chỉ hoạt động để đồng bộ dữ liệu giữa các Tab trình duyệt khác nhau. Nếu thao tác Thêm/Sửa/Xóa task trong **cùng một tab**, giao diện không tự động cập nhật nếu không gọi hàm set state cục bộ.
- **Giải pháp từ AI:** AI đã gợi ý và hướng dẫn triển khai kỹ thuật **Custom Event**. Mỗi khi `useLocalStorage` ghi dữ liệu mới, nó sẽ `dispatchEvent` một event tùy chỉnh (`local-storage-sync`). Các component khác đang sử dụng hook này sẽ lắng nghe event đó và cập nhật state React ngay lập tức. Điều này giúp LocalStorage hoạt động mượt mà như một Global State Management (tương tự Redux/Zustand) mà không cần cài đặt thêm thư viện.