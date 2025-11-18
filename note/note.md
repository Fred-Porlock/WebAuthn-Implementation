![registration flow](image.png)
![authentication flow](image-1.png)




https://w3c.github.io/webauthn/#iface-pkcredential

https://w3c.github.io/webauthn/#dictionary-client-data

![attestation object](image-2.png)

![assertion signature](image-3.png)

---

https://w3c.github.io/webauthn/#dictionary-makecredentialoptions

```javascript
publicKeyCredentialCreationOptions = {
  "rp": {
    "name": "WebAuthn Demo",
    "id": "localhost"
  },
  "user": {
    "id": byte[<=64],
    "name": "Fred Porlock",
    "displayName": "Fred Porlock"
  },
  "challenge": byte[>=16],
  "pubKeyCredParams": [
    {
      "type": "public-key",
      "alg": -7
    },
    {
      "type": "public-key",
      "alg": -8
    },
    {
      "type": "public-key",
      "alg": -257
    }
  ],
  "timeout": 60000,
  "excludeCredentials": [],
  authenticatorSelection: {
    "authenticatorAttachment": "platform"
  },
  "attestation": "none"
}
```

pubKeyCredParams.alg signature algorithms:  
* -8 (EdDSA)
* -7 (ES256)
* -257 (RS256)  
https://www.iana.org/assignments/cose/cose.xhtml#algorithms

excludeCredentials:  
List any existing credentials mapped to this user account  
Ensure that the new credential is not created on an authenticator that already contains a credential mapped to this user account.
用户已有凭证列表，防止重复创建

attestation:  
* none: the server does not care about attestation
* indirect: the server will allow for anonymized attestation data
* direct: the server wants to receive the attestation data from the authenticator

authenticatorSelection.authenticatorAttachment:
* platform: built-in authenticator (e.g., Touch ID, Windows Hello)
* cross-platform: external authenticator (e.g., YubiKey)

---

```javascript
createdCredential = {
  "id": "FOW3xsouwVfDQ5ibRAE5zAXaEnKI74OFX-sCyNF3_C0",
  "rawId": "b\"\\x14\\xe5\\xb7\\xc6\\xca.\\xc1W\\xc3C\\x98\\x9bD\\x019\\xcc\\x05\\xda\\x12r\\x88\\xef\\x83\\x85_\\xeb\\x02\\xc8\\xd1w\\xfc-\"",
  "type": "public-key",
  "authenticatorAttachment": "platform",
  "response": {
    "clientDataJSON": "b\"{\"type\":\"webauthn.create\",\"challenge\":\"xkkFiwSPSRJknTYpTdpHCxjM6WTJX7Rp88Mc6j9PXML6ModZejbj4lqMf_GShOqBRD8mTqTrphX5RXRMUYOnig\",\"origin\":\"http://localhost:5173\",\"crossOrigin\":false}\"",
    "attestationObject": "b\"\\xa3cfmtdnonegattStmt\\xa0hauthDataX\\xa4I\\x96\\x0d\\xe5\\x88\\x0e\\x8cht4\\x17\\x0fdv`[\\x8f\\xe4\\xae\\xb9\\xa2\\x862\\xc7\\x99\\\\xf3\\xba\\x83\\x1d\\x97cE\\x00\\x00\\x00\\x00\\x08\\x98pX\\xca\\xdcK\\x81\\xb6\\xe10\\xdeP\\xdc\\xbe\\x96\\x00 \\x14\\xe5\\xb7\\xc6\\xca.\\xc1W\\xc3C\\x98\\x9bD\\x019\\xcc\\x05\\xda\\x12r\\x88\\xef\\x83\\x85_\\xeb\\x02\\xc8\\xd1w\\xfc-\\xa5\\x01\\x02\\x03& \\x01!X \\xe3\\xc7\\xc1\\xfb\\xbb\\xbb\\x8cF\\x84\\xd3\\x93u\\x84\\xfc\\xe6\\xe66\\x1f;\\x17\\x06\\xff%\\xf50Q\\xbc\\xbc\\xce=\\x9e\\xb9\"X \\xa6\\xde\\x14\\xbft*\\x0b\\xba\\xeb\\xd5\\xd7\\xd7\\x98\\x84?\\x8c\\x87\\x0d\\xc02\\xf3YBh=\\xbc\\xa5}\\x98\\xb8=r\""
  }
}
```

id:  
base64url encoding of rawId

authenticatorAttachment:
* platform
* cross-platform

```javascript
clientDataJSON = {
  "type": "webauthn.create",
  "challenge": "xkkFiwSPSRJknTYpTdpHCxjM6WTJX7Rp88Mc6j9PXML6ModZejbj4lqMf_GShOqBRD8mTqTrphX5RXRMUYOnig",
  "origin": "http://localhost:5173",
  "crossOrigin": false
}
```

type:
* webauthn.create
* webauthn.get

challenge:
base64url encoding of the challenge sent from the server

```javascript
attestationObject = {
  "fmt": "none",
  "attStmt": {},
  "authData": "b\"I\\x96\\x0d\\xe5\\x88\\x0e\\x8cht4\\x17\\x0fdv`[\\x8f\\xe4\\xae\\xb9\\xa2\\x862\\xc7\\x99\\\\xf3\\xba\\x83\\x1d\\x97cE\\x00\\x00\\x00\\x00\\x08\\x98pX\\xca\\xdcK\\x81\\xb6\\xe10\\xdeP\\xdc\\xbe\\x96\\x00 U\\x16y\\xb1U\\x87\\xf0\\xd1C\\xfdD\\xbc<\\x08G\\xe8\\xccO\\xd0V\\xbc+\\xb0\"Ir\\x95%\\xa4W\\x1d\\x02\\xa5\\x01\\x02\\x03& \\x01!X \\xf1\\xe1\\xa1\\xf2\\x8d\\xeb(\\x1df\\xfe^\\xab7oV\\xa4\\xff\\xf1\\x15\\xfd\\xe4\\xf7`\\x044\\x9bp\\x94\\xfe\\x08\\x98J\"X \\xcf\\xceOx\\x92.~bf\\x0dR\\xb7\\xa7\\xc9\\x99Y\\x81\\x8eu\\xb7\\x9a\\x0a\\xc5\\x8c\\xf2Ku\\xf9+\\x1c\\x14o\""
}
```

fmt:
Attestation Statement Format
取决于认证器类型和厂商，以及PublicKeyCredentialCreationOptions中的attestation字段。
none: no attestation statement, attStmt = {}
不收集/验证设备来源
fmt为none时，没有对challenge等的签名。

attStmt:
Attestation Statement
表明该公钥是由某个特定的认证器硬件/厂商颁发，并可由依赖方验证其真实性。
fmt为packed时，包含alg,sig,x5c。x5c是证书链（可选项）。
**sig为对authData和clientDataJSON的哈希的签名。**

```javascript
authData = {
  "rpIdHash": byte[32],
  "flags": "0b01000101",
  "signCount": 0,
  "attestedCredentialData": {
    "aaguid": byte[16],
    "credentialIdLength": L,
    "credentialId": byte[L],
    "credentialPublicKey": {
      "kty": 2,
      "alg": -7,
      "crv": 1,
      "x": "b\"z\\x1f\\xe8\\xf9}6\\x14\\x8cm\\xff\\x86*#\\x04\\xf0\\xa0\\xfd\\xc9\\xf0\\xb0\\x8f\\xc9\\xf9\\xa7]}T!=Q{\\xe1\"",
      "y": "b\"*\\x97z9\\xd9S\\xff\\xfb\\x88O\\x10\\xe5m\\xfa\\x8d\\x11\\x1c\\xda\\xdf\\xa9E\\xfa\\x91\\x89\\x8a\\xc4\\xb4!\\xe1\\x96\\xc2(\""
    }
  }
}
```

signCount:
Signature Counter

attestedCredentialData.aaguid:
authenticator Attestation globally unique identifier

---

```javascript
publicKeyCredentialRequestOptions = {
  "challenge": "b\"\\x89T\\xd4\\x98\\xb6\\xe2u\\x9dH?evv\\x87\\xc2\\x81\\x8a\\V\\x0c\\x13\\xec\\x81\\xfcD)\\x0d\\x11C\\x19\\x1a\\xd8;\\xff\\x0d\\x11\\xae\\xb0\\x11\\x88\\xd5\\x1e\\xdf_]\\xed\\x91\\xf1\\xf1\\x1f\\x15\\xb6\\x1b1)\\x97\\x82\\xe8\\xed\\x1f\\xe0&e`\"",
  "timeout": 60000,
  "rpId": "localhost",
  "allowCredentials": [
    {
      "id": "b\"A\\xb8\\x80,-\\xcb<\\xf1^\\x06\\xc3Ccu\\xa3/\\x8b\\x01\\xd2\\x90Km\\xa4\\xe7\\xc5\\xc1\\xd5\\xf3\\x1a\\xe5\\xfeF\"",
      "type": "public-key"
    }
  ],
  "userVerification": "preferred"
}
```

```javascript
gottenCredential = {
  "id": "Fjmx0rKDOfNM4_rVUkn9JcSqjHyiouRRnqyjkBnl4Ew",
  "rawId": "b\"\\x169\\xb1\\xd2\\xb2\\x839\\xf3L\\xe3\\xfa\\xd5RI\\xfd%\\xc4\\xaa\\x8c|\\xa2\\xa2\\xe4Q\\x9e\\xac\\xa3\\x90\\x19\\xe5\\xe0L\"",
  "type": "public-key",
  "authenticatorAttachment": "platform",
  "response": {
    "clientDataJSON": "b\"{\"type\":\"webauthn.get\",\"challenge\":\"2tVVjhH_k4sCS2bz7XIeVQUb5HVMGeSwChbIJyibuobpXWiSWHocd013W7u31m7f5yizUF9Rejl6lXaxT5dH_A\",\"origin\":\"http://localhost:5173\",\"crossOrigin\":false,\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://permanently-removed.invalid/yabPex\"}\"",
    "authenticatorData": "b\"I\\x96\\x0d\\xe5\\x88\\x0e\\x8cht4\\x17\\x0fdv`[\\x8f\\xe4\\xae\\xb9\\xa2\\x862\\xc7\\x99\\\\xf3\\xba\\x83\\x1d\\x97c\\x05\\x00\\x00\\x00\\x01\"",
    "signature": "b\"0E\\x02!\\x00\\xa0\\xa4\\x7f\\xd2\\xe8C\\xeb\\xf9\\x80F|x(\\xbe!RS\\x11p\\x9e\\x925\\x17.\\xadE\\x0e\\x97\\xd5\\xc0[\\xee\\x02 \\x06V\\xf1]7\\xab[Y\\x9ch\\x041|\\x96\\x11a\\xd1\\x00\\x8a\\x1f\\xf6T\\x10F2\\x86\\xea\\x173\\x0c2\\xdd\"",
    "userHandle": "b\"i\\x1d8m\\x02\\xbf\\xb4\\xe1#\\x10#\\x8f\\x9e\\x83\\xdc\\x0dc\\x1d\\x8c\\xe3\\xb7a\\xb0\\x8a+\\x00[?z\\xa8fF\\x8a\\x87\\x8f\\x80\\xcb5{\\xe9\\xff$\\xec\\x9a\\x92\\x9a\\xeaDH\\x1c\\xae\\x92[\\x0b\\x1b\\xcc\\x96\\xce(\\xfc\\xe0\\xe6\\x09\\xfb\""
  }
}
```

response.userHandle:
publicKeyCredentialCreationOptions.user.id

```javascript
clientDataJSON = {
  "type": "webauthn.get",
  "challenge": "2U-AVEA5aIbkfk6neONSnuGp5ZkcZqJ7xCyDP29wyqeb9zjkNh9Seml27Ixao-fATfCDgRf0yUJ5etKIQqcF6w",
  "origin": "http://localhost:5173",
  "crossOrigin": false,
  "other_keys_can_be_added_here": "do not compare clientDataJSON against a template. See https://permanently-removed.invalid/yabPex"
}
```

```javascript
authenticatorData = {
  "rpIdHash": "b\"I\\x96\\x0d\\xe5\\x88\\x0e\\x8cht4\\x17\\x0fdv`[\\x8f\\xe4\\xae\\xb9\\xa2\\x862\\xc7\\x99\\\\xf3\\xba\\x83\\x1d\\x97c\"",
  "flags": "0b00000101",
  "signCount": 1
}
```

authenticatorData:
Credential.response.attestationObject.authData for registration