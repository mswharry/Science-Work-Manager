function flattenErrorDetail(detail) {
  if (!detail) {
    return "Phản hồi máy chủ không hợp lệ.";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.msg) {
          const location = Array.isArray(item.loc)
            ? item.loc.filter((part) => part !== "body").join(" → ")
            : "";
          return location ? `${location}: ${item.msg}` : item.msg;
        }

        return JSON.stringify(item);
      })
      .join(" • ");
  }

  if (typeof detail === "object") {
    if (typeof detail.message === "string") {
      return detail.message;
    }

    return Object.entries(detail)
      .map(([key, value]) => `${key}: ${flattenErrorDetail(value)}`)
      .join(" • ");
  }

  return "Phản hồi máy chủ không hợp lệ.";
}

export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra.") {
  if (!error) {
    return fallback;
  }

  const responseData = error?.response?.data;

  if (responseData?.detail) {
    return flattenErrorDetail(responseData.detail);
  }

  if (responseData?.message) {
    return flattenErrorDetail(responseData.message);
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}
