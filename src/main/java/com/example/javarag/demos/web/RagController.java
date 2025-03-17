package com.example.javarag.demos.web;

import com.example.javarag.demos.web.vo.QueryVO;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.splitter.DocumentByWordSplitter;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import io.swagger.annotations.Api;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Api(value = "RAG知识库", tags = "RAG知识库", description = "RAG测试")
@RestController
public class RagController {

    @Resource
    private ChatLanguageModel chatLanguageModel;
    @Resource
    private EmbeddingModel embeddingModel;
    @Resource
    private ChromaEmbeddingStore embeddingStore;

    @PostMapping("/query")
    public String query(@RequestBody QueryVO queryVO)
    {
        String query = queryVO.getQuery();
        // 将用户问题向量化，并查询向量数据库
        Embedding embedding = embeddingModel.embed(query).content();

        EmbeddingSearchRequest request = new EmbeddingSearchRequest(embedding, 10, 0.5, null);
        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(request);
        List<EmbeddingMatch<TextSegment>> embeddingMatchList = searchResult.matches();

        // 将查询向量数据库中得到的知识库内容和用户的提问信息组成提示词
        String knowledgeContent = embeddingMatchList.stream().map(EmbeddingMatch::embedded).map(TextSegment::text).reduce((s, s2) -> s + "\n" + s2).orElseGet(String::new);
        HashMap<String, Object> params = new HashMap<>();
        params.put("knowledgeContent", knowledgeContent);
        params.put("query", query);
        Prompt prompt = PromptTemplate.from("基于以下知识库内容回答用户问题：\n{{knowledgeContent}}\n用户问题：{{query}}")
                .apply(params);

        // 使用提示词调用LLM模型进行问答
        String chatResult = chatLanguageModel.generate(prompt.text());
//        String chatResult = chatLanguageModel.chat(prompt.text()); // java17后面的版本
        return chatResult;
    }

    @PostMapping("/load-document")
    public String loadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        // 加载文件，并解析出文件内容，这里只解析txt格式的文本，其他的读取方式自行修改
        String text = IOUtils.toString(file.getInputStream(), StandardCharsets.UTF_8);
        Document document = Document.from(text);
        // 文本分块
        DocumentByWordSplitter wordSplitter = new DocumentByWordSplitter(300, 50);
        List<TextSegment> textSegmentList = wordSplitter.split(document);
        // 将所有文本块进行向量化，并存储到向量数据库中
        // 这里使用Chromadb的向量数据库，实际应用中可以替换为第三方的向量数据库
        ArrayList<Embedding> embeddings = new ArrayList<>();
        for (TextSegment textSegment : textSegmentList) {
            // 向量数据库存储
            Embedding embedding = embeddingModel.embed(textSegment).content();
            embeddings.add(embedding);

        }
        embeddingStore.addAll(embeddings, textSegmentList);
        return "success";
    }

}
