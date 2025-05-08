import { Offer } from '../../domain/entities/Offer';

export function xacDinhLoaiDeal(offer: Offer): string {
    // Kiểm tra nếu có mã giảm giá >= 100,000 VND
    const coGiamGiaCao = offer.coupons.some(coupon => {
        const moTa = coupon.coupon_desc.toLowerCase();
        const ketQuaGiamGia = moTa.match(/giảm\s+(\d+(?:\.\d+)?%?)\s*(?:-tối đa\s+(\d+(?:,\d+)*)\s*vnđ)?/i);

        if (ketQuaGiamGia) {
            // Kiểm tra giảm giá theo phần trăm với giá trị tối đa
            if (ketQuaGiamGia[1].includes('%') && ketQuaGiamGia[2]) {
                const giaTriToiDa = parseInt(ketQuaGiamGia[2].replace(/,/g, ''));
                return giaTriToiDa >= 100000;
            }
            // Kiểm tra giảm giá cố định
            const giaTriGiamGia = parseInt(ketQuaGiamGia[1].replace(/,/g, ''));
            return giaTriGiamGia >= 100000;
        }
        return false;
    });

    // Kiểm tra đơn hàng tối thiểu >= 1,000,000 VND
    const coDonHangToiThieuCao = offer.coupons.some(coupon => {
        const moTa = coupon.coupon_desc.toLowerCase();
        const ketQuaDonHang = moTa.match(/cho đơn tối thiểu\s+(\d+(?:,\d+)*)\s*vnđ/i);
        if (ketQuaDonHang) {
            const giaTriDonHang = parseInt(ketQuaDonHang[1].replace(/,/g, ''));
            return giaTriDonHang >= 1000000;
        }
        return false;
    });

    // Kiểm tra hết hạn trong vòng 10 ngày
    const ngayHetHan = new Date(offer.end_time);
    const ngayHienTai = new Date();
    const soNgayConLai = Math.ceil((ngayHetHan.getTime() - ngayHienTai.getTime()) / (1000 * 60 * 60 * 24));
    const sapHetHan = soNgayConLai <= 10;

    // Nếu thỏa mãn bất kỳ điều kiện nào, đây là "Deals Hot"
    if (coGiamGiaCao || coDonHangToiThieuCao || sapHetHan) {
        return 'deals';
    }

    return 'coupons';
}