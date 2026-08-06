export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-gray-800">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-light tracking-[0.2em]">Anything</h1>
          <nav className="hidden md:flex gap-8 text-sm text-gray-500">
            <a href="#about" className="hover:text-gray-900 transition">
              サロンについて
            </a>
            <a href="#menu" className="hover:text-gray-900 transition">
              メニュー
            </a>
            <a href="#access" className="hover:text-gray-900 transition">
              アクセス
            </a>
            <a
              href="/reserve"
              className="text-gray-900 border-b border-gray-900 pb-0.5"
            >
              予約
            </a>
          </nav>
          <a
            href="/reserve"
            className="md:hidden text-sm border border-gray-300 px-4 py-2 rounded-full"
          >
            予約
          </a>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <p className="text-xs tracking-[0.35em] text-gray-400 mb-6">
            PRIVATE BEAUTY SALON
          </p>
          <h2 className="text-3xl md:text-5xl font-light leading-relaxed text-gray-900 mb-8">
            美しさと癒しを
            <br />
            あなたの日常へ
          </h2>
          <p className="text-gray-500 mb-12 max-w-md mx-auto leading-relaxed text-sm md:text-base">
            完全個室のプライベート空間で、
            <br />
            あなただけの特別な時間をお過ごしください。
          </p>
          <a
            href="/reserve"
            className="inline-block bg-gray-900 text-white px-12 py-4 rounded-full text-sm tracking-wider hover:bg-gray-700 transition"
          >
            ご予約はこちら
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">ABOUT</p>
          <h3 className="text-2xl font-light mb-8 text-gray-900">サロンについて</h3>
          <p className="text-gray-500 leading-relaxed">
            Anythingは、お客様一人ひとりの美しさと心の休息を大切にする
            プライベート美容サロンです。
            <br />
            <br />
            完全個室で周りを気にせず、プロの施術と丁寧なカウンセリングで
            あなただけの美しさを引き出します。
          </p>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">MENU</p>
            <h3 className="text-2xl font-light text-gray-900">メニュー</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "フェイシャル",
                time: "90分",
                price: "¥12,000",
                desc: "肌質に合わせたオーダーメイドのケア",
              },
              {
                name: "ボディ",
                time: "90分",
                price: "¥15,000",
                desc: "全身の緊張をほぐすリラクゼーション",
              },
              {
                name: "脱毛",
                time: "60分〜",
                price: "¥8,000〜",
                desc: "痛みを抑えた丁寧な脱毛ケア",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="border border-gray-200 rounded-2xl p-8 text-center bg-[#faf9f7] hover:shadow-sm transition"
              >
                <h4 className="text-lg mb-2 text-gray-900">{m.name}</h4>
                <p className="text-gray-400 text-sm mb-1">{m.time}</p>
                <p className="text-gray-900 mb-4 tracking-wide">{m.price}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access + Map */}
      <section id="access" className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">ACCESS</p>
            <h3 className="text-2xl font-light text-gray-900">アクセス</h3>
          </div>

          <div className="text-center text-gray-500 leading-relaxed mb-10">
            <p>東京都○○区○○ 1-2-3</p>
            <p>○○ビル 3F</p>
            <p className="mt-4">営業時間：10:00 - 20:00</p>
            <p>定休日：毎週月曜日</p>
          </div>

          {/* 地図（後で本物の住所に差し替え可能） */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              title="サロン所在地"
              src="https://maps.google.com/maps?q=東京都渋谷区&z=15&output=embed"
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            ※地図は仮の位置です。正式な住所に合わせて変更できます
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-white border-t border-gray-100 text-center">
        <p className="text-gray-500 mb-8 text-sm tracking-wide">
          ご予約・ご相談はこちらから
        </p>
        <a
          href="/reserve"
          className="inline-block bg-gray-900 text-white px-12 py-4 rounded-full text-sm tracking-wider hover:bg-gray-700 transition"
        >
          ご予約はこちら
        </a>
      </section>

      <footer className="border-t border-gray-200 py-10 text-center text-gray-400 text-xs tracking-wider">
        © 2026 Anything. All rights reserved.
      </footer>
    </div>
  );
}