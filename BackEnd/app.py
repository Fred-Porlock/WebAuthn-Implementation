from flask import Flask, request, jsonify
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
    base64url_to_bytes,
)
from webauthn.helpers.cose import COSEAlgorithmIdentifier
from webauthn.helpers.structs import (
    AttestationConveyancePreference,
    AuthenticatorAttachment,
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    PublicKeyCredentialHint,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

app = Flask(__name__)

CLIENT_URL = "http://localhost:5173"
RP_ID = "localhost"
RP_NAME = "WebAuthn Demo"

global challenge
global userInfo

def createUser(user):
    global userInfo
    userInfo = user
    print(f"\nCreating user with ID: {user['id']} and Public Key: {user['pubKey']}")
    return

@app.route('/init-register', methods=['GET'])
def init_register():
    # 1. Generate registration options
    registrationOptions = generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_name="Fred Porlock",
    )
    
    # 2. store the challenge for later verification
    global challenge
    challenge = registrationOptions.challenge

    # 3. 处理格式
    # convert options to JSON string
    registrationOptionsJSON = options_to_json(registrationOptions)

    print(f"\n[Registration Options]\n")
    print(registrationOptionsJSON)

    # convert to JSON
    registrationOptionsJSON = jsonify(registrationOptionsJSON)
    # 解决跨域问题
    registrationOptionsJSON.headers.add('Access-Control-Allow-Origin', '*')

    return registrationOptionsJSON


# 每次Post之前总会有个Options预检请求，所以这里也要处理一下
@app.route('/verify-register', methods=['POST', 'OPTIONS'])
def verify_register():
    if request.method == 'OPTIONS':
        # 处理预检请求
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    else:
        # 处理真正的 POST 请求
        data = request.json
        print("\nReceived data:\n", data)
        
        # 1. 验证
        global challenge
        registrationVerification = verify_registration_response(
            credential = data,
            expected_challenge=challenge,
            expected_origin=CLIENT_URL,
            expected_rp_id=RP_ID
        )

        print("\n[Registration Verification]")
        print(registrationVerification)
        
        if registrationVerification.user_verified:
            # 2. 创建用户
            createUser({
                "id": registrationVerification.credential_id,
                "pubKey": registrationVerification.credential_public_key,
                "counter": registrationVerification.sign_count
            })
            response = jsonify({"verified": registrationVerification.user_verified})
            response.headers.add('Access-Control-Allow-Origin', '*') # 解决跨域问题
            return response

        else:
            response = jsonify({
                "verified": registrationVerification.user_verified,
                'error': 'User verification failed'
            })
            response.headers.add('Access-Control-Allow-Origin', '*') # 解决跨域问题
            return response, 400


@app.route('/init-auth', methods=['GET'])
def init_auth():
    # 1. Generate authentication options
    global userInfo
    authenticationOptions = generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=[PublicKeyCredentialDescriptor(id=userInfo["id"])],
    )
    
    # 2. store the challenge for later verification
    global challenge
    challenge = authenticationOptions.challenge

    # 3. 处理格式
    # convert options to JSON string
    authenticationOptionsJSON = options_to_json(authenticationOptions)

    print(f"\n[Authentication Options]\n")
    print(authenticationOptionsJSON)

    # convert to JSON
    authenticationOptionsJSON = jsonify(authenticationOptionsJSON)
    # 解决跨域问题
    authenticationOptionsJSON.headers.add('Access-Control-Allow-Origin', '*')

    return authenticationOptionsJSON


@app.route('/verify-auth', methods=['POST', 'OPTIONS'])
def verify_auth():
    if request.method == 'OPTIONS':
        # 处理预检请求
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    else:
        # 处理真正的 POST 请求
        data = request.json
        print("\nReceived data:", data)
        
        # 1. 验证
        global challenge
        authenticationVerification = verify_authentication_response(
            credential = data,
            expected_challenge=challenge,
            expected_origin=CLIENT_URL,
            expected_rp_id=RP_ID,
            credential_public_key=userInfo["pubKey"],
            credential_current_sign_count=userInfo["counter"],
        )

        print("\n[Authentication Verification]\n")
        print(authenticationVerification)

        if authenticationVerification.user_verified:
            # 2. 更新计数器
            userInfo["counter"] = authenticationVerification.new_sign_count
            response = jsonify({"verified": authenticationVerification.user_verified})
            response.headers.add('Access-Control-Allow-Origin', '*') # 解决跨域问题
            return response

        else:
            response = jsonify({
                "verified": authenticationVerification.user_verified,
                'error': 'User verification failed'
            })
            response.headers.add('Access-Control-Allow-Origin', '*') # 解决跨域问题
            return response, 400