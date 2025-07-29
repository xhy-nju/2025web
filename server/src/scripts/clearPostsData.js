const mongoose = require('mongoose');
const PlayerShow = require('../models/PlayerShow');

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blindbox_db';

async function clearPostsData() {
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 获取清理前的统计信息
    const beforeStats = await getPostsStats();
    console.log('📊 清理前统计:');
    console.log(`   - 总帖子数: ${beforeStats.totalPosts}`);
    console.log(`   - 总评论数: ${beforeStats.totalComments}`);
    console.log(`   - 总点赞数: ${beforeStats.totalLikes}`);

    if (beforeStats.totalPosts === 0) {
      console.log('ℹ️  数据库中没有找到任何帖子');
      console.log('💡 前端模拟数据已在代码中清理');
      return;
    }

    // 清理所有帖子的评论和点赞
    const result = await PlayerShow.updateMany(
      {}, // 匹配所有帖子
      {
        $set: {
          comments: [],           // 清空评论数组
          commentsCount: 0,       // 重置评论数量
          likes: [],              // 清空点赞数组
          likesCount: 0          // 重置点赞数量
        }
      }
    );

    console.log(`✅ 成功更新了 ${result.modifiedCount} 个帖子`);

    // 获取清理后的统计信息
    const afterStats = await getPostsStats();
    console.log('📈 清理后统计:');
    console.log(`   - 总帖子数: ${afterStats.totalPosts}`);
    console.log(`   - 总评论数: ${afterStats.totalComments}`);
    console.log(`   - 总点赞数: ${afterStats.totalLikes}`);

    console.log('🧹 所有帖子的评论和点赞已清空');

  } catch (error) {
    console.error('❌ 清理数据时出错:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 获取帖子统计信息
async function getPostsStats() {
  const posts = await PlayerShow.find({});
  const totalPosts = posts.length;
  const totalComments = posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
  
  return {
    totalPosts,
    totalComments,
    totalLikes
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🚀 开始清理帖子数据...');
  console.log('📝 此操作将清空所有帖子的评论和点赞数据');
  console.log('💡 前端模拟数据也已在代码中清理');
  console.log('');
  
  clearPostsData()
    .then(() => {
      console.log('');
      console.log('✨ 清理完成!');
      console.log('🔄 请刷新前端页面查看效果');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 清理失败:', error);
      process.exit(1);
    });
}

module.exports = clearPostsData;