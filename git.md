  
# 1. 查看当前远程仓库配置

```
# 查看当前远程仓库
git remote -v

# 应该显示类似：
# origin  https://github.com/your-username/your-repo-name.git (fetch)
# origin  https://github.com/your-username/your-repo-name.git (push)
```

# 2. 添加国内云服务作为第二个远程仓库

# 添加国内云服务远程仓库（以阿里云Codeup为例）

```
git remote add cloud <https://codeup.aliyun.com/your-cloud-username/your-repo-name.git>

# 或者腾讯云Coding

git remote add cloud <https://your-team.coding.net/p/your-project/d/your-repo-name/git>

# 或者Gitee

git remote add cloud <https://gitee.com/your-gitee-username/your-repo-name.git>

# 查看所有远程仓库

git remote -v
```

# 3. 配置同时推送到两个仓库

```
# 为origin添加第二个push URL（GitHub）
git remote set-url --add --push origin https://github.com/your-username/your-repo-name.git

# 为origin添加国内云服务的push URL
git remote set-url --add --push origin https://codeup.aliyun.com/your-cloud-username/your-repo-name.git

# 验证配置
git remote -v

# 现在push时会同时推送到两个仓库
git push origin main
```
