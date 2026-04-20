const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ===== Helper response =====
const sendResponse = (res, status, success, data, message) => {
  return res.status(status).json({ success, data, message });
};

// 1. GET ALL
router.get('/', async (req, res) => {
  try {
    const { status, name, sort } = req.query;

    const filter = {};

    // filter theo status
    if (status) {
    filter.status = status;
    }

    // search theo tên
    if (name) {
    filter.customerName = {
        $regex: name,
        $options: 'i'
    };
    }

    // sort
    let sortOption = { createdAt: -1 }; // mặc định

    if (sort === 'asc') {
    sortOption = { totalAmount: 1 };
    } else if (sort === 'desc') {
    sortOption = { totalAmount: -1 };
    }

    const orders = await Order.find(filter).sort(sortOption);

    sendResponse(res, 200, true, orders, "Lấy danh sách đơn hàng thành công");

  } catch (err) {
    sendResponse(res, 500, false, null, err.message);
  }
});
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return sendResponse(res, 400, false, null, "Thiếu tên cần tìm");
    }

    const orders = await Order.find({
      customerName: {
        $regex: name,
        $options: 'i' // không phân biệt hoa thường
      }
    }).sort({ createdAt: -1 });

    sendResponse(res, 200, true, orders, "Tìm kiếm thành công");

  } catch (err) {
    sendResponse(res, 500, false, null, err.message);
  }
});

// 2. GET BY ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(res, 404, false, null, "Không tìm thấy đơn hàng");
    }

    sendResponse(res, 200, true, order, "Lấy đơn hàng thành công");

  } catch (err) {
    sendResponse(res, 500, false, null, err.message);
  }
});

// 3. POST (CÓ VALIDATION)
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return sendResponse(res, 400, false, null, "Items không được rỗng");
    }

    // Tính total
    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Validate totalAmount
    if (calculatedTotal !== totalAmount) {
      return sendResponse(res, 400, false, null,
        `totalAmount sai. Đúng phải là ${calculatedTotal}`
      );
    }

    const order = new Order(req.body);
    const newOrder = await order.save();

    sendResponse(res, 201, true, newOrder, "Tạo đơn hàng thành công");

  } catch (err) {
    sendResponse(res, 400, false, null, err.message);
  }
});

// 4. PUT
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return sendResponse(res, 404, false, null, "Không tìm thấy đơn hàng");
    }

    sendResponse(res, 200, true, updatedOrder, "Cập nhật thành công");

  } catch (err) {
    sendResponse(res, 400, false, null, err.message);
  }
});

// 5. DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return sendResponse(res, 404, false, null, "Không tìm thấy đơn hàng");
    }

    sendResponse(res, 200, true, null, "Xóa đơn hàng thành công");

  } catch (err) {
    sendResponse(res, 500, false, null, err.message);
  }
});

module.exports = router;