const express = require('express');
const router = express.Router();
const pool = require('../app');
const axios = require('axios');

// สำหรับกดขอ OTP
router.post('/request-otp', async (req, res) => {
    const { phone } = req.body;
    const memberQuery = 'SELECT Mem_Id FROM Member WHERE Mem_Phone = ?';
    try {
        const memberResult = await pool.promise().query(memberQuery, [phone]);
        const formattedPhone = phone.startsWith('0') ? '66' + phone.slice(1) : phone;
        if (memberResult[0].length === 0) {
            return res.status(404).json({ message: 'ไม่พบหมายเลขโทรศัพท์นี้ในฐานข้อมูล' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000); // สร้าง OTP 6 หลัก
        const message = `Your OTP is ${otp}. Please keep it secret`;

        // สร้างข้อความสำหรับส่ง OTP
        const data = JSON.stringify({
            "accountId": "09809608579971",
            "secretKey": "U2FsdGVkX19U/Td9EChM/fcQQgP3N6ifViHC2KraJKg=",
            "type": "OTP",
            "to": formattedPhone,
            "sender": "BulkSMS.Ltd",
            "msg": message
        });

        // ส่ง OTP ไปยังเบอร์โทร
        const smsResponse = await axios.post('https://smsapi.deecommerce.co.th:4300/service/SMSWebService', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // ถ้าไม่ ERROR เก็บ OTP และ ID ของ Member ใน session
        if (smsResponse.data.error === '0') {
            req.session.otp = otp.toString(); // แปลง OTP เป็น string
            req.session.memberPhone = phone; // เพิ่มการเซ็ตค่า memberPhone ใน session
            res.send({ success: true, message: 'OTP ถูกส่งสำเร็จ' });
        } else {
            res.status(500).json({ message: 'ไม่สามารถส่ง OTP ได้', details: smsResponse.data });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการส่ง OTP:', error);
        res.status(500).json({ message: 'ข้อผิดพลาดภายในเซิร์ฟเวอร์', details: error });
    }
});

//สำหรับกดส่ง OTP ที่ได้รับ
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        if (otp && req.session.otp && otp.toString() === req.session.otp) {
            res.send({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'รหัส OTP ไม่ถูกต้อง' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' });
    }
});

module.exports = router;
