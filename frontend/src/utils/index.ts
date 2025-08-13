export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDateVi = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) return ""; // Kiểm tra date không hợp lệ

  return parsedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTimeVN = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) return ""; // Kiểm tra date không hợp lệ

  return parsedDate.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false, // Hiển thị 24h
  });
};


export const getStatusCf = (status: String) => {
  switch (status) {
    case "init":
      return {
        text: "Mới tạo",
        color: "grey", // trung tính, chưa có hành động
        title: "Cập nhật lịch đấu"
      }
    case "edited":
      return {
        text: "Đã cập nhật lịch",
        color: "orange",
        title: "Cập nhật lịch đấu"
      }
    case "confirmed":
      return {
        text: "Đang chờ thanh toán",
        color: "orange",
        title: "Đã cập nhật lịch"
      }
    case "done":
      return {
        text: "Hoàn tất",
        color: "green", // thành công
        title: "Thông tin lịch đấu"
      }
    default:
      return {
        text: "Không xác định",
        color: "red", // lỗi hoặc trạng thái không rõ
        title: "Tạo mới lịch"
      }
  }
}

export const parseISOToDate = (isoString: string): Date | null => {
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};

export const splitFeeEvenlyInt = (total: number, count: number): number[] => {
  if (count === 0) return [];

  const base = Math.floor(total / count); // chia đều, làm tròn xuống
  const result = Array(count).fill(base);

  let remaining = total - base * count; // số tiền còn dư

  // phân bổ số dư cho một số người đầu tiên
  for (let i = 0; i < remaining; i++) {
    result[i] += 1;
  }

  return result;
}

/* chuyển array date → chuỗi hiển thị */
export const formatDates = (dates: Date[]): string => {
  return dates.map(d => formatDateVi(d)).join(', ')
}