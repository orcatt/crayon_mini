# 中版教育

### 文件结构
```
├── node_modules 
├── api: 后端接口集合
│   ├── equList.js: 设备列表接口
│   ├── index.js: 首页接口
│   └── request.js: 封装接口文件
├── components: 组件
│   ├── header: 头部索引组件
│   └── subject: 页面滑动组件
├── node_modules_npm
├── node_modules 
├── page: 页面集合
│   ├── copybook: 字帖
│   │   ├── index: 选择年级课本
│   │   ├── course: 选择课程
│   │   └── browse: 浏览下载字帖
│   ├── courseware: 学习课件
│   │   ├── index: 选择年级课本
│   │   ├── course: 选择课程
│   │   ├── lesson: 课程内容
│   │   ├── readfont: 识字写字
│   │   │   ├── idiom: 成语
│   │   │   ├── poetry: 古诗
│   │   │   │   └── download: 模板下载
│   │   │   ├── terms: 组词
│   │   │   └── word: 字详情
│   │   └── ware: 教学课件
│   ├── index: 首页
│   ├── login: 登录
│   ├── my: 我的
│   │   └── info: 用户完善信息
│   ├── search: 搜索
│   └── VIP: 会员
├── static
│   ├── Courseware: 学习课件图片
│   ├── header: 头部索引组件图片
│   ├── Home: 首页图片
│   ├── Login: 登录图片
│   ├── My: 我的图片
│   ├── poetry: 诗词图片
│   ├── VIP: 会员图片
│   ├── wordDetail: 文字详情图片
│   └── My: 我的
├── utils
│   ├── wxs: wxml文本处理
│   ├── aes.js: 加密源文件
│   ├── Utils.js: aes加密方法封装
│   └── md5: 登录加密
├── .eslintrc: 检测代码一致性
├── .gitignore: git版本管制忽略的配置
├── app.js: 小程序js方法
├── app.json: 小程序json
├── app.wxss: 小程序公共样式
├── jsconfig.json: 根文件配置
├── package.json: 应用包配置文件 
├── package-lock.json:包版本控制文件
├── project.private.config: 编译模式配置文件 
├── README.md: 应用描述文件
└── sitemap.json: 小程序索引
```