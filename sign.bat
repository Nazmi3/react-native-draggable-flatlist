keytool -genkey -v -keystore todo.keystore -alias nazmi -keyalg RSA -keysize 2048 -validity 10000
keytool -importkeystore -srckeystore todo.keystore -destkeystore todo.keystore -deststoretype pkcs12