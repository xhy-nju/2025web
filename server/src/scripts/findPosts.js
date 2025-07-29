const mongoose = require('mongoose');
const PlayerShow = require('../models/PlayerShow');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/blindbox_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 查找所有帖子
async function findAllPosts() {
  try {
    console.log('\n🔍 正在查找数据库中的所有帖子...\n');
    
    const posts = await PlayerShow.find({}).sort({ createdAt: -1 });
    
    if (posts.length === 0) {
      console.log('📭 数据库中没有找到任何帖子');
      return;
    }
    
    console.log(`📊 找到 ${posts.length} 个帖子:\n`);
    
    posts.forEach((post, index) => {
      console.log(`--- 帖子 ${index + 1} ---`);
      console.log(`ID: ${post._id}`);
      console.log(`用户ID: ${post.userId}`);
      console.log(`用户名: ${post.username}`);
      console.log(`标题: ${post.title}`);
      console.log(`内容: ${post.content}`);
      console.log(`创建时间: ${post.createdAt}`);
      console.log(`点赞数: ${post.likesCount}`);
      console.log(`评论数: ${post.commentsCount}`);
      console.log(`浏览数: ${post.viewsCount}`);
      
      if (post.comments && post.comments.length > 0) {
        console.log(`评论:`);
        post.comments.forEach((comment, i) => {
          console.log(`  ${i + 1}. ${comment.username}: ${comment.content}`);
        });
      }
      
      if (post.relatedBlindBox) {
        console.log(`关联盲盒: ${JSON.stringify(post.relatedBlindBox, null, 2)}`);
      }
      
      console.log(''); // 空行分隔
    });
    
  } catch (error) {
    console.error('❌ 查找帖子失败:', error);
  }
}

// 主函数
async function main() {
  await connectDB();
  await findAllPosts();
  
  console.log('✅ 查找完成');
  await mongoose.connection.close();
  console.log('🔌 数据库连接已关闭');
}

// 运行脚本
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});