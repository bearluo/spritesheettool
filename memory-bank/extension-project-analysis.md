# Cocos Creator 鎵╁睍椤圭洰鐘舵€佸垎鏋?
## 椤圭洰姒傝堪

**鎵╁睍椤圭洰鍚嶇О**: sprite-sheet-tool  
**鎵╁睍椤圭洰璺緞**: E:\\bearluo\\spritesheettool\\sprite-sheet-tool  
**鎵╁睍椤圭洰绫诲瀷**: Cocos Creator 3.8.7 鎵╁睍锛圴ue 3 + Vite + Element Plus锛? 
**鍒涘缓鏃堕棿**: 2025-11-12  
**褰撳墠鐘舵€?*: 妯℃澘椤圭洰宸插垱寤猴紝寰呴泦鎴愮簿鐏靛浘宸ュ叿鍔熻兘

## 椤圭洰缁撴瀯

### 鐩綍缁撴瀯

`
sprite-sheet-tool/
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ browser/
鈹?  鈹?  鈹斺攢鈹€ index.ts          # 鎵╁睍鍏ュ彛锛圢ode.js 鐜锛?鈹?  鈹溾攢鈹€ panels/
鈹?  鈹?  鈹溾攢鈹€ panel.ts          # 闈㈡澘鍏ュ彛
鈹?  鈹?  鈹溾攢鈹€ App.vue           # Vue 鏍圭粍浠?鈹?  鈹?  鈹溾攢鈹€ components/       # Vue 缁勪欢
鈹?  鈹?  鈹?  鈹斺攢鈹€ HelloWorld.vue
鈹?  鈹?  鈹溾攢鈹€ assets/           # 闈欐€佽祫婧?鈹?  鈹?  鈹?  鈹溾攢鈹€ cocos.png
鈹?  鈹?  鈹?  鈹溾攢鈹€ element-plus-logo.svg
鈹?  鈹?  鈹?  鈹溾攢鈹€ vite.svg
鈹?  鈹?  鈹?  鈹斺攢鈹€ vue.svg
鈹?  鈹?  鈹溾攢鈹€ style.css         # 鏍峰紡鏂囦欢
鈹?  鈹?  鈹溾攢鈹€ pina.ts           # Pinia 鐘舵€?鈹?  鈹?  鈹斺攢鈹€ provide-inject.ts # Provide/Inject
鈹?  鈹斺攢鈹€ vite-env.d.ts         # Vite 鐜绫诲瀷
鈹溾攢鈹€ i18n/                     # 鍥介檯鍖栬祫婧?鈹溾攢鈹€ node_modules/             # 渚濊禆鍖?鈹溾攢鈹€ package.json              # 鎵╁睍閰嶇疆
鈹溾攢鈹€ vite.config.ts            # Vite 閰嶇疆
鈹溾攢鈹€ tsconfig.json             # TypeScript 閰嶇疆
鈹溾攢鈹€ tsconfig.app.json         # 搴旂敤 TypeScript 閰嶇疆
鈹溾攢鈹€ tsconfig.node.json        # Node.js TypeScript 閰嶇疆
鈹斺攢鈹€ dist/                     # 鏋勫缓杈撳嚭锛堝緟鏋勫缓锛?`

### 鍏抽敭鏂囦欢

#### 1. package.json
- **main**: ./dist/browser.cjs锛堟墿灞曞叆鍙ｏ級
- **panels.default.main**: ./dist/panel.cjs锛堥潰鏉夸唬鐮侊級
- **scripts.build**: ue-tsc -b && vite build锛堟瀯寤鸿剼鏈級
- **dependencies**: Vue 3, Element Plus
- **devDependencies**: @cocos-fe/vite-plugin-cocos-panel, @cocos/creator-types

#### 2. vite.config.ts
- 浣跨敤 @cocos-fe/vite-plugin-cocos-panel 鎻掍欢
- 閰嶇疆鍙屽叆鍙ｆ瀯寤猴紙browser.cjs 鍜?panel.cjs锛?- 鑷姩瀵煎叆 Element Plus 缁勪欢
- 鏀寔寮€鍙戞ā寮忕洃鍚?
#### 3. src/browser/index.ts
- 鎵╁睍鍏ュ彛鏂囦欢锛圢ode.js 鐜锛?- 瀵煎嚭 open() 鏂规硶鎵撳紑闈㈡澘
- 瀵煎嚭 getVersion() 鏂规硶鑾峰彇鐗堟湰
- 瀵煎嚭 load() 鍜?unload() 鐢熷懡鍛ㄦ湡鏂规硶

#### 4. src/panels/panel.ts
- 闈㈡澘鍏ュ彛鏂囦欢锛堟祻瑙堝櫒鐜锛?- 浣跨敤 Editor.Panel.define() 瀹氫箟闈㈡澘
- 鍒涘缓 Vue 搴旂敤骞舵寕杞藉埌 DOM
- 鎻愪緵 
eady() 鍜?close() 鐢熷懡鍛ㄦ湡鏂规硶

#### 5. src/panels/App.vue
- Vue 鏍圭粍浠?- 浣跨敤 Element Plus 缁勪欢
- 婕旂ず娑堟伅鎻愮ず鍜岀増鏈幏鍙栧姛鑳?
## 鎶€鏈爤

### 鏍稿績渚濊禆
- **Vue 3**: ^3.4.37锛堢粍鍚堝紡 API锛?- **Element Plus**: ^2.8.6锛圲I 缁勪欢搴擄級
- **TypeScript**: ^5.8.2锛堢被鍨嬫敮鎸侊級

### 寮€鍙戜緷璧?- **@cocos-fe/vite-plugin-cocos-panel**: ^1.0.3锛圕ocos Creator 闈㈡澘鎻掍欢锛?- **@cocos/creator-types**: ^3.8.6锛圕ocos Creator 绫诲瀷瀹氫箟锛?- **Vite**: ^5.4.1锛堟瀯寤哄伐鍏凤級
- **vue-tsc**: ^2.1.10锛圱ypeScript 绫诲瀷妫€鏌ワ級
- **unplugin-auto-import**: ^0.18.6锛堣嚜鍔ㄥ鍏ワ級
- **unplugin-vue-components**: ^0.27.5锛堣嚜鍔ㄥ鍏ョ粍浠讹級

## 椤圭洰鐘舵€?
### 宸插畬鎴?- 鉁?鎵╁睍妯℃澘椤圭洰鍒涘缓
- 鉁?鎵╁睍椤圭洰渚濊禆瀹夎
- 鉁?鎵╁睍椤圭洰閰嶇疆姝ｇ‘
- 鉁?鎵╁睍鍏ュ彛鏂囦欢鍒涘缓
- 鉁?闈㈡澘鍏ュ彛鏂囦欢鍒涘缓
- 鉁?闈㈡澘 UI 鍩虹缁撴瀯鍒涘缓

### 寰呭畬鎴?- 鈴?鎵╁睍椤圭洰鏋勫缓锛堥渶瑕佽繍琛?
pm run build锛?- 鈴?绮剧伒鍥惧伐鍏峰姛鑳介泦鎴?- 鈴?鎵撳寘 UI 缁勪欢鍒涘缓
- 鈴?鎷嗗垎 UI 缁勪欢鍒涘缓
- 鈴?鍙嶆媶鍒?UI 缁勪欢鍒涘缓
- 鈴?CLI 妗ユ帴灞傞泦鎴?- 鈴?閿欒澶勭悊瀹屽杽
- 鈴?璧勬簮鍒锋柊鏈哄埗瀹炵幇

## 闆嗘垚璁″垝

### 1. 鏋勫缓鎵╁睍椤圭洰
`ash
cd sprite-sheet-tool
npm run build
`

### 2. 闆嗘垚绮剧伒鍥惧伐鍏峰姛鑳?
#### 2.1 澶嶇敤涓婚」鐩粍浠?- 灏?src/components/ 涓殑缁勪欢澶嶅埗鍒版墿灞曢」鐩?- 灏?src/composables/ 涓殑閫昏緫閫傞厤鍒版墿灞曢」鐩?- 灏?src/utils/ 涓殑宸ュ叿鍑芥暟閫傞厤鍒版墿灞曢」鐩?
#### 2.2 鍒涘缓鎵╁睍闈㈡澘 UI
- 鍒涘缓鎵撳寘瑙嗗浘缁勪欢锛圥ackView.vue锛?- 鍒涘缓鎷嗗垎瑙嗗浘缁勪欢锛圫plitView.vue锛?- 鍒涘缓鍙嶆媶鍒嗚鍥剧粍浠讹紙UnpackView.vue锛?
#### 2.3 闆嗘垚 CLI 妗ユ帴灞?- 鍦ㄦ墿灞曢潰鏉夸腑璋冪敤 scripts/cocos-pack.ts
- 澶勭悊 CLI 鎵ц缁撴灉
- 鍒锋柊 Cocos Creator 璧勬簮搴?
### 3. 娴嬭瘯鎵╁睍鍔熻兘
- 鍦?Cocos Creator 涓姞杞芥墿灞?- 娴嬭瘯鎵撳寘鍔熻兘
- 娴嬭瘯鎷嗗垎鍔熻兘
- 娴嬭瘯鍙嶆媶鍒嗗姛鑳?
## 鎶€鏈寫鎴?
### 1. 缁勪欢澶嶇敤
- **闂**锛氫富椤圭洰缁勪欢浣跨敤娴忚鍣?API锛岄渶瑕侀€傞厤鍒?Cocos Creator 鎵╁睍鐜
- **瑙ｅ喅鏂规**锛氬垱寤洪€傞厤灞傦紝灏嗘祻瑙堝櫒 API 璋冪敤杞崲涓?Cocos Creator API 璋冪敤

### 2. Canvas API 閫傞厤
- **闂**锛氭墦鍖呴€昏緫浣跨敤娴忚鍣?Canvas API锛岄渶瑕侀€傞厤鍒?Node.js 鐜
- **瑙ｅ喅鏂规**锛氫娇鐢?node-canvas 鎴?sharp 澶勭悊鍥剧墖

### 3. 璺緞澶勭悊
- **闂**锛歐indows 璺緞涓?Cocos Creator 椤圭洰璺緞闇€瑕佹纭鐞?- **瑙ｅ喅鏂规**锛氫娇鐢?Editor.Utils.Path 澶勭悊璺緞

### 4. 璧勬簮鍚屾
- **闂**锛氭墦鍖呭悗闇€瑕佸埛鏂?Cocos Creator 璧勬簮搴?- **瑙ｅ喅鏂规**锛氫娇鐢?Editor.Message.request() 璋冪敤璧勬簮鍒锋柊 API

## 涓嬩竴姝ヨ鍔?
1. **鏋勫缓鎵╁睍椤圭洰**锛氳繍琛?
pm run build 鏋勫缓鎵╁睍
2. **娴嬭瘯鎵╁睍鍔犺浇**锛氬湪 Cocos Creator 涓祴璇曟墿灞曟槸鍚﹀彲浠ユ甯稿姞杞?3. **闆嗘垚鎵撳寘鍔熻兘**锛氬皢涓婚」鐩殑鎵撳寘閫昏緫闆嗘垚鍒版墿灞曢潰鏉?4. **闆嗘垚鎷嗗垎鍔熻兘**锛氬皢涓婚」鐩殑鎷嗗垎閫昏緫闆嗘垚鍒版墿灞曢潰鏉?5. **闆嗘垚鍙嶆媶鍒嗗姛鑳?*锛氬皢涓婚」鐩殑鍙嶆媶鍒嗛€昏緫闆嗘垚鍒版墿灞曢潰鏉?6. **瀹屽杽閿欒澶勭悊**锛氭坊鍔犻敊璇彁绀哄拰鏃ュ織杈撳嚭
7. **娴嬭瘯鎵╁睍鍔熻兘**锛氬湪 Cocos Creator 涓祴璇曟墿灞曞姛鑳?
## 鍙傝€冭祫婧?
- Cocos Creator 3.8 鎵╁睍寮€鍙戞枃妗ｏ細https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/
- Cocos Creator 鎻掍欢寮€鍙戞渶浣冲疄璺碉細https://forum.cocos.org/t/topic/163959
- 鎵╁睍寮€鍙戞寚鍗楋細memory-bank/Cocos-Creator-Extension-Guide.md
