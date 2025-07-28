const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// 获取当前用户信息
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新用户信息
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      username, 
      avatar, 
      nickname, 
      phone, 
      gender, 
      birthday, 
      bio,
      addresses 
    } = req.body;
    
    const updateData = {};

    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (nickname) updateData.nickname = nickname;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (birthday) updateData.birthday = birthday;
    if (bio) updateData.bio = bio;
    if (addresses) updateData.addresses = addresses;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户库存
router.get('/inventory', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('inventory');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { inventory: user.inventory }
    });
  } catch (error) {
    console.error('获取用户库存错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户统计信息
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'coins points level experience totalDraws totalOrders totalPosts totalLikes totalComments totalSpent'
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { stats: user }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 添加收货地址
router.post('/addresses', auth, async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 如果设置为默认地址，先将其他地址设为非默认
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.json({
      success: true,
      message: '地址添加成功',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    console.error('添加地址错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新收货地址
router.put('/addresses/:addressId', auth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, province, city, district, detail, isDefault } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }

    // 如果设置为默认地址，先将其他地址设为非默认
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.province = province || address.province;
    address.city = city || address.city;
    address.district = district || address.district;
    address.detail = detail || address.detail;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.json({
      success: true,
      message: '地址更新成功',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    console.error('更新地址错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除收货地址
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    user.addresses.id(addressId).remove();
    await user.save();

    res.json({
      success: true,
      message: '地址删除成功',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    console.error('删除地址错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取所有用户（管理员功能）
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const isActive = req.query.isActive;

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: users.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 管理员更新用户状态
router.put('/:userId/status', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;
    
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户状态更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;