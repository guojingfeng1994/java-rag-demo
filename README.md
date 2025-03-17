### 基于langchain4j实现的RAG项目
* langchain4j从0.36.0版本开始已经不再支持java8，这里使用0.35.0的最后一个支持java8的版本来作为参考。
~~* 前段项目使用ant-design-x实现~~

### 运行项目
* 后端：直接使用IDEA加载项目，等待Maven依赖下载完成后运行JavaRagApplication即可。
    启动前需要提前安装chromaDB和ollama，并提前用ollama将quentinz/bge-large-zh-v1.5和deepseek-r1拉取到本地，或者在配置文件中修改你需要的模型
~~* 前端：需要使用pnpm install安装依赖，然后使用pnpm run dev启动项目即可，没有pnpm的需要先试用npm install -g pnpm安装pnpm~~
