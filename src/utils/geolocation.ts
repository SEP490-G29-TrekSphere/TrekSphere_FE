export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Thiết bị không hỗ trợ định vị GPS.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('Vui lòng cấp quyền truy cập vị trí để tiếp tục.'));
        } else {
          reject(new Error('Không thể lấy vị trí GPS hiện tại. Vui lòng thử lại.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
