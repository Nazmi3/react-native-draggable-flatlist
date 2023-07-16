cd android
call gradlew assembleRelease
cd ..
gdrive files upload --parent 0B56-INosSH4sVmFsZFhtNUR6RGM android\app\build\outputs\apk\release\app-release.apk
