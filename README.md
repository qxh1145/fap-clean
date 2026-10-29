# FAP Clean

Tiện ích trình duyệt đổi giao diện [FAP](https://fap.fpt.edu.vn) sang kiểu tối giản: nền sáng thoáng, chữ rõ, viền mảnh, cam làm màu nhấn. Mọi dữ liệu vẫn lấy từ FAP, tiện ích chỉ thay cách trình bày.

### [⬇ Tải FAP Clean (FAP-Clean.zip)](https://github.com/qxh1145/fap-clean/releases/latest/download/FAP-Clean.zip)

Dùng trên máy tính với Chrome, Brave, Edge hoặc trình duyệt nhân Chromium khác. Cài mất khoảng 2 phút, xem [hướng dẫn cài](#cài-đặt) bên dưới.

> Không chính thức. FAP Clean không liên kết và không được FPT Education hay Trường Đại học FPT xác nhận.

## Xem giới thiệu (20 giây)

https://github.com/user-attachments/assets/4c99f9b0-adc5-462b-9822-75ea509cdd78

## Tính năng

![Trang chủ](docs/screenshots/01-trang-chu.png)

**Trang chủ có lịch hôm nay.** Các buổi học nằm trên thanh thời gian, có vạch "Bây giờ" chạy theo giờ thật. Buổi đang học được tô cam, buổi đã qua làm mờ. Lớp trực tuyến có nút mở Google Meet. Hôm nào không có lớp thì hiện buổi học tiếp theo.

**Thanh điều hướng trên cùng** thay cho sidebar: Trang chủ, Thời khoá biểu, Điểm danh, Điểm, Lịch thi. Mọi chức năng khác của FAP nằm thành lưới ô ở trang chủ, chia theo nhóm, không phải mở menu con.

**Tìm nhanh `Ctrl K`** (máy Mac `⌘ K`). Gõ không dấu cũng được: `diem`, `lich thi`, `hoc phi`.

**Chế độ tối** tự theo máy, hoặc chọn Sáng/Tối bằng nút trên thanh trên cùng hay trong popup.

**Bảng gọn hơn.** Điểm danh và báo cáo điểm bỏ nền sọc, trạng thái có chấm màu. Lịch thi làm mờ buổi đã qua và đánh dấu buổi thi gần nhất.

| | |
|---|---|
| ![Chế độ tối](docs/screenshots/02-che-do-toi.png) | ![Tìm nhanh](docs/screenshots/03-tim-nhanh.png) |
| Chế độ tối | Tìm nhanh `Ctrl K` |
| ![Thời khoá biểu](docs/screenshots/04-thoi-khoa-bieu.png) | ![Điểm danh](docs/screenshots/05-diem-danh.png) |
| Thời khoá biểu, cột hôm nay tô cam | Điểm danh có chấm trạng thái |
| ![Báo cáo điểm](docs/screenshots/06-bao-cao-diem.png) | ![Lịch thi](docs/screenshots/07-lich-thi.png) |
| Báo cáo điểm | Lịch thi, đánh dấu buổi gần nhất |
| ![Tất cả chức năng](docs/screenshots/08-tat-ca-chuc-nang.png) | <img src="docs/screenshots/09-popup.png" alt="Popup" width="320"> |
| Lưới tất cả chức năng | Popup bật/tắt và cài đặt |

Ảnh chụp dùng dữ liệu mẫu, không phải tài khoản thật.

## Cài đặt

FAP Clean chưa có trên Chrome Web Store, nên bạn cài bằng tay theo 6 bước dưới đây. Không cần biết lập trình, chỉ cần làm đúng thứ tự.

### Xem video hướng dẫn cài (27 giây)

https://github.com/user-attachments/assets/5778e9ba-b53d-4676-85aa-001450fbcd5b

Trong video, file được tải bằng nút **Code → Download ZIP** nên thư mục có tên `fap-clean-main`. Nếu bạn tải bằng nút **⬇ Tải FAP Clean** ở đầu trang thì thư mục tên là `FAP-Clean`. Các bước còn lại giống hệt nhau, cách nào cũng được.

### Bước 1. Tải file

Bấm **[Tải FAP-Clean.zip](https://github.com/qxh1145/fap-clean/releases/latest/download/FAP-Clean.zip)**. File nặng khoảng 230 KB và sẽ nằm trong thư mục **Downloads** (Tải xuống).

Nếu vào trang [Releases](https://github.com/qxh1145/fap-clean/releases), hãy tải **FAP-Clean.zip** ở mục **Assets**. Đừng tải "Source code (zip)": file đó dành cho lập trình viên.

### Bước 2. Giải nén và cất thư mục

- **Windows:** bấm chuột phải vào `FAP-Clean.zip`, chọn **Extract All…** (Giải nén tất cả), rồi bấm **Extract**.
- **macOS:** bấm đúp vào `FAP-Clean.zip`. Nếu dùng Safari để tải thì file thường đã được giải nén sẵn.

Bạn sẽ có một thư mục tên **FAP-Clean**. Hãy chuyển nó vào một chỗ cố định, ví dụ thư mục **Documents** (Tài liệu).

> ⚠️ Sau khi cài, đừng xoá, đổi tên hay di chuyển thư mục này. Trình duyệt chạy tiện ích trực tiếp từ đó, nên xoá thư mục là tiện ích biến mất.

### Bước 3. Mở trang quản lý tiện ích

Bấm vào thanh địa chỉ của trình duyệt, gõ địa chỉ tương ứng rồi nhấn **Enter**:

| Trình duyệt | Gõ vào thanh địa chỉ |
|---|---|
| Google Chrome | `chrome://extensions` |
| Brave | `brave://extensions` |
| Microsoft Edge | `edge://extensions` |

### Bước 4. Bật Developer mode

Tìm công tắc **Developer mode** (tiếng Việt: **Chế độ dành cho nhà phát triển**) và bật nó lên:

- **Chrome, Brave:** ở góc trên bên phải trang.
- **Edge:** ở cột bên trái trang.

Bật xong sẽ hiện thêm một hàng nút mới.

### Bước 5. Chọn thư mục FAP-Clean

1. Bấm nút **Load unpacked** (tiếng Việt: **Tải tiện ích đã giải nén**).
2. Trong cửa sổ chọn thư mục, tìm đến thư mục **FAP-Clean** đã cất ở bước 2.
3. Chọn thư mục **FAP-Clean** (bấm vào nó một lần, không cần mở vào trong) rồi bấm **Select Folder** / **Chọn**.

Thẻ **FAP Clean** sẽ hiện trong danh sách tiện ích. Vậy là đã cài xong.

### Bước 6. Mở FAP và ghim tiện ích

1. Vào https://fap.fpt.edu.vn. Nếu trang đang mở sẵn thì tải lại (phím **F5**, hoặc **⌘ R** trên Mac).
2. Để bật/tắt nhanh, hãy ghim tiện ích lên thanh công cụ: bấm biểu tượng **mảnh ghép** 🧩 cạnh thanh địa chỉ, rồi bấm hình **ghim** 📌 bên cạnh FAP Clean.

Nhấn `Ctrl K` (Mac: `⌘ K`) trên FAP để thử tìm nhanh.

## Gặp lỗi?

**Báo "Manifest file is missing or unreadable" (Thiếu tệp kê khai)**
Bạn đã chọn nhầm thư mục. Hãy chọn đúng thư mục **FAP-Clean**: bên trong nó phải thấy ngay file `manifest.json`. Nếu mở vào thấy thêm một thư mục FAP-Clean nữa, hãy chọn thư mục bên trong đó.

**Không thấy nút Load unpacked**
Bạn chưa bật **Developer mode** ở bước 4.

**FAP vẫn hiện giao diện cũ**
- Tải lại trang FAP.
- Kiểm tra trong `chrome://extensions` rằng công tắc của FAP Clean đang bật (màu xanh).
- Bấm biểu tượng FAP Clean trên thanh công cụ, xem công tắc trong popup có đang bật không.

**Chrome hiện thông báo về tiện ích ở chế độ nhà phát triển khi mở máy**
Đây là cảnh báo chung cho mọi tiện ích cài tay. Chọn giữ lại (hoặc bấm ✕) là được, đừng chọn tắt.

**Tiện ích tự biến mất**
Thường là do thư mục FAP-Clean đã bị xoá hoặc di chuyển. Làm lại từ bước 2.

**Giao diện bị lệch sau khi trường cập nhật FAP**
Tắt FAP Clean trong popup để quay về giao diện gốc, rồi báo lỗi ở mục [Issues](https://github.com/qxh1145/fap-clean/issues).

## Cập nhật bản mới

1. Tải lại [FAP-Clean.zip](https://github.com/qxh1145/fap-clean/releases/latest/download/FAP-Clean.zip) rồi giải nén.
2. Chép toàn bộ file trong thư mục mới **đè** vào thư mục FAP-Clean cũ (chọn "Replace" / "Thay thế" khi được hỏi).
3. Mở `chrome://extensions`, bấm nút tải lại **↻** trên thẻ FAP Clean.
4. Tải lại trang FAP.

Bấm **Watch → Custom → Releases** ở đầu trang GitHub này để được báo khi có bản mới.

## Gỡ bỏ

Mở `chrome://extensions`, bấm **Remove** (Xoá) trên thẻ FAP Clean, rồi xoá thư mục FAP-Clean.

## Câu hỏi thường gặp

**Có an toàn không? Có lấy mật khẩu hay điểm của tôi không?**
Không. Tiện ích chỉ chạy trên `fap.fpt.edu.vn` và chỉ đổi cách hiển thị. Nó không có máy chủ, không gửi dữ liệu đi đâu và không đọc mật khẩu. Toàn bộ mã nguồn công khai ngay trong repo này để ai cũng kiểm tra được. Chi tiết trong [PRIVACY.md](PRIVACY.md).

**Có ảnh hưởng gì đến tài khoản FAP không?**
Không. Tiện ích không gửi form và không thay đổi gì trên FAP. Tắt tiện ích là FAP trở lại y như cũ.

**Dùng trên điện thoại được không?**
Chưa. Trình duyệt trên điện thoại không cài được tiện ích kiểu này.

**Firefox, Safari thì sao?**
Hiện chỉ hỗ trợ các trình duyệt nhân Chromium (Chrome, Brave, Edge, Cốc Cốc, Opera…).

## Quyền riêng tư

- Chỉ chạy trên `https://fap.fpt.edu.vn/*`. Quyền duy nhất là `storage` để nhớ cài đặt.
- Không gửi dữ liệu ra ngoài: không có máy chủ, không quảng cáo, không theo dõi.
- Lịch hôm nay được đọc từ chính FAP (`/WeeklyTimetable/WeekPartial`), chỉ đọc, lưu tạm 10 phút trong tab.
- Font Be Vietnam Pro được đóng gói sẵn, không tải từ máy chủ khác.

## Dành cho lập trình viên

```
manifest.json            Manifest V3
src/content.js           thanh điều hướng, trang chủ, tìm nhanh, chế độ tối
styles/fapx.css          toàn bộ giao diện; mọi quy tắc nằm dưới html.fapx
styles/fonts.css         khai báo font Be Vietnam Pro
popup/                   popup bật/tắt và cài đặt
fonts/                   Be Vietnam Pro (SIL Open Font License 1.1)
docs/                    ảnh chụp, hướng dẫn cài đi kèm bản phát hành
.github/workflows/       tự đóng gói FAP-Clean.zip khi publish release
```

- Mọi CSS nằm dưới class `html.fapx`, và mọi phần chèn vào trang mang class `fx-injected`. Nhờ vậy khi tắt, tiện ích gỡ sạch và không đè lên Bootstrap của FAP.
- **Phát hành bản mới:** tăng `version` trong `manifest.json` rồi push lên `main`. Sau đó vào **Releases → Draft a new release**, tạo tag `v` + version (ví dụ `v1.0.1`) và bấm **Publish release**. GitHub Actions sẽ kiểm tra version khớp tag, đóng gói `FAP-Clean.zip`, đính kèm vào release và điền ghi chú phát hành.

Font Be Vietnam Pro theo [SIL Open Font License 1.1](fonts/OFL-LICENSE.txt).
