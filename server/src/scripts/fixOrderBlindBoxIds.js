const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const BlindBox = require('../models/BlindBox');

async function fixOrderBlindBoxIds() {
  try {
    console.log('连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blind-box-app');
    
    console.log('获取所有订单...');
    const orders = await Order.find({});
    console.log(`找到 ${orders.length} 个订单`);
    
    console.log('获取所有盲盒...');
    const blindBoxes = await BlindBox.find({});
    console.log(`找到 ${blindBoxes.length} 个盲盒`);
    
    // 创建盲盒名称到ID的映射
    const blindBoxMap = {};
    blindBoxes.forEach(box => {
      blindBoxMap[box.name] = box._id;
    });
    
    console.log('开始修复订单...');
    let fixedCount = 0;
    
    for (const order of orders) {
      let orderUpdated = false;
      
      for (const item of order.items) {
        if (item.blindBoxName && (!item.blindBoxId || !blindBoxes.find(box => box._id.toString() === item.blindBoxId.toString()))) {
          const correctId = blindBoxMap[item.blindBoxName];
          if (correctId) {
            console.log(`修复订单 ${order.orderNumber} 中的盲盒 "${item.blindBoxName}"`);
            console.log(`  旧ID: ${item.blindBoxId}`);
            console.log(`  新ID: ${correctId}`);
            item.blindBoxId = correctId;
            orderUpdated = true;
          } else {
            console.log(`警告: 找不到名为 "${item.blindBoxName}" 的盲盒`);
          }
        }
      }
      
      if (orderUpdated) {
        await order.save();
        fixedCount++;
      }
    }
    
    console.log(`修复完成！共修复了 ${fixedCount} 个订单`);
    
    // 验证修复结果
    console.log('验证修复结果...');
    const testOrder = await Order.findOne({}).populate('items.blindBoxId', 'name imageUrl');
    if (testOrder && testOrder.items[0] && testOrder.items[0].blindBoxId) {
      console.log('修复成功！示例订单的盲盒信息:');
      console.log('- 盲盒名称:', testOrder.items[0].blindBoxId.name);
      console.log('- 盲盒图片:', testOrder.items[0].blindBoxId.imageUrl);
    } else {
      console.log('修复可能失败，请检查数据');
    }
    
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('修复过程中出错:', error);
    process.exit(1);
  }
}

fixOrderBlindBoxIds();