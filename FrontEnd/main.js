const signupButton = document.querySelector("[data-signup]")
const loginButton = document.querySelector("[data-login]")

signupButton.addEventListener("click", signup)
loginButton.addEventListener("click", login)

const SERVER_URL = "http://localhost:5000"


async function signup() {
  // 1. Get challenge from server
  const initResponse = await fetch(`${SERVER_URL}/init-register`)
  const options = await initResponse.json()

  if(!initResponse.ok) {
    myLog("status", options.error, "Error during registration initialization:", options.error);
  }

  // 2. Create passkey

  // 2.1 处理options格式
  let publicKeyCredentialCreationOptions = JSON.parse(options)
  // urlbase64 to Uint8Array
  publicKeyCredentialCreationOptions.challenge = urlSafeBase64ToUint8Array(publicKeyCredentialCreationOptions.challenge)
  publicKeyCredentialCreationOptions.user.id = urlSafeBase64ToUint8Array(publicKeyCredentialCreationOptions.user.id)

  myLog("creationOption", options, "publicKeyCredentialCreationOptions:", publicKeyCredentialCreationOptions)

  // const publicKeyCredentialCreationOptions = {
  //   challenge: new Uint8Array([0,1,2,3,4,5,6,7,8,9,10]),
  //   rp: {
  //     name: "Example FIDO RP",
  //   },
  //   user: {
  //     id: new Uint8Array(16),
  //     name: email,
  //     displayName: "bob"
  //   },
  //   pubKeyCredParams: [{alg: -7, type: "public-key"}]
  // }

  // 2.2 创建credential
  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  })

  myLog("createdCred", JSON.stringify(credential), "Created credential:", credential)

  // 3. Save passkey in DB
  const verifyResponse = await fetch(`${SERVER_URL}/verify-register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential)
  })
  const verifyData = await verifyResponse.json()
  if(!verifyResponse.ok) {
    myLog("status", verifyData.error, "Error during registration verification:", verifyData.error);
  }
  if(verifyData.verified) {
    myLog("status", "Successfully registered")
  } else {
    myLog("status", "Failed to register")
  }
}

async function login() {
  // 1. Get challenge from server
  const initResponse = await fetch(`${SERVER_URL}/init-auth`)
  const options = await initResponse.json()

  if(!initResponse.ok) {
    myLog("status", options.error, "Error during registration initialization:", options.error);
  }

  // 2. Get passkey

  // 2.1 处理options格式
  let publicKeyCredentialRequestOptions = JSON.parse(options)
  // urlbase64 to Uint8Array
  publicKeyCredentialRequestOptions.challenge = urlSafeBase64ToUint8Array(publicKeyCredentialRequestOptions.challenge)
  publicKeyCredentialRequestOptions.allowCredentials[0].id = urlSafeBase64ToUint8Array(publicKeyCredentialRequestOptions.allowCredentials[0].id)

  myLog("requestOption", options, "publicKeyCredentialRequestOptions:", publicKeyCredentialRequestOptions)

  // const publicKeyCredentialRequestOptions = {
  //   challenge: new Uint8Array([0,1,2,3,4,5,6,7,8,9,10]),
  //   allowCredentials: [{
  //     type: "public-key",
  //     id: rawId
  //   }]
  // }

  // 2.2 获取credential
  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions
  })

  myLog("gottenCred", JSON.stringify(credential), "Gotten credential:", credential)

  // 3. Verify passkey
  const verifyResponse = await fetch(`${SERVER_URL}/verify-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential)
  })
  const verifyData = await verifyResponse.json()
  if(!verifyResponse.ok) {
    myLog("status", verifyData.error, "Error during authentication verification:", verifyData.error);
  }
  if(verifyData.verified) {
    myLog("status", "Successfully logged in")
  } else {
    myLog("status", "Failed to log in")
  }
}

function showModalText(text) {
  modal.querySelector("[data-content]").innerText = text
  modal.showModal()
}

// 显示消息到html的id元素中。同时在控制台log一下数据
// 控制台看数据方便一点，但是比较乱
function myLog(elementId, message, description="", data=null) {
  document.getElementById(elementId).innerHTML = message;
  if (data !== null) {
    console.log(description);
    console.log(data);
  }
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