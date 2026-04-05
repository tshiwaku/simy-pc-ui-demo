# SIMY PC UI — デザインアイデア

## 背景・コンテキスト

SIMYは「デジタルツイン」「MyAction」「Agent依頼」「Team Members」「Meetings」の5機能を持つビジネス向けアプリ。
ChatGPTやClaude Codeのようなモダンなサイドバー型PCアプリを参考に、
情報密度が高くても疲れないPC向けUIを設計する。

---

<response>
<text>

## アイデア A: "Structured Clarity" — ドキュメント指向ダッシュボード

**Design Movement**: Swiss International Style × Contemporary SaaS

**Core Principles**:
1. 左サイドバー固定ナビ（幅240px）＋メインコンテンツ＋右ディテールパネルの3カラム構造
2. 情報の重みを余白と境界線の太さで表現（色に頼らない）
3. アクションカードはリスト形式で密度高く表示、選択時に右パネルが展開
4. ステータスバッジは小さく、カラーコードを最小限に

**Color Philosophy**:
- ベース: ニュートラルグレー（#F8F9FA, #FFFFFF）
- サイドバー: 深いスレートグレー（#1E2028）
- アクセント: 単色の青（#2563EB）のみ
- テキスト: チャコール（#111827）
- 感情的意図: 「信頼性と集中」

**Layout Paradigm**:
- 3ペインレイアウト: サイドバー(240px) | リスト(380px) | ディテール(残り)
- サイドバーはアイコン＋ラベルのナビ
- リストペインは検索・フィルター付き
- ディテールパネルはスライドイン

**Signature Elements**:
1. 左ボーダーのカラーバー（ステータスを示す細い縦線）
2. アバターイニシャルの円形バッジ
3. タイムスタンプとステータスの水平配置

**Interaction Philosophy**:
- クリックでディテールパネルが右から展開
- ホバーで背景が微妙に変化（#F3F4F6）
- キーボードナビゲーション対応

**Animation**:
- ディテールパネル: translateX(100%) → 0 (200ms ease-out)
- リストアイテム: opacity 0→1 (100ms stagger)
- ステータス変更: 色のクロスフェード (150ms)

**Typography System**:
- 見出し: "DM Sans" 600/700
- 本文: "DM Sans" 400
- コード/ログ: "JetBrains Mono" 400

</text>
<probability>0.08</probability>
</response>

---

<response>
<text>

## アイデア B: "Ambient Intelligence" — ダークモード・コマンドセンター

**Design Movement**: Terminal Aesthetic × Modern AI Interface (Claude Code / Linear 風)

**Core Principles**:
1. ダークベース（#0D1117）で長時間作業に適した低輝度環境
2. AIエージェントの「動き」を視覚的に表現（パルス、グロー）
3. 情報の優先度を輝度で表現（重要なものほど明るい）
4. コマンドパレット（Cmd+K）でクイックアクション

**Color Philosophy**:
- ベース: ディープネイビー（#0D1117, #161B22）
- サイドバー: さらに暗い（#0A0F14）
- アクセント: エメラルドグリーン（#10B981）＋ブルー（#3B82F6）
- AI実行中: アンバー（#F59E0B）のパルス
- 感情的意図: 「先進性と制御感」

**Layout Paradigm**:
- 左サイドバー(220px) + 中央メインエリア（可変）
- メインエリアはタブ切り替えでなく、縦スクロールのフィード型
- ディテールはモーダルオーバーレイ（背景ブラー付き）

**Signature Elements**:
1. AIエージェントのステータスを示すパルスドット（緑/黄/灰）
2. コードブロック風のログ表示エリア
3. グラスモーフィズムのカードデザイン

**Interaction Philosophy**:
- コマンドパレットでの高速操作
- ドラッグ&ドロップでアクションの優先度変更
- ホバーでツールチップ詳細表示

**Animation**:
- AIパルス: scale 1→1.2→1 (1.5s infinite)
- カード展開: height auto (300ms spring)
- サイドバーアイコン: translateX (-4px→0) on hover

**Typography System**:
- 見出し: "Space Grotesk" 600
- 本文: "Inter" 400
- ログ/コード: "Fira Code" 400

</text>
<probability>0.07</probability>
</response>

---

<response>
<text>

## アイデア C: "Warm Productivity" — ライトモード・エディトリアルダッシュボード

**Design Movement**: Editorial Design × Notion/Linear ハイブリッド

**Core Principles**:
1. ウォームホワイト（#FAFAF8）ベースで目に優しい長時間作業環境
2. 左サイドバー＋メインコンテンツの2カラム、必要時に右パネル展開
3. タイポグラフィの重みで情報階層を表現（サイズ差を大きく取る）
4. カードはフラットだが、選択時にシャドウで浮き上がる

**Color Philosophy**:
- ベース: ウォームオフホワイト（#FAFAF8）
- サイドバー: クリームホワイト（#F5F4F0）
- アクセント: インディゴ（#4F46E5）
- 確認待ち: アンバー（#D97706）
- AI実行中: エメラルド（#059669）
- 感情的意図: 「温かみのある集中環境」

**Layout Paradigm**:
- 左サイドバー(260px) + メインコンテンツ(残り)
- メインは上部にフィルターバー、下にリスト
- 選択アイテムは右サイドシートで詳細表示（オーバーレイなし）
- デジタルツインはメインエリアを全幅で使用

**Signature Elements**:
1. セクション区切りの細い水平線（1px, #E5E3DD）
2. アクションカードの左ボーダーアクセント（4px）
3. ユーザーアバターの温かみのある色合い

**Interaction Philosophy**:
- リストアイテムクリックで右パネルがスライドイン
- フィルタータグのトグル
- ドロップダウンでステータス変更

**Animation**:
- 右パネル: translateX(100%) → 0 (250ms cubic-bezier(0.4, 0, 0.2, 1))
- リストアイテム入場: opacity 0→1 + translateY(8px→0) (150ms)
- フィルタータグ: scale 0.95→1 (100ms)

**Typography System**:
- 見出し: "Sora" 700
- サブ見出し: "Sora" 600
- 本文: "Noto Sans JP" 400
- 数値/コード: "JetBrains Mono" 400

</text>
<probability>0.09</probability>
</response>

---

## 選択: アイデア C — "Warm Productivity"

ビジネス向けツールとして長時間使用に耐えるウォームライトモードを採用。
ChatGPTやLinearに近い感覚でありながら、日本語コンテンツとの相性を重視。
