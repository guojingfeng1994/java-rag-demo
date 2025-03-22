package com.example.javarag.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import lombok.Getter;
import lombok.Setter;
import okhttp3.OkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import static java.time.Duration.ofSeconds;

@Getter
@Setter
@Configuration
@ConfigurationProperties("demo.config")
public class DemoConfig {

    @Value("${demo.config.ollama.url}")
    private String ollamaUrl;
    @Value("${demo.config.ollama.model.chat}")
    private String ollamaModelChat;
    @Value("${demo.config.ollama.model.embed}")
    private String ollamaModelEmbed;

    @Value("${demo.config.chroma.url}")
    private String chromaUrl;
    @Value("${demo.config.chroma.collection}")
    private String chromaCollection;


    /**
     * 获取语言模型，这里使用ollama服务的chat模型，实际应用中可以替换为第三方的chat模型
     * @return
     */
    @Bean
    @Lazy
    public ChatLanguageModel chatLanguageModel() {
        return OllamaChatModel.builder()
                .baseUrl(ollamaUrl)
                .temperature(0.0) // 模型温度，控制模型生成的随机性，0-1之间，越大越多样性
                .logRequests(true)
                .logRequests(true)
                .logResponses(true)
                .modelName(ollamaModelChat)
                .build();
    }
    /**
     * 获取向量模型，这里使用ollama服务的embedding模型进行向量化，实际应用中可以替换为第三方的embedding模型
     * @return
     */
    @Bean
    @Lazy
    public EmbeddingModel embeddingModel()
    {
        return OllamaEmbeddingModel.builder()
                .baseUrl(ollamaUrl)
                .modelName(ollamaModelEmbed)
                .build();
    }

    /**
     * 获取向量数据库，这里使用Chromadb的向量数据库，实际应用中可以替换为第三方的向量数据库
     * @return
     */
    @Bean
    @Lazy
    public ChromaEmbeddingStore embeddingStore()
    {
        return ChromaEmbeddingStore.builder()
                .baseUrl(chromaUrl)
                .collectionName(chromaCollection)
                .build();
    }

    @Bean
    public OkHttpClient okHttpClient()
    {
        return new OkHttpClient().newBuilder()
                .connectTimeout(ofSeconds(10))
                .readTimeout(ofSeconds(10))
                .writeTimeout(ofSeconds(10))
                .build();
    }
}
