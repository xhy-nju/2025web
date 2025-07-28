const mongoose = require('mongoose');
require('dotenv').config();

// 导入模型
const BlindBox = require('../models/BlindBox');
const User = require('../models/User');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB连接成功');
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 盲盒初始数据
const blindBoxData = [
  {
    name: "海贼王盲盒",
    category: "动漫",
    price: 39,
    soldCount: 1234,
    imageUrl: "/images/one-piece-box.jpg",
    description: "收集你最喜爱的海贼王角色！每个盲盒都包含一个精美的角色手办，稀有度不同，收集价值极高。",
    items: [
      {
        name: "路飞",
        rarity: "普通",
        probability: 30,
        imageUrl: "/images/luffy.jpg"
      },
      {
        name: "索隆",
        rarity: "普通", 
        probability: 25,
        imageUrl: "/images/zoro.jpg"
      },
      {
        name: "娜美",
        rarity: "稀有",
        probability: 20,
        imageUrl: "/images/nami.jpg"
      },
      {
        name: "山治",
        rarity: "稀有",
        probability: 15,
        imageUrl: "/images/sanji.jpg"
      },
      {
        name: "艾斯",
        rarity: "史诗",
        probability: 8,
        imageUrl: "/images/ace.jpg"
      },
      {
        name: "白胡子",
        rarity: "传说",
        probability: 2,
        imageUrl: "/images/whitebeard.jpg"
      }
    ]
  },
  {
    name: "迪士尼公主盲盒",
    category: "动漫",
    price: 45,
    soldCount: 856,
    imageUrl: "/images/disney-princess-box.jpg",
    description: "梦幻的迪士尼公主系列，每个公主都有独特的造型和配饰，是收藏家的必备选择。",
    items: [
      {
        name: "白雪公主",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/snow-white.jpg"
      },
      {
        name: "灰姑娘",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/cinderella.jpg"
      },
      {
        name: "贝儿",
        rarity: "稀有",
        probability: 20,
        imageUrl: "/images/belle.jpg"
      },
      {
        name: "爱丽儿",
        rarity: "稀有",
        probability: 15,
        imageUrl: "/images/ariel.jpg"
      },
      {
        name: "艾莎",
        rarity: "史诗",
        probability: 10,
        imageUrl: "/images/elsa.jpg"
      },
      {
        name: "安娜",
        rarity: "传说",
        probability: 5,
        imageUrl: "/images/anna.jpg"
      }
    ]
  },
  {
    name: "漫威英雄盲盒",
    category: "动漫",
    price: 52,
    soldCount: 2341,
    imageUrl: "/images/marvel-box.jpg",
    description: "集结漫威宇宙最强英雄！精致的手办设计，完美还原电影中的经典造型。",
    items: [
      {
        name: "钢铁侠",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/ironman.jpg"
      },
      {
        name: "美国队长",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/captain-america.jpg"
      },
      {
        name: "雷神",
        rarity: "稀有",
        probability: 20,
        imageUrl: "/images/thor.jpg"
      },
      {
        name: "绿巨人",
        rarity: "稀有",
        probability: 15,
        imageUrl: "/images/hulk.jpg"
      },
      {
        name: "蜘蛛侠",
        rarity: "史诗",
        probability: 10,
        imageUrl: "/images/spiderman.jpg"
      },
      {
        name: "奇异博士",
        rarity: "传说",
        probability: 5,
        imageUrl: "/images/doctor-strange.jpg"
      }
    ]
  },
  {
    name: "王者荣耀盲盒",
    category: "游戏",
    price: 35,
    soldCount: 3456,
    imageUrl: "/images/honor-of-kings-box.jpg",
    description: "王者峡谷英雄集结！收集你的专属英雄，每个都有独特的技能展示和精美造型。",
    items: [
      {
        name: "亚瑟",
        rarity: "普通",
        probability: 30,
        imageUrl: "/images/arthur.jpg"
      },
      {
        name: "妲己",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/daji.jpg"
      },
      {
        name: "李白",
        rarity: "稀有",
        probability: 20,
        imageUrl: "/images/libai.jpg"
      },
      {
        name: "貂蝉",
        rarity: "稀有",
        probability: 15,
        imageUrl: "/images/diaochan.jpg"
      },
      {
        name: "韩信",
        rarity: "史诗",
        probability: 8,
        imageUrl: "/images/hanxin.jpg"
      },
      {
        name: "露娜",
        rarity: "传说",
        probability: 2,
        imageUrl: "/images/luna.jpg"
      }
    ]
  },
  {
    name: "宝可梦盲盒",
    category: "动漫",
    price: 42,
    soldCount: 1876,
    imageUrl: "/images/pokemon-box.jpg",
    description: "收集可爱的宝可梦伙伴！每个宝可梦都有不同的属性和技能，快来组建你的队伍吧！",
    items: [
      {
        name: "皮卡丘",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/pikachu.jpg"
      },
      {
        name: "小火龙",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/charmander.jpg"
      },
      {
        name: "杰尼龟",
        rarity: "稀有",
        probability: 20,
        imageUrl: "/images/squirtle.jpg"
      },
      {
        name: "妙蛙种子",
        rarity: "稀有",
        probability: 15,
        imageUrl: "/images/bulbasaur.jpg"
      },
      {
        name: "伊布",
        rarity: "史诗",
        probability: 10,
        imageUrl: "/images/eevee.jpg"
      },
      {
        name: "梦幻",
        rarity: "传说",
        probability: 5,
        imageUrl: "/images/mew.jpg"
      }
    ]
  },
  {
    name: "火影忍者盲盒",
    category: "动漫",
    price: 48,
    soldCount: 987,
    imageUrl: "/images/naruto-box.jpg",
    description: "忍者世界的传奇人物！收集你喜爱的忍者角色，感受忍道的力量。",
    items: [
      {
        name: "鸣人",
        rarity: "普通",
        probability: 30,
        imageUrl: "/images/naruto.jpg"
      },
      {
        name: "佐助",
        rarity: "普通",
        probability: 25,
        imageUrl: "/images/sasuke.jpg"
      },
      {
        name: "小樱",
        rarity: "稀有",
        probability: 20,
        imageUrl: "/images/sakura.jpg"
      },
      {
        name: "卡卡西",
        rarity: "稀有",
        probability: 15,
        imageUrl: "/images/kakashi.jpg"
      },
      {
        name: "自来也",
        rarity: "史诗",
        probability: 8,
        imageUrl: "/images/jiraiya.jpg"
      },
      {
        name: "四代火影",
        rarity: "传说",
        probability: 2,
        imageUrl: "/images/minato.jpg"
      }
    ]
  }
];

// 初始化盲盒数据
const initBlindBoxes = async () => {
  try {
    console.log('🔄 开始初始化盲盒数据...');
    
    // 清空现有数据
    await BlindBox.deleteMany({});
    console.log('🗑️ 清空现有盲盒数据');
    
    // 插入新数据
    const createdBoxes = await BlindBox.insertMany(blindBoxData);
    console.log(`✅ 成功创建 ${createdBoxes.length} 个盲盒`);
    
    return createdBoxes;
  } catch (error) {
    console.error('❌ 初始化盲盒数据失败:', error);
    throw error;
  }
};

// 创建管理员用户
const createAdminUser = async () => {
  try {
    console.log('🔄 检查管理员用户...');
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ 管理员用户已存在');
      return existingAdmin;
    }
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      nickname: '系统管理员',
      coins: 10000,
      points: 5000,
      level: 10,
      experience: 10000
    });
    
    await adminUser.save();
    console.log('✅ 管理员用户创建成功');
    console.log('📝 管理员登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    
    return adminUser;
  } catch (error) {
    console.error('❌ 创建管理员用户失败:', error);
    throw error;
  }
};

// 创建测试用户
const createTestUsers = async () => {
  try {
    console.log('🔄 创建测试用户...');
    
    const testUsers = [
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'test123',
        nickname: '测试用户1',
        coins: 1000,
        points: 500
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'test123',
        nickname: '测试用户2',
        coins: 800,
        points: 300
      }
    ];
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ 创建测试用户: ${userData.username}`);
      } else {
        console.log(`⚠️ 测试用户已存在: ${userData.username}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
    throw error;
  }
};

// 主初始化函数
const initializeData = async () => {
  try {
    console.log('🚀 开始数据初始化...');
    
    await connectDB();
    
    await createAdminUser();
    await createTestUsers();
    await initBlindBoxes();
    
    console.log('🎉 数据初始化完成！');
    console.log('📊 数据统计:');
    
    const userCount = await User.countDocuments();
    const blindBoxCount = await BlindBox.countDocuments();
    
    console.log(`   用户数量: ${userCount}`);
    console.log(`   盲盒数量: ${blindBoxCount}`);
    
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
    process.exit(0);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initializeData();
}

module.exports = {
  initializeData,
  initBlindBoxes,
  createAdminUser,
  createTestUsers
};