// API配置常量
const API_CONFIG = {
  VERSION: 'v1',
  PREFIX: '/api',
  get FULL_PREFIX() {
    return `${this.PREFIX}/${this.VERSION}`;
  }
};

module.exports = API_CONFIG;