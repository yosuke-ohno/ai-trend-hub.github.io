#!/usr/bin/env node

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Gemini Pro 初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 高単価キーワード
const highValueKeywords = [
  '投資', '転職', 'プログラミングスクール', 'クレジットカード', 
  '保険', '副業', 'FX', '仮想通貨', 'ローン', '資産運用'
];

// カテゴリ別キーワード
const categories = {
  'テクノロジー': ['AI', 'ChatGPT', 'プログラミング', 'DX', 'IoT', 'ブロックチェーン'],
  'ビジネス': ['副業', '転職', 'スキルアップ', 'リモートワーク', '起業'],
  '投資・金融': ['投資', '株式', 'FX', '仮想通貨', '資産運用', 'NISA'],
  'ライフスタイル': ['健康', '美容', 'ダイエット', '料理', '旅行'],
  'エンターテイメント': ['映画', 'ゲーム', '音楽', 'アニメ', 'YouTube']
};

// 記事生成関数
async function generateArticle(topic, category) {
  const prompt = `
あなたは経験豊富なブログライターです。以下のトピックについて、SEOに最適化された高品質な記事を作成してください。

トピック: ${topic}
カテゴリ: ${category}

記事の要件:
1. 文字数: 2000-3000文字
2. 読者にとって価値のある実用的な内容
3. 見出し構造（H2, H3）を適切に使用
4. 最新の情報を含める
5. 読みやすい文章
6. 結論で行動を促す

記事構成:
- 導入（問題提起）
- 本文（3-4つの見出し）
- まとめ（行動促進）

以下のMarkdown形式で出力してください:

---
layout: post
title: "[記事タイトル]"
date: ${new Date().toISOString().split('T')[0]} 10:00:00 +0900
categories: ${category}
tags: [関連タグ1, 関連タグ2, 関連タグ3]
excerpt: "[記事の要約（100文字程度）]"
---

# [記事タイトル]

[記事本文をここに記載]

## まとめ

[まとめと行動促進]

---

*この記事は最新の情報をもとに作成されています。詳細は公式サイト等でご確認ください。*
`;

  try {
    console.log(`🤖 Gemini Pro で記事生成中: ${topic}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('❌ 記事生成エラー:', error);
    throw error;
  }
}

// ファイル保存関数
function saveArticle(content, topic) {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}-${topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
  const filepath = path.join(__dirname, '..', '_posts', filename);
  
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ 記事保存完了: ${filename}`);
  return filename;
}

// ランダムトピック選択
function getRandomTopic() {
  const categoryKeys = Object.keys(categories);
  const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
  const keywords = categories[randomCategory];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  // 高単価キーワードを優先的に選択（30%の確率）
  if (Math.random() < 0.3) {
    const highValueKeyword = highValueKeywords[Math.floor(Math.random() * highValueKeywords.length)];
    return {
      topic: `${highValueKeyword}の最新トレンドと活用法`,
      category: randomCategory
    };
  }
  
  return {
    topic: `${randomKeyword}の最新動向と今後の展望`,
    category: randomCategory
  };
}

// メイン実行関数
async function main() {
  try {
    // APIキーチェック
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY が設定されていません');
      console.log('💡 .envファイルに GEMINI_API_KEY=your-api-key を追加してください');
      process.exit(1);
    }

    // トピック選択
    const { topic, category } = getRandomTopic();
    console.log(`📝 生成トピック: ${topic} (${category})`);

    // 記事生成
    const article = await generateArticle(topic, category);
    
    // ファイル保存
    const filename = saveArticle(article, topic);
    
    console.log(`🎉 記事生成完了！`);
    console.log(`📄 ファイル: _posts/${filename}`);
    console.log(`🌐 サイト確認: bundle exec jekyll serve`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// コマンドライン引数での実行
if (require.main === module) {
  main();
}

module.exports = { generateArticle, saveArticle, getRandomTopic };