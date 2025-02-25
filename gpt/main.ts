// src/main.ts
import { Wllama } from '../node_modules/@wllama/wllama/esm/index.js';


// 定义接口
interface WllamaProgress {
    loaded: number;
    total: number;
}

interface CompletionOptions {
    nPredict: number;
    sampling: {
        temp: number;
        top_k: number;
        top_p: number;
    };
}

// Wllama实例
let wllamaInstance: Wllama | null = null;

// 配置路径
const CONFIG_PATHS = {
    'single-thread/wllama.wasm': '/gpt/wllama/single-thread/wllama.wasm',
    'multi-thread/wllama.wasm': '/gpt/wllama/multi-thread/wllama.wasm',
};

// 初始化Wllama
export async function initWllama(): Promise<Wllama> {
    wllamaInstance = new Wllama(CONFIG_PATHS);
    wllamaInstance.useMultiThread = true;
    wllamaInstance.nbThreads = 4;
    wllamaInstance.useEmbeddings = false;
    return wllamaInstance;
}

// 加载模型
export async function loadModel(
    progressCallback: (progress: WllamaProgress) => void
): Promise<void> {
    if (!wllamaInstance) {
        throw new Error("Wllama未初始化");
    }
    
    await wllamaInstance.loadModelFromHF(
        'mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-Abliterated-dpo-GGUF',
        'DeepSeek-R1-Distill-Qwen-1.5B-Abliterated-dpo.Q2_K.gguf',
        { progressCallback }
    );
}

// 生成文本
export async function generateText(
    prompt: string,
    options: CompletionOptions = {
        nPredict: 50,
        sampling: {
            temp: 0.5,
            top_k: 40,
            top_p: 0.9,
        }
    }
): Promise<string> {
    if (!wllamaInstance) {
        throw new Error("模型未加载");
    }
    
    return await wllamaInstance.createCompletion(prompt, options);
}

// 初始化UI事件
export function initUI(): void {
    // 获取DOM元素
    const loadModelBtn = document.getElementById('loadModel') as HTMLButtonElement;
    const generateBtn = document.getElementById('generate') as HTMLButtonElement;
    const progressElem = document.getElementById('progress') as HTMLDivElement;
    const inputElem = document.getElementById('inputText') as HTMLTextAreaElement;
    const outputElem = document.getElementById('output') as HTMLDivElement;
    
    // 检查元素是否存在
    if (!loadModelBtn || !generateBtn || !progressElem || !inputElem || !outputElem) {
        console.error("找不到必要的DOM元素");
        return;
    }
    
    // 加载模型按钮事件
    loadModelBtn.addEventListener('click', async () => {
        try {
            loadModelBtn.disabled = true;
            progressElem.textContent = '初始化中...';
            
            // 初始化Wllama
            await initWllama();
            
            progressElem.textContent = '开始下载模型...';
            
            // 加载模型
            await loadModel(({ loaded, total }) => {
                const progressPercentage = Math.round((loaded / total) * 100);
                progressElem.textContent = `下载中... ${progressPercentage}%`;
            });
            
            progressElem.textContent = '模型加载完成！';
            generateBtn.disabled = false;
        } catch (error) {
            progressElem.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
            loadModelBtn.disabled = false;
            console.error(error);
        }
    });
    
    // 生成文本按钮事件
    generateBtn.addEventListener('click', async () => {
        try {
            const inputText = inputElem.value.trim();
            if (!inputText) {
                outputElem.textContent = '请输入提示文本！';
                return;
            }
            
            generateBtn.disabled = true;
            outputElem.textContent = '生成中...';
            
            // 生成文本
            const outputText = await generateText(inputText);
            outputElem.textContent = outputText;
        } catch (error) {
            outputElem.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
            console.error(error);
        } finally {
            generateBtn.disabled = false;
        }
    });
}

// 在DOM加载完成后初始化UI
document.addEventListener('DOMContentLoaded', initWllama);