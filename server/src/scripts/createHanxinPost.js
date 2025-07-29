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

// 创建韩信帖子
async function createHanxinPost() {
  try {
    console.log('\n📝 正在创建韩信帖子...\n');
    
    const post = new PlayerShow({
      userId: new mongoose.Types.ObjectId(), // 生成一个新的ObjectId
      username: '123',
      userAvatar: '', // 将使用默认头像
      title: '抽到了史诗级的韩信！',
      content: '抽到了史诗级的韩信！这个造型真的太帅了，细节做得非常棒，特别是武器的设计。',
      images: ['/images/hanxin.jpg'], // 使用服务器中的韩信图片
      relatedBlindBox: {
        blindBoxId: new mongoose.Types.ObjectId(),
        blindBoxName: '王者荣耀盲盒',
        drawnItem: {
          name: '韩信',
          rarity: 'SR',
          imageUrl: '/images/hanxin.jpg'
        }
      },
      likes: [],
      likesCount: 34, // 设置点赞数为34
      comments: [
        {
          userId: new mongoose.Types.ObjectId(),
          username: '王者玩家',
          userAvatar: '',
          content: '韩信确实帅！我也想要一个',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1小时前
        },
        {
          userId: new mongoose.Types.ObjectId(),
          username: '盲盒爱好者',
          userAvatar: '',
          content: '这个系列的质量真的很好',
          createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
        }
      ],
      commentsCount: 2,
      viewsCount: 156,
      isPinned: false,
      isHidden: false,
      tags: ['王者荣耀', '韩信', 'SR'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
    });
    
    await post.save();
    
    console.log('✅ 韩信帖子创建成功！');
    console.log(`📋 帖子ID: ${post._id}`);
    console.log(`👤 用户名: ${post.username}`);
    console.log(`📝 标题: ${post.title}`);
    console.log(`💬 内容: ${post.content}`);
    console.log(`👍 点赞数: ${post.likesCount}`);
    console.log(`💬 评论数: ${post.commentsCount}`);
    console.log(`👀 浏览数: ${post.viewsCount}`);
    console.log(`📅 创建时间: ${post.createdAt}`);
    
  } catch (error) {
    console.error('❌ 创建帖子失败:', error);
  }
}

// 主函数
async function main() {
  await connectDB();
  await createHanxinPost();
  
  console.log('\n✅ 帖子创建完成');
  await mongoose.connection.close();
  console.log('🔌 数据库连接已关闭');
}

// 运行脚本
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});