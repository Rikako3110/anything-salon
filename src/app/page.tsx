export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wider">Anything</h1>
        <nav className="hidden md:flex gap-8 text-sm text-gray-300">
          <a href="#about" className="hover:text-white">
            サロンについて
          </a>
          <a href="#menu" className="hover:text-white">
            メニュー
          </a>
          <a href="#access" className="hover:text-white">
            アクセス
          </a>
        </nav>
      </header>

      {/* メインビジュアル */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">
          PRIVATE BEAUTY SALON
        </p>
        <h2 className="text-4xl md:text-6xl font-light leading-tight mb-6">
          美しさと癒しを
          <br />
          あなたの日常へ
        </h2>
        <p className="text-gray-400 mb-10 max-w-md leading-relaxed">
          完全個室のプライベート空間で、
          <br />
          あなただけの特別な時間をお過ごしください。
        </p>
        <a
          href="/reserve"
          className="bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-gray-200 transition"
        >
          予約する
        </a>
      </section>

      {/* サロンについて */}
      <section id="about" className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h3 className="text-2xl mb-6 tracking-wide">About</h3>
        <p className="text-gray-400 leading-relaxed">
          Anythingは、お客様一人ひとりの美しさと心の休息を大切にする
          プライベート美容サロンです。
          <br />
          <br />
          完全個室で周りを気にせず、プロの施術と丁寧なカウンセリングで
          あなただけの美しさを引き出します。
        </p>
      </section>

      {/* メニュー */}
      <section id="menu" className="px-6 py-20 bg-gray-950">
        <h3 className="text-2xl text-center mb-12 tracking-wide">Menu</h3>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="border border-gray-800 rounded-2xl p-8 text-center">
            <h4 className="text-xl mb-3">フェイシャル</h4>
            <p className="text-gray-400 text-sm mb-2">90分</p>
            <p className="text-white mb-4">¥12,000</p>
            <p className="text-gray-500 text-sm">
              肌質に合わせたオーダーメイドのケア
            </p>
          </div>
          <div className="border border-gray-800 rounded-2xl p-8 text-center">
            <h4 className="text-xl mb-3">ボディ</h4>
            <p className="text-gray-400 text-sm mb-2">90分</p>
            <p className="text-white mb-4">¥15,000</p>
            <p className="text-gray-500 text-sm">
              全身の緊張をほぐすリラクゼーション
            </p>
          </div>
          <div className="border border-gray-800 rounded-2xl p-8 text-center">
            <h4 className="text-xl mb-3">脱毛</h4>
            <p className="text-gray-400 text-sm mb-2">60分〜</p>
            <p className="text-white mb-4">¥8,000〜</p>
            <p className="text-gray-500 text-sm">痛みを抑えた丁寧な脱毛ケア</p>
          </div>
        </div>
      </section>

      {/* アクセス */}
      <section id="access" className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h3 className="text-2xl mb-6 tracking-wide">Access</h3>
        <p className="text-gray-400 leading-relaxed">
          東京都○○区○○ 1-2-3
          <br />
          ○○ビル 3F
          <br />
          <br />
          営業時間：10:00 - 20:00
          <br />
          定休日：毎週月曜日
        </p>
      </section>

      {/* 予約CTA */}
      <section className="px-6 py-16 text-center border-t border-gray-800">
        <p className="text-gray-400 mb-6">ご予約はこちらから</p>
        <a
          href="/reserve"
          className="bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-gray-200 transition"
        >
          予約する
        </a>
      </section>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        © 2026 Anything. All rights reserved.
      </footer>
    </div>
  );
}