# v1.3.9

## ✨ What's Changed

- 修复左下角旋转按钮点击一次后消失的问题。
- 修复初始页面点击旋转按钮无反应的问题。
- 修复点击空白处关闭侧栏时，按钮状态不同步的问题。
- 保留左侧调节菜单展开 / 收起能力，且展开时不再遮挡图片区。
- 保留菜单滚动能力，底部宽高等设置项可直接滚动查看。
- 保留“选择图片目录”和拖拽目录导入功能。
- 保留只读导入、另存为保存和导入完成提示逻辑。

## ⚙️ Config

可在顶部配置块中调整导入数量限制与提示参数：

```js
window.APP_CONFIG = window.APP_CONFIG || {
  maxImportImages: 5000,      // 导入总上限
  importWarnThreshold: 1000,  // 超过后弹出继续提示
  importToastDuration: 3400,  // 提示显示时长（毫秒）
};
```

## 📝 Notes

- `maxImportImages`：控制单次导入图片总上限。
- `importWarnThreshold`：超过该数量时先弹出确认提示。
- `importToastDuration`：控制导入完成提示显示时长。

## ✅ Result

本版本主要修复了左下角菜单按钮与初始页侧栏交互问题，其它界面风格与核心功能保持不变。
