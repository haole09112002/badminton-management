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
