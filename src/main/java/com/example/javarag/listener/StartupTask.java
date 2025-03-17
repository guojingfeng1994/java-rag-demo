package com.example.javarag.listener;

import com.alibaba.fastjson2.JSONObject;
import com.example.javarag.config.DemoConfig;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;

@Component
public class StartupTask implements ApplicationRunner {

    @Autowired
    private DemoConfig demoConfig;
    @Resource
    private OkHttpClient okHttpClient;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 启动时执行的一次性任务
        System.out.println("启动检查chroma集合是否存在任务...");
        // 任务逻辑
        createCollectionIfNotExists();
    }

    private boolean createCollectionIfNotExists() throws IOException {
        // 检查向量数据库中是否存在指定的集合
        String chromaCollection = demoConfig.getChromaCollection();
        // 使用http请求chroma服务器查询集合是否存在
        String url = demoConfig.getChromaUrl() + "/api/v1/collections/" + chromaCollection;

        Request request = new Request
                .Builder()
                .url(url)
                .addHeader("Content-Type", "application/json")
                .get()
                .build();
        Response result = okHttpClient.newCall(request).execute();
        ResponseBody body = result.body();
        JSONObject resultObj = JSONObject.parse(body.string());
        if (resultObj.containsKey("error")) {
            // 如果是{"error":"ValueError('Collection java-rag does not exist.')"}，创建集合
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("name", chromaCollection);
            Request createReq = new Request.Builder()
                    .url(url)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(null, jsonObject.toJSONString()))
                    .build();
            okHttpClient.newCall(request).execute();
            System.out.println("创建集合成功...");
        } else {
            System.out.println("集合已存在...");
        }
        System.out.println("检查集合是否存在任务完成...");
        return true;
    }
}
