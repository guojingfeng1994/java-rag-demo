import {
    Attachments,
    Bubble,
    Conversations,
    Prompts,
    Sender,
    Welcome,
    useXAgent,
    useXChat,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect } from 'react';

import {
    CloudUploadOutlined,
    CommentOutlined,
    EllipsisOutlined,
    FireOutlined,
    HeartOutlined,
    PaperClipOutlined,
    PlusOutlined,
    ReadOutlined,
    ShareAltOutlined,
    SmileOutlined,
} from '@ant-design/icons';
import { Badge, Button, type GetProp, Space } from 'antd';

const renderTitle = (icon: React.ReactElement, title: string) => (
    <Space align="start">
        {icon}
        <span>{title}</span>
    </Space>
);

const defaultConversationsItems = [
    {
        key: '0',
        label: 'What is Ant Design X?',
    },
];

const useStyle = createStyles(({ token, css }) => {
    return {
        layout: css`
      width: 100%;
      min-width: 1000px;
      height: 722px;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
        menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
        conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
        chat: css`
      height: 100vh;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
        messages: css`
      flex: 1;
    `,
        placeholder: css`
      padding-top: 32px;
    `,
        sender: css`
      box-shadow: ${token.boxShadow};
    `,
        logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
        addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
    };
});

const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
    {
        key: '1',
        label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
        description: 'What are you interested in?',
        children: [
            {
                key: '1-1',
                description: `What's new in X?`,
            },
            {
                key: '1-2',
                description: `What's AGI?`,
            },
            {
                key: '1-3',
                description: `Where is the doc?`,
            },
        ],
    },
    {
        key: '2',
        label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Design Guide'),
        description: 'How to design a good product?',
        children: [
            {
                key: '2-1',
                icon: <HeartOutlined />,
                description: `Know the well`,
            },
            {
                key: '2-2',
                icon: <SmileOutlined />,
                description: `Set the AI role`,
            },
            {
                key: '2-3',
                icon: <CommentOutlined />,
                description: `Express the feeling`,
            },
        ],
    },
];

const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
    {
        key: '1',
        description: 'Hot Topics',
        icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
    },
    {
        key: '2',
        description: 'Design Guide',
        icon: <ReadOutlined style={{ color: '#1890FF' }} />,
    },
];

const roles: GetProp<typeof Bubble.List, 'roles'> = {
    ai: {
        placement: 'start',
        typing: { step: 5, interval: 20 },
        styles: {
            content: {
                borderRadius: 16,
            },
        },
    },
    local: {
        placement: 'end',
        variant: 'shadow',
    },
};

const host = 'http://localhost:8080';

async function queryRag(query: string) {
    const queryVO = {
        query: query
    };

    const response = await fetch(`${host}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(queryVO)
    });

    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.text();
    return data;
}


const uploadFile = async (file: File | Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${host}/load-document`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};


const Independent: React.FC = () => {
    // ==================== Style ====================
    const { styles } = useStyle();

    // ==================== State ====================
    const [headerOpen, setHeaderOpen] = React.useState(false);

    const [content, setContent] = React.useState('');

    const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);

    const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);

    const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>(
        [],
    );

    // ==================== Runtime ====================
    const [agent] = useXAgent({
        request: async ({ message }, { onSuccess }) => {
            queryRag(`${message}`)
                .then(result => {
                    console.log('回答:', result)
                    onSuccess(`${result}`);
                })
                .catch(error => console.error('错误:', error));
        },
    });

    const { onRequest, messages, setMessages } = useXChat({
        agent,
    });

    useEffect(() => {
        if (activeKey !== undefined) {
            setMessages([]);
        }
    }, [activeKey]);

    // ==================== Event ====================
    const onSubmit = (nextContent: string) => {
        if (!nextContent) return;
        onRequest(nextContent);
        setContent('');
    };

    const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
        onRequest(info.data.description as string);
    };

    const onAddConversation = () => {
        setConversationsItems([
            ...conversationsItems,
            {
                key: `${conversationsItems.length}`,
                label: `New Conversation ${conversationsItems.length}`,
            },
        ]);
        setActiveKey(`${conversationsItems.length}`);
    };

    const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (key) => {
        setActiveKey(key);
    };

    const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) => {
        console.log("info", info);
        // @ts-ignore
        uploadFile(info.file)
            .then(result => {
                console.log('上传成功:', result);
            })
            .catch(error => console.error('上传失败:', error));
        setAttachedFiles(info.fileList);
    }

    // ==================== Nodes ====================
    const placeholderNode = (
        <Space direction="vertical" size={16} className={styles.placeholder}>

            <Welcome
                variant="borderless"
                title="UI演示说明"
                description="由于只是简单的演示UI，没有使用SSE流式返回，所以回答的速度会比较慢，而且没有保存聊天记录，页面刷新后记录会丢失。
                另外，文件上传之后会自动调用服务器知识库的上传，但是目前没有写清空知识库接口，所以每次重新启动都会重新删除知识库并重建。
                所以重新测试只要重启后台服务器就好了"
            />
            {/*<Prompts*/}
            {/*    title="Do you want?"*/}
            {/*    items={placeholderPromptsItems}*/}
            {/*    styles={{*/}
            {/*        list: {*/}
            {/*            width: '100%',*/}
            {/*        },*/}
            {/*        item: {*/}
            {/*            flex: 1,*/}
            {/*        },*/}
            {/*    }}*/}
            {/*    onItemClick={onPromptsItemClick}*/}
            {/*/>*/}
        </Space>
    );

    const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
        key: id,
        loading: status === 'loading',
        role: status === 'local' ? 'local' : 'ai',
        content: message,
    }));

    const attachmentsNode = (
        <Badge dot={attachedFiles.length > 0 && !headerOpen}>
            <Button type="text" icon={<PaperClipOutlined />} onClick={() => setHeaderOpen(!headerOpen)} />
        </Badge>
    );

    const senderHeader = (
        <Sender.Header
            title="Attachments"
            open={headerOpen}
            onOpenChange={setHeaderOpen}
            styles={{
                content: {
                    padding: 0,
                },
            }}
        >
            <Attachments
                beforeUpload={() => false}
                items={attachedFiles}
                onChange={handleFileChange}
                placeholder={(type) =>
                    type === 'drop'
                        ? { title: 'Drop file here' }
                        : {
                            icon: <CloudUploadOutlined />,
                            title: 'Upload files',
                            description: 'Click or drag files to this area to upload',
                        }
                }
            />
        </Sender.Header>
    );

    const logoNode = (
        <div className={styles.logo}>
            <img
                src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                draggable={false}
                alt="logo"
            />
            <span>Ant Design X</span>
        </div>
    );

    // ==================== Render =================
    return (
        <div className={styles.layout}>
            {/*<div className={styles.menu}>*/}
            {/*    /!* 🌟 Logo *!/*/}
            {/*    {logoNode}*/}
            {/*    /!* 🌟 添加会话 *!/*/}
            {/*    <Button*/}
            {/*        onClick={onAddConversation}*/}
            {/*        type="link"*/}
            {/*        className={styles.addBtn}*/}
            {/*        icon={<PlusOutlined />}*/}
            {/*    >*/}
            {/*        New Conversation*/}
            {/*    </Button>*/}
            {/*    /!* 🌟 会话管理 *!/*/}
            {/*    <Conversations*/}
            {/*        items={conversationsItems}*/}
            {/*        className={styles.conversations}*/}
            {/*        activeKey={activeKey}*/}
            {/*        onActiveChange={onConversationClick}*/}
            {/*    />*/}
            {/*</div>*/}
            <div className={styles.chat}>
                {/* 🌟 消息列表 */}
                <Bubble.List
                    items={items.length > 0 ? items : [{ content: placeholderNode, variant: 'borderless' }]}
                    roles={roles}
                    className={styles.messages}
                />
                {/* 🌟 提示词 */}
                {/*<Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} />*/}
                {/* 🌟 输入框 */}
                <Sender
                    value={content}
                    header={senderHeader}
                    onSubmit={onSubmit}
                    onChange={setContent}
                    prefix={attachmentsNode}
                    loading={agent.isRequesting()}
                    className={styles.sender}
                />
            </div>
        </div>
    );
};

export default Independent;