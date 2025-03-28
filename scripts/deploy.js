const fs = require('fs').promises;
const path = require('path');

// 目录路径
const PUBLIC_DIR = path.join(__dirname, '../public');
const ROOT_DIR = path.join(__dirname, '..');

// 文件扩展名列表
const HTML_EXTS = ['.html'];
const CSS_EXTS = ['.css'];
const JS_EXTS = ['.js'];
const JSON_EXTS = ['.json'];
const ALL_EXTS = [...HTML_EXTS, ...CSS_EXTS, ...JS_EXTS, ...JSON_EXTS];

// 不需要处理的文件
const EXCLUDE_FILES = ['.DS_Store', 'package.json', 'package-lock.json'];

// 不需要复制的目录
const EXCLUDE_DIRS = ['node_modules', 'scripts', '.git'];

async function copyPublicToRoot() {
  console.log('开始将 public 文件夹内容移动到根目录...');
  
  try {
    // 读取 public 目录下的所有文件和文件夹
    const files = await fs.readdir(PUBLIC_DIR);
    
    for (const file of files) {
      if (EXCLUDE_FILES.includes(file)) continue;
      
      const sourcePath = path.join(PUBLIC_DIR, file);
      const targetPath = path.join(ROOT_DIR, file);
      
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        // 如果是目录，则递归复制
        await copyDirectory(sourcePath, targetPath);
      } else {
        // 如果是文件，直接复制
        await fs.copyFile(sourcePath, targetPath);
        console.log(`复制文件: ${sourcePath} -> ${targetPath}`);
      }
    }
    
    console.log('文件复制完成！');
  } catch (error) {
    console.error('复制过程中发生错误:', error);
  }
}

async function copyDirectory(source, target) {
  const dirName = path.basename(source);
  if (EXCLUDE_DIRS.includes(dirName)) return;
  
  // 创建目标目录
  await fs.mkdir(target, { recursive: true });
  
  // 读取源目录中的所有文件和文件夹
  const files = await fs.readdir(source);
  
  for (const file of files) {
    if (EXCLUDE_FILES.includes(file)) continue;
    
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    const stats = await fs.stat(sourcePath);
    
    if (stats.isDirectory()) {
      // 递归复制子目录
      await copyDirectory(sourcePath, targetPath);
    } else {
      // 复制文件
      await fs.copyFile(sourcePath, targetPath);
      console.log(`复制文件: ${sourcePath} -> ${targetPath}`);
      
      // 如果是需要更新路径的文件类型，则进行处理
      const ext = path.extname(file).toLowerCase();
      if (ALL_EXTS.includes(ext)) {
        await updatePaths(targetPath, ext);
      }
    }
  }
}

async function updatePaths(filePath, fileExt) {
  try {
    // 读取文件内容
    let content = await fs.readFile(filePath, 'utf-8');
    
    // 根据文件类型选择不同的替换模式
    if (HTML_EXTS.includes(fileExt) || CSS_EXTS.includes(fileExt) || JS_EXTS.includes(fileExt)) {
      // 替换引用路径
      content = content.replace(/["']\/?public\//g, '"/')
                       .replace(/["']\/?\/css\//g, '"./css/')
                       .replace(/["']\/?\/js\//g, '"./js/')
                       .replace(/["']\/?\/images\//g, '"./images/')
                       .replace(/["']\/?\/articles\//g, '"./articles/')
                       .replace(/href=["']\//g, 'href="./')
                       .replace(/src=["']\//g, 'src="./');
    }
    
    // 保存更新后的内容
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`更新文件路径: ${filePath}`);
  } catch (error) {
    console.error(`更新文件 ${filePath} 路径时出错:`, error);
  }
}

// 创建 .nojekyll 文件
async function createNojekyllFile() {
  const nojekyllPath = path.join(ROOT_DIR, '.nojekyll');
  try {
    await fs.writeFile(nojekyllPath, '', 'utf-8');
    console.log('创建 .nojekyll 文件成功');
  } catch (error) {
    console.error('创建 .nojekyll 文件失败:', error);
  }
}

// 主函数
async function deploy() {
  console.log('开始部署...');
  await createNojekyllFile();
  await copyPublicToRoot();
  console.log('部署完成！');
}

// 执行部署
deploy(); 