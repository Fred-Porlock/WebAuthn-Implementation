import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';

// 获取按钮
const signupButton = document.querySelector("[data-signup]")
const loginButton = document.querySelector("[data-login]")

// 设置按钮函数
signupButton.addEventListener("click", signup)
loginButton.addEventListener("click", login)

// 服务器地址
const SERVER_URL = "http://localhost:5000"


// TODO: 把status画成制表符格式的日志

async function signup() {
  // 1. Get challenge from server
  logStatus("\nStarting registration process...")
  logStatus("Requesting creation options from server...")
  const initResponse = await fetch(`${SERVER_URL}/init-register`)
  const options = await initResponse.json()

  if(!initResponse.ok) {
    logStatus("Failed to get creation options from server: " + options.error);
    console.error("Error during creation initialization:", options.error);
    return;
  }
  logStatus("Received creation options from server.");

  // 2. Create passkey

  // 2.1 处理options格式
  let publicKeyCredentialCreationOptions = JSON.parse(options)
  // convert urlbase64 to Uint8Array
  publicKeyCredentialCreationOptions.challenge = urlSafeBase64ToUint8Array(publicKeyCredentialCreationOptions.challenge)
  publicKeyCredentialCreationOptions.user.id = urlSafeBase64ToUint8Array(publicKeyCredentialCreationOptions.user.id)

  // show creation options
  showJson("creationOption", publicKeyCredentialCreationOptions)

  // 2.2 create credential
  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  })

  // show credential
  logStatus("Passkey created with creation options.");
  showJson("createdCred", credential)

  // 3. Save passkey in DB
  logStatus("Verifying registration with server...")
  const verifyResponse = await fetch(`${SERVER_URL}/verify-register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential)
  })
  const verifyData = await verifyResponse.json()
  if(!verifyResponse.ok) {
    logStatus("Failed to verify registration: " + verifyData.error);
    console.error("Error during registration verification:", verifyData.error);
  }
  if(verifyData.verified) {
    logStatus("Registration verified by server.");
  } else {
    logStatus("Registration verification failed.");
  }
}

async function login() {
  // 1. Get challenge from server
  logStatus("\nStarting authentication process...")
  logStatus("Requesting authentication options from server...")
  const initResponse = await fetch(`${SERVER_URL}/init-auth`)
  const options = await initResponse.json()

  if(!initResponse.ok) {
    logStatus("Failed to get authentication options from server: " + options.error);
    console.error("Error during authentication initialization:", options.error);
    return;
  }
  logStatus("Received authentication options from server.");

  // 2. Get passkey

  // 2.1 处理options格式
  let publicKeyCredentialRequestOptions = JSON.parse(options)
  // urlbase64 to Uint8Array
  publicKeyCredentialRequestOptions.challenge = urlSafeBase64ToUint8Array(publicKeyCredentialRequestOptions.challenge)
  publicKeyCredentialRequestOptions.allowCredentials[0].id = urlSafeBase64ToUint8Array(publicKeyCredentialRequestOptions.allowCredentials[0].id)

  // show request options
  showJson("requestOption", publicKeyCredentialRequestOptions)

  // 2.2 获取credential
  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions
  })

  // show gotten credential
  logStatus("Passkey retrieved with authentication options.");
  showJson("gottenCred", credential)

  // 3. Verify passkey
  logStatus("Verifying authentication with server...")
  const verifyResponse = await fetch(`${SERVER_URL}/verify-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential)
  })
  const verifyData = await verifyResponse.json()
  if(!verifyResponse.ok) {
    logStatus("Failed to verify authentication: " + verifyData.error);
    console.error("Error during authentication verification:", verifyData.error);
  }
  if(verifyData.verified) {
    logStatus("Authentication verified by server.");
  } else {
    logStatus("Authentication verification failed.");
  }
}

// 显示带语法高亮的JSON对象
function showJson(elementId, object) {
  const element = document.getElementById(elementId);
  const formatted = JSON.stringify(object, replacer, 2);

  const { value: highlightedHtml } = hljs.highlight(formatted, { language: 'json' });

  // 添加高亮样式类
  element.className = 'hljs language-json';

  // 插入生成的带颜色的 HTML 内容
  element.innerHTML = highlightedHtml;
}

// 日志函数，追加消息到status元素
function logStatus(message) {
  const statusElement = document.getElementById("status");
  // 追加消息而不是覆盖
  statusElement.textContent += message + "\n";
}

// convert URL-safe Base64 to Uint8Array
function urlSafeBase64ToUint8Array(base64String) {
    // 将URL安全的Base64转换回标准Base64
    let standardBase64 = base64String
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    // 添加padding（=）如果必要
    const padding = standardBase64.length % 4;
    if (padding) {
        standardBase64 += '='.repeat(4 - padding);
    }
    
    // 解码Base64
    const binaryString = atob(standardBase64);
    
    // 转换为Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return uint8Array;
}

// Convert Uint8Array to Python bytes representation
function uint8ToPyBytes(uint8) {
  let hexParts = [];
  for (let byte of uint8) {
    // toString(16) 转成16进制，例如 0 -> "0"
    let hex = byte.toString(16).padStart(2, '0');
    hexParts.push(`\\x${hex}`);
  }
  return `b"${hexParts.join('')}"`;
}

// JSON replacer function to convert Uint8Array to Python bytes representation
function replacer(key, value) {
  if (value instanceof Uint8Array) {
    return uint8ToPyBytes(value);
  }
  return value;
}