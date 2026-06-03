# 💬 Realtime Chat Application — Frontend

<p align="center">
  <a href="https://react.dev" target="_blank"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://vite.dev" target="_blank"><img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://www.typescriptlang.org" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://tanstack.com/query" target="_blank"><img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat&logo=reactquery&logoColor=white" alt="React Query" /></a>
  <a href="https://socket.io" target="_blank"><img src="https://img.shields.io/badge/Socket.IO-Client_v4.8-010101?style=flat&logo=socket.io&logoColor=white" alt="Socket.IO" /></a>
  <a href="https://zustand-demo.pmnd.rs" target="_blank"><img src="https://img.shields.io/badge/Zustand-v5-443E38?style=flat&logo=zustand&logoColor=white" alt="Zustand" /></a>
</p>

Ứng dụng nhắn tin thời gian thực (Realtime Chat Web Application) được xây dựng trên nền tảng **React 19**, **TypeScript**, **Tailwind CSS v4** và tuân thủ chặt chẽ nguyên lý thiết kế **Meta Design System** (`DESIGN.md`). Tích hợp giao tiếp thời gian thực hai chiều với hệ thống backend NestJS qua **Socket.IO** và RESTful API.

---

## 🚀 Tính năng chính

### 1. Xác thực & Tài khoản (Authentication)
* **Đăng ký tài khoản**: Form đăng ký với kiểm tra độ mạnh mật khẩu (Password Strength Indicator) 3 cấp độ.
* **Xác thực OTP Email**: 6 ô nhập mã OTP tự động chuyển tiếp con trỏ, tự động dán từ clipboard, đếm ngược thời gian gửi lại (60s cooldown).
* **Đăng nhập an toàn**: Lưu Access Token trong bộ nhớ (Memory), Refresh Token trong HttpOnly Cookie.
* **Tự động làm mới phiên (Silent Refresh)**: Tự động khôi phục phiên đăng nhập khi khởi động và tự động cấp lại token khi gặp lỗi 401 thông qua cơ chế hàng đợi (Request Queue).

### 2. Nhắn tin thời gian thực (Realtime Chat)
* **Trò chuyện 1-1 & Trò chuyện nhóm**: Tự động kết nối room socket cá nhân (`user_{id}`) và room hội thoại (`conversation_{id}`).
* **Đa dạng thể loại tin nhắn**: Hỗ trợ tin nhắn văn bản, hình ảnh trực quan và tệp đính kèm có thể tải về.
* **Trích dẫn & Trả lời (Reply)**: Xem trước tin nhắn trích dẫn trực tiếp trên thanh nhập và hiển thị trên bong bóng chat.
* **Thu hồi & Xóa tin nhắn**: Thu hồi tin nhắn theo thời gian thực (đồng bộ cho tất cả thành viên) và xóa tin nhắn chỉ ở phía tôi.
* **Chỉ báo đang gõ (Typing Indicator)**: Hiệu ứng 3 chấm nhảy (bounce dots) mượt mà với cơ chế debounce 1.5s tránh spam socket.
* **Cuộn vô tận tải tin cũ (Infinite Scroll Upward)**: Tự động tải tin cũ hơn khi cuộn lên trên đỉnh mà không gây giật lag vị trí cuộn.

### 3. Quản trị nhóm & Thông tin hội thoại (Group & Info Drawer)
* **Bảng thông tin trượt bên phải (Info Drawer)**: Xem thông tin tổng quan, danh sách thành viên và các tùy chọn bảo mật.
* **Đổi tên & Ảnh nhóm**: Cho phép Quản trị viên/Trưởng nhóm cập nhật tên và tải ảnh đại diện nhóm trực tiếp.
* **Thêm thành viên mới**: Chọn nhiều bạn bè cùng lúc để thêm vào nhóm trò chuyện.
* **Phân quyền vai trò**: Trưởng nhóm (`OWNER`) có thể bổ nhiệm hoặc hạ quyền Quản trị viên (`ADMIN`), chuyển giao quyền Trưởng nhóm.
* **Rời nhóm & Giải tán nhóm**: Xác thực an toàn trước khi rời nhóm hoặc giải tán nhóm.

### 4. Danh bạ & Quản lý bạn bè (`/contacts`)
* **Tab Bạn bè**: Danh sách bạn bè hiện tại, trạng thái hoạt động trực tuyến (Online/Offline dot), mở nhanh cuộc trò chuyện 1-1.
* **Tab Lời mời kết bạn**: Quản lý các lời mời kết bạn gửi đến, hỗ trợ Chấp nhận hoặc Từ chối tức thì.
* **Tab Tìm bạn mới**: Tìm kiếm người dùng hệ thống bằng email và gửi lời mời kết bạn.
* **Tab Đã chặn**: Quản lý danh sách người dùng bị chặn và mở chặn (Unblock).

### 5. Hồ sơ cá nhân & Cài đặt (`/profile`)
* **Cập nhật hồ sơ**: Đổi họ tên, tải lên ảnh đại diện mới hoặc xóa ảnh đại diện về mặc định.
* **Đổi mật khẩu**: Xác thực mật khẩu cũ và cập nhật mật khẩu mới có xác nhận.
* **Tùy chọn ứng dụng**: Tùy chỉnh bật/tắt âm thanh thông báo và cảnh báo màn hình.
* **Đăng xuất bảo mật**: Đăng xuất xóa cookie phiên làm việc trên server và điều hướng an toàn.

---

## 📁 Cấu trúc thư mục dự án

```text
Frontend/
├── public/                        # Static assets công khai
├── src/
│   ├── assets/                    # Hình ảnh, icons SVG tĩnh
│   ├── components/                # Reusable UI & Feature components
│   │   ├── chat/                  # Các component phục vụ cửa sổ chat
│   │   │   ├── AddMemberModal.tsx         # Modal thêm thành viên vào nhóm
│   │   │   ├── ChatArea.tsx               # Khung bao bọc ChatWindow hoặc Placeholder
│   │   │   ├── ChatHeader.tsx             # Header cuộc trò chuyện (Avatar, Tên, Nút gọi/info)
│   │   │   ├── ChatWindow.tsx             # Cửa sổ chat chính kết nối Socket & MessageList
│   │   │   ├── ConversationInfoDrawer.tsx # Drawer thông tin & quản trị nhóm bên phải
│   │   │   ├── EditGroupNameModal.tsx     # Modal đổi tên nhóm
│   │   │   ├── MessageBubble.tsx          # Bong bóng tin nhắn (Văn bản, File, Ảnh, Menu hover)
│   │   │   ├── MessageInput.tsx           # Thanh soạn thảo autogrow, đính kèm file, reply
│   │   │   ├── MessageList.tsx            # Danh sách tin nhắn cuộn vô tận, date separator
│   │   │   ├── TransferOwnerModal.tsx     # Modal chuyển giao quyền Trưởng nhóm
│   │   │   └── TypingIndicator.tsx        # Animation 3 chấm đang gõ phím
│   │   ├── contacts/              # Các thẻ phục vụ trang Danh bạ
│   │   │   ├── AddFriendTab.tsx           # Tìm kiếm email & gửi yêu cầu kết bạn
│   │   │   ├── BlockedUserCard.tsx        # Thẻ người dùng đã chặn & nút bỏ chặn
│   │   │   ├── FriendCard.tsx             # Thẻ bạn bè, nút nhắn tin & menu thao tác
│   │   │   └── FriendRequestCard.tsx      # Thẻ lời mời kết bạn (Đồng ý / Từ chối)
│   │   ├── conversation/          # Các component danh sách hội thoại
│   │   │   ├── ConversationItem.tsx       # Thẻ hội thoại kèm tin nhắn cuối, unread badge
│   │   │   ├── ConversationList.tsx       # Cột danh sách hội thoại có ô tìm kiếm & infinite scroll
│   │   │   └── NewConversationModal.tsx   # Modal tạo chat 1-1 hoặc tạo nhóm chat mới
│   │   ├── layout/                # Layout navigation chung
│   │   │   └── Sidebar.tsx                # Thanh điều hướng trái 72px (Tin nhắn, Danh bạ, Cài đặt)
│   │   ├── profile/               # Các card phục vụ trang Cài đặt & Hồ sơ
│   │   │   ├── ChangePasswordCard.tsx     # Form đổi mật khẩu
│   │   │   ├── PreferencesCard.tsx        # Cài đặt âm thanh, thông báo, đăng xuất
│   │   │   └── ProfileInfoCard.tsx        # Form đổi họ tên & upload/xóa avatar
│   │   └── ui/                    # Base UI components chuẩn Meta
│   │       ├── Avatar.tsx                 # Avatar đa kích thước, fallback initials, online dot
│   │       ├── Button.tsx                 # Button chuẩn pill-shaped (100px radius)
│   │       ├── Divider.tsx                # Đường kẻ ngăn cách kèm nhãn
│   │       └── Input.tsx                  # Input chuẩn 44px có icon và trạng thái lỗi
│   ├── contexts/
│   │   └── SocketContext.tsx      # Singleton Socket.IO provider đồng bộ cache React Query
│   ├── hooks/
│   │   ├── useConversations.ts    # Infinite query lấy danh sách cuộc trò chuyện
│   │   ├── useDebounce.ts         # Hook debounce giá trị và hàm callback
│   │   ├── useMessages.ts         # Infinite query tải tin nhắn ngược và helpers lạc quan
│   │   ├── useSocket.ts           # Quản lý sự kiện socket
│   │   └── useTypingIndicator.ts  # Tự động gửi sự kiện đang gõ và dừng gõ
│   ├── layouts/
│   │   ├── AuthLayout.tsx         # Khung giao diện Split-screen cho Login / Register / OTP
│   │   └── MainLayout.tsx         # Khung giao diện 3 cột chính của ứng dụng
│   ├── pages/
│   │   ├── auth/                  # Trang xác thực
│   │   │   ├── LoginPage.tsx              # Đăng nhập
│   │   │   ├── RegisterPage.tsx           # Đăng ký tài khoản
│   │   │   └── VerifyOtpPage.tsx          # Xác thực mã OTP email
│   │   ├── chat/
│   │   │   └── ChatPage.tsx               # Trang nhắn tin chính
│   │   ├── contacts/
│   │   │   └── ContactsPage.tsx           # Trang danh bạ & bạn bè
│   │   └── profile/
│   │       └── ProfilePage.tsx            # Trang hồ sơ & cài đặt
│   ├── services/                  # Tầng gọi API qua Axios
│   │   ├── api.client.ts                  # Axios instance với Token Refresh Interceptor & Queue
│   │   ├── auth.service.ts                # API Auth (Login, Register, OTP, Refresh, Logout)
│   │   ├── conversation.service.ts        # API Hội thoại (Create, Detail, Update, Disband)
│   │   ├── friendship.service.ts          # API Bạn bè (Friends, Requests, Block/Unblock)
│   │   ├── member.service.ts              # API Thành viên (Add, Remove, Role, Transfer, Clear)
│   │   ├── message.service.ts             # API Tin nhắn (Get, Send, Recall, DeleteForMe)
│   │   ├── upload.service.ts              # API Upload ảnh & file đính kèm
│   │   └── user.service.ts                # API Người dùng (Profile, Avatar, Search)
│   ├── store/                     # Quản lý trạng thái client với Zustand
│   │   ├── auth.store.ts                  # Trạng thái đăng nhập và thông tin user (Session)
│   │   ├── chat.store.ts                  # Trạng thái hội thoại đang mở, replyTo, typing, unread
│   │   └── presence.store.ts              # Tập hợp các user ID đang online
│   ├── types/
│   │   └── index.ts               # Khai báo TypeScript types khớp 100% backend schemas
│   ├── utils/
│   │   ├── cn.ts                          # Helper kết hợp Tailwind classnames (clsx + twMerge)
│   │   ├── formatTime.ts                  # Định dạng thời gian theo chuẩn tiếng Việt (date-fns)
│   │   └── helpers.ts                     # Xử lý tên, URL avatar tĩnh backend, kích thước file
│   ├── App.tsx                    # Cấu hình routes và bộ điều hướng Private/Public guard
│   ├── index.css                  # Toàn bộ theme tokens và utility classes của Meta
│   └── main.tsx                   # Điểm khởi chạy React, bọc QueryClient & BrowserRouter
├── .env                           # Biến môi trường cục bộ
├── .env.example                   # Biến môi trường mẫu
├── package.json                   # Khai báo thư viện & dependencies
├── tsconfig.app.json              # Cấu hình TypeScript với path alias @
└── vite.config.ts                 # Cấu hình Vite với plugin Tailwind v4 & alias
```

---

## 🛠️ Hướng dẫn cài đặt & Cách chạy

### Yêu cầu tiên quyết
* **Node.js** >= 18.x
* **npm** >= 9.x
* **Backend Server** (NestJS + MongoDB + Redis) đang khởi chạy tại `http://localhost:3000`.

### 1. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc của frontend:
```bash
cp .env.example .env
```

Nội dung `.env`:
```env
# URL API Backend NestJS
VITE_API_BASE_URL=http://localhost:3000/api/v1

# URL Socket.IO Server
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Chạy ở môi trường Development
```bash
npm run dev
```
Ứng dụng sẽ khả dụng tại: `http://localhost:5173/`

### 4. Kiểm tra TypeScript & Đóng gói Production
```bash
# Kiểm tra lỗi type toàn bộ dự án
npx tsc --noEmit

# Biên dịch và đóng gói tối ưu hóa cho Production
npm run build

# Chạy thử bản build production
npm run preview
```

---

## 🎨 Chuẩn thiết kế Meta Design System

Dự án áp dụng chặt chẽ theo tài liệu `.claude/DESIGN.md`:
* **Typography**: Sử dụng font chữ biến thể **Optimistic VF** (fallback sang Montserrat, Helvetica, Arial).
* **Nút bấm (Buttons)**: 100% tuân thủ hình dạng viên thuốc (`border-radius: 100px` / `rounded-full`), không bao giờ sử dụng góc vuông.
* **Hệ màu sắc chính**:
  * **Primary Cobalt** (`#0064e0`): Dành riêng cho các nút hành động chính (Action CTA) và bong bóng tin nhắn của tôi.
  * **Ink Button** (`#000000`): Dành cho các nút xác thực và marketing.
  * **Surface Soft** (`#f1f4f7`): Nền phụ và bong bóng tin nhắn người khác.
  * **Ink Deep** (`#0a1317`): Màu chữ tiêu đề chính.
* **Bo góc thẻ (Cards)**: Bo tròn lớn chuẩn `xxxl` (32px) cho các khung panel và `xl` (16px) cho thẻ tính năng.
